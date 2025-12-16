import { Injectable } from '@angular/core';
import { GoogleGenAI, Type, Content } from '@google/genai';
import { EvaluatedQuestion } from '../models';

import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    if (!environment.API_KEY) {
      throw new Error('API_KEY environment variable not set');
    }
    // FIX: Removed invalid `transport` property from `GoogleGenAI` options.
    this.ai = new GoogleGenAI({ apiKey: environment.API_KEY });
  }

  async generateFinalFeedback(history: Content[]): Promise<{ overallFeedback: string; overallScore: number; evaluatedQuestions: Omit<EvaluatedQuestion, 'type'>[] }> {
    const systemInstruction = "You are an interview result summarizer. Based on the provided interview chat history, your task is to provide comprehensive overall feedback for the candidate, calculate a final score out of 100, and provide a detailed breakdown for each question. For each question, provide the question text, the candidate's answer, specific feedback on that answer, and a score from 0 to 10. Your response must be a single JSON object.";

    const finalPrompt: Content = {
      role: 'user',
      parts: [{ text: 'The interview is now over. Please analyze our entire conversation and provide the final summary, overall score, and per-question breakdown.' }]
    };

    const maxRetries = 3;
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        const response = await this.ai.models.generateContent({
          model: 'gemini-2.0-flash', // using a stable model alias if possible or keeping generic
          contents: [...history, finalPrompt],
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                overallFeedback: {
                  type: Type.STRING,
                  description: "A comprehensive summary of the candidate's performance, highlighting strengths and areas for improvement."
                },
                overallScore: {
                  type: Type.NUMBER,
                  description: 'A final score for the interview, out of 100.'
                },
                evaluatedQuestions: {
                  type: Type.ARRAY,
                  description: "A detailed breakdown of each question in the interview.",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      question: { type: Type.STRING, description: "The question asked by the interviewer." },
                      answer: { type: Type.STRING, description: "The candidate's transcribed answer." },
                      feedback: { type: Type.STRING, description: "Specific feedback on the candidate's answer." },
                      score: { type: Type.NUMBER, description: "A score for the answer from 0 to 10." }
                    },
                    required: ["question", "answer", "feedback", "score"]
                  }
                }
              },
              required: ['overallFeedback', 'overallScore', 'evaluatedQuestions'],
            },
          },
        });

        try {
          return JSON.parse(response.text || '{}');
        } catch (e) {
          console.error('Failed to parse JSON for final feedback:', response.text, e);
          throw new Error('JSON Parse Error');
        }

      } catch (error: any) {
        attempt++;
        console.warn(`Gemini API attempt ${attempt} failed:`, error);

        // Check for 503 or overload errors
        if (attempt < maxRetries && (error.status === 503 || error.code === 503 || error.message?.includes('overloaded'))) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        if (attempt === maxRetries) {
          // Return fallback structure instead of throwing to prevent app crash if we want internal handling, 
          // BUT the user asked for graceful failure in component.
          // Let's throw here so component can catch and decide, OR return a default error object.
          // Returning default error object is safer for "Graceful Failure" inside service.
          return {
            overallFeedback: 'Review generation failed due to high server traffic. Please review the chat history manually.',
            overallScore: 0,
            evaluatedQuestions: []
          };
        }
      }
    }

    // Should be unreachable due to return in loop, but TS needs it
    return {
      overallFeedback: 'Review generation failed.',
      overallScore: 0,
      evaluatedQuestions: []
    };



  }
}
