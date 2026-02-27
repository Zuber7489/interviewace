import { GoogleGenAI } from '@google/genai';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// --- Server-Side Firebase Admin Initialization ---
let adminApp;
if (!getApps().length) {
  adminApp = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
} else {
  adminApp = getApps()[0];
}

// --- Allowed Origin Whitelist ---
const ALLOWED_ORIGINS = [
  process.env.APP_ORIGIN || 'https://scoremyinterview.netlify.app',
  'http://localhost:4200',
];

function getCorsHeaders(requestOrigin) {
  const origin = ALLOWED_ORIGINS.includes(requestOrigin) ? requestOrigin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Vary': 'Origin',
  };
}

// --- Input Sanitization Limits ---
const MAX_HISTORY_ITEMS = 100;
const MAX_TEXT_LENGTH = 1500; // per message part

export const handler = async (event) => {
  const requestOrigin = event.headers?.origin || event.headers?.Origin || '';
  const headers = getCorsHeaders(requestOrigin);

  // --- Handle CORS Preflight ---
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // --- 1. Verify Firebase Auth Token ---
  const authHeader = event.headers?.authorization || event.headers?.Authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized: Missing token' }) };
  }
  const idToken = authHeader.split('Bearer ')[1];

  try {
    await getAuth(adminApp).verifyIdToken(idToken);
  } catch (err) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized: Invalid token' }) };
  }

  // --- 2. Parse and Validate Payload ---
  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const { history } = body;

  if (!history || !Array.isArray(history) || history.length === 0) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid or empty interview history' }) };
  }

  // Enforce size limits to prevent prompt injection and DoS
  if (history.length > MAX_HISTORY_ITEMS) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'History too large' }) };
  }

  // Sanitize: ensure only allowed roles and strip oversized text
  const sanitizedHistory = history
    .filter(msg => msg && (msg.role === 'user' || msg.role === 'model'))
    .map(msg => ({
      role: msg.role,
      parts: Array.isArray(msg.parts)
        ? msg.parts
          .filter(p => p && typeof p.text === 'string')
          .map(p => ({ text: String(p.text).substring(0, MAX_TEXT_LENGTH) }))
        : []
    }))
    .filter(msg => msg.parts.length > 0);

  if (sanitizedHistory.length === 0) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'No valid messages in history' }) };
  }

  // --- 3. Generate Report ---
  try {
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Service temporarily unavailable' }) };
    }

    const client = new GoogleGenAI({ apiKey: API_KEY });

    const systemInstruction = `Extract and grade answers from the interview history.
1. ONLY use text spoken by the 'user'.
2. If omitted, set answer to 'No answer provided', score to 0.
3. DO NOT invent answers.
4. Silence = 0 Overall Score.
5. If interviewing ends abruptly, evaluate what exists.
6. The interviewer's statement IS the question. The candidate's next text IS the answer.
7. CRITICAL: Keep feedback EXTREMELY concise. Max 2 sentences per question feedback. Max 3 sentences for overall feedback.
Output a single JSON object.`;

    const finalPrompt = {
      role: 'user',
      parts: [{ text: 'Analyze and provide final summary.' }]
    };

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [...sanitizedHistory, finalPrompt],
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

    // Check if the output explicitly failed or returned empty
    const rawText = response.text;
    let validatedBody;
    try {
      validatedBody = JSON.parse(rawText);
    } catch (e) {
      console.error("JSON parsing error on model output", e);
      throw new Error("Invalid format returned from AI model");
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(validatedBody)
    };

  } catch (error) {
    console.error("Report generation error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to generate report' })
    };
  }
};
