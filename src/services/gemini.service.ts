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
    // Initialized lazily or with ephemeral token
  }

  async generateFinalFeedback(history: Content[]): Promise<{ overallFeedback: string; overallScore: number; evaluatedQuestions: Omit<EvaluatedQuestion, 'type'>[] }> {
    // Enforce a 30-second timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch(`${environment.backendUrl}/api/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'omit', // Never send cookies to backend
        signal: controller.signal,
        body: JSON.stringify({ history })
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Backend report generation failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result;

    } catch (error: any) {
      clearTimeout(timeoutId);
      return {
        overallFeedback: 'Review generation failed. Please try again later.',
        overallScore: 0,
        evaluatedQuestions: []
      };
    }
  }
}
