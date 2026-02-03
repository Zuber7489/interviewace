import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envPath = path.resolve(__dirname, '../../config.env');
dotenv.config({ path: envPath });

const API_KEY = process.env.API_KEY;

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Generating interview report...');
    const { history } = req.body;

    if (!history || !Array.isArray(history) || history.length === 0) {
      console.error('Invalid or empty history received:', history);
      return res.status(400).json({ error: 'Invalid or empty interview history' });
    }

    console.log(`Processing report for ${history.length} turns...`);

    if (!API_KEY) {
      throw new Error('API_KEY not configured');
    }

    const client = new GoogleGenAI({ apiKey: API_KEY });

    const systemInstruction = "You are an interview result summarizer. Your task is to extract ACTUAL answers from the provided history and grade them. STRICT RULES: 1. You must ONLY use text explicitly present in the 'user' role messages within the history as the candidate's answer. 2. If the user did not provide an answer to a question, or if the history shows no response, set the 'answer' field to 'No answer provided' and the score to 0. 3. DO NOT invent, hallucinate, or infer answers that represent what a candidate 'might' have said. 4. If the candidate was silent, non-responsive, or said very little, the Overall Score MUST be 0. 5. Do not generate positive feedback for missing answers. Your response must be a single JSON object.";

    const finalPrompt = {
      role: 'user',
      parts: [{ text: 'The interview is now over. Please analyze our entire conversation and provide the final summary, overall score, and per-question breakdown.' }]
    };

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [...history, finalPrompt],
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            overallFeedback: {
              type: 'STRING',
              description: "A comprehensive summary of the candidate's performance, highlighting strengths and areas for improvement."
            },
            overallScore: {
              type: 'NUMBER',
              description: 'A final score for the interview, out of 100.'
            },
            evaluatedQuestions: {
              type: 'ARRAY',
              description: "A detailed breakdown of each question in the interview.",
              items: {
                type: 'OBJECT',
                properties: {
                  question: { type: 'STRING', description: "The question asked by the interviewer." },
                  answer: { type: 'STRING', description: "The candidate's transcribed answer." },
                  feedback: { type: 'STRING', description: "Specific feedback on the candidate's answer." },
                  score: { type: 'NUMBER', description: "A score for the answer from 0 to 10." }
                },
                required: ["question", "answer", "feedback", "score"]
              }
            }
          },
          required: ['overallFeedback', 'overallScore', 'evaluatedQuestions'],
        },
      },
    });

    console.log('Report generated successfully');
    const jsonResponse = JSON.parse(response.text || '{}');
    res.json(jsonResponse);

  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({
      error: 'Failed to generate report',
      details: error.message
    });
  }
}
