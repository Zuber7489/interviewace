import { GoogleGenAI } from '@google/genai';

export const handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'API_KEY not configured' }) };
    }

    const body = JSON.parse(event.body || '{}');
    const { history } = body;

    if (!history || !Array.isArray(history) || history.length === 0) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid or empty interview history' }) };
    }

    const client = new GoogleGenAI({ apiKey: API_KEY });

    const systemInstruction = `You are an interview result summarizer. Your task is to extract ACTUAL answers from the provided history and grade them. STRICT RULES: 
1. You must ONLY use text explicitly present in the 'user' role messages within the history as the candidate's answer. 
2. If the user did not provide an answer to a question, or if the history shows no response, set the 'answer' field to 'No answer provided' and the score to 0. 
3. DO NOT invent, hallucinate, or infer answers that represent what a candidate 'might' have said. 
4. If the candidate was silent, non-responsive, or said very little, the Overall Score MUST be 0. 
5. Do not generate positive feedback for missing answers. 
6. IMPORTANT: The interviewer (model) may sometimes state its intentions or make statements instead of asking a formalized question (e.g., "I'm moving forward with a scenario about X"). Treat the interviewer's statement as the question. AND CRITICALLY: Whatever the user (candidate) says immediately after MUST be recorded as their 'answer', regardless of whether the interviewer asked a direct question. Never reject a user's text. If the user spoke, capture their exact words in the 'answer' field.
Your response must be a single JSON object.`;

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
            overallFeedback: { type: 'STRING' },
            overallScore: { type: 'NUMBER' },
            evaluatedQuestions: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  question: { type: 'STRING' },
                  answer: { type: 'STRING' },
                  feedback: { type: 'STRING' },
                  score: { type: 'NUMBER' }
                },
                required: ["question", "answer", "feedback", "score"]
              }
            }
          },
          required: ['overallFeedback', 'overallScore', 'evaluatedQuestions'],
        },
      },
    });

    return {
      statusCode: 200,
      headers,
      body: response.text
    };

  } catch (error) {
    console.error('Error generating report:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to generate report',
        details: error.message
      })
    };
  }
};
