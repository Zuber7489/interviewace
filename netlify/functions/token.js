import { GoogleGenAI } from '@google/genai';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';

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
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Vary': 'Origin',
  };
}

export const handler = async (event) => {
  const requestOrigin = event.headers?.origin || event.headers?.Origin || '';
  const headers = getCorsHeaders(requestOrigin);

  // --- Handle CORS Preflight ---
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // --- 1. Verify Firebase Auth Token (Firebase ID Token from client) ---
  const authHeader = event.headers?.authorization || event.headers?.Authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized: Missing token' }) };
  }
  const idToken = authHeader.split('Bearer ')[1];

  let decodedToken;
  try {
    decodedToken = await getAuth(adminApp).verifyIdToken(idToken);
  } catch (err) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized: Invalid token' }) };
  }

  const uid = decodedToken.uid;

  // --- 2. Server-Side Subscription & Usage Check ---
  try {
    const db = getDatabase(adminApp);
    const userSnap = await db.ref(`users/${uid}`).get();
    if (!userSnap.exists()) {
      return { statusCode: 403, headers, body: JSON.stringify({ error: 'Forbidden: User not found' }) };
    }

    const userData = userSnap.val();
    const subscription = userData.subscription || 'free';
    const interviewsCount = userData.interviewsCount || 0;
    const maxInterviews = subscription === 'pro' ? 10 : (userData.maxInterviews || 2);

    // Enforce usage limits server-side — this CANNOT be bypassed from the client
    if (interviewsCount >= maxInterviews) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({
          error: 'Interview limit reached',
          code: 'LIMIT_EXCEEDED',
          message: subscription === 'free'
            ? 'You have used all your free interviews. Please upgrade to Pro to continue.'
            : 'You have used all your Pro interviews. Please purchase another pack.'
        })
      };
    }
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal server error' }) };
  }

  // --- 3. Generate Ephemeral Token (only after all checks pass) ---
  try {
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Service temporarily unavailable' }) };
    }

    const client = new GoogleGenAI({ apiKey: API_KEY });

    const expireTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    const newSessionExpireTime = new Date(Date.now() + 1 * 60 * 1000);

    const token = await client.authTokens.create({
      config: {
        uses: 1, // Single use token
        expireTime: expireTime,
        newSessionExpireTime: newSessionExpireTime,
        httpOptions: { apiVersion: 'v1alpha' },
      },
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        token: token.name,
        expiresAt: expireTime
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to generate session token' })
      // Never expose error.message — it may contain API keys or internal paths
    };
  }
};
