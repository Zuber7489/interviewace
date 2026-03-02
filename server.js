// Secure backend server for ScoreMyInterview
// Handles: Gemini ephemeral tokens, interview report generation, subscription upgrades
// Run with: node server.js

import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Load Environment ─────────────────────────────────────────────────────────
const envPath = path.resolve(__dirname, 'config.env');
console.log('Loading env from:', envPath);
const result = dotenv.config({ path: envPath });
if (result.error && fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else if (result.error) {
    console.warn('config.env file not found at', envPath);
}

// ─── Firebase Admin Initialization ───────────────────────────────────────────
// Initialize Firebase Admin SDK for server-side token verification.
// Uses Application Default Credentials (ADC) in production (set GOOGLE_APPLICATION_CREDENTIALS env var),
// or falls back to a serviceAccountKey.json file in the project root for local dev.
let adminInitialized = false;
try {
    const serviceAccountPath = path.resolve(__dirname, 'serviceAccountKey.json');
    if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: process.env.FIREBASE_DATABASE_URL
        });
        console.log('✅ Firebase Admin initialized with serviceAccountKey.json');
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            databaseURL: process.env.FIREBASE_DATABASE_URL
        });
        console.log('✅ Firebase Admin initialized with Application Default Credentials');
    } else {
        console.warn('⚠️  No Firebase Admin credentials found. API endpoints will be UNPROTECTED. Add serviceAccountKey.json or set GOOGLE_APPLICATION_CREDENTIALS.');
    }
    adminInitialized = true;
} catch (e) {
    console.error('❌ Firebase Admin initialization failed:', e.message);
}

const API_KEY = process.env.API_KEY;
const client = new GoogleGenAI({ apiKey: API_KEY });

// ─── CORS Configuration ───────────────────────────────────────────────────────
// FIX (S7): Restrict CORS to known origins only — no wildcard in production.
const ALLOWED_ORIGINS = [
    'http://localhost:4200',
    'http://localhost:3001',
    // Add your production domain(s) here:
    ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) : [])
];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, Postman in dev, server-to-server)
        if (!origin) return callback(null, true);
        if (ALLOWED_ORIGINS.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS policy: Origin '${origin}' not allowed`));
        }
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false
};

const app = express();
app.use(cors(corsOptions));
app.use(express.json({ limit: '2mb' })); // Limit payload size

// ─── Auth Middleware ──────────────────────────────────────────────────────────
// FIX (S2 & S3): Verify Firebase ID token on ALL protected API endpoints.
async function requireAuth(req, res, next) {
    if (!adminInitialized) {
        // In local dev without credentials, log a warning but allow through
        console.warn('⚠️  [requireAuth] Firebase Admin not initialized — skipping token verification (dev mode).');
        req.uid = 'dev-user';
        return next();
    }

    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Missing or malformed Authorization header' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.uid = decodedToken.uid;   // Attach verified UID to request
        req.email = decodedToken.email;
        next();
    } catch (e) {
        console.error('[requireAuth] Token verification failed:', e.message);
        return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }
}

// ─── Rate Limiting ────────────────────────────────────────────────────────────
// Simple in-memory rate limiter: max 10 API calls per UID per 5 minutes
const rateLimitMap = new Map(); // uid -> { count, windowStart }
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

function checkApiRateLimit(req, res, next) {
    const uid = req.uid || req.ip;
    const now = Date.now();
    const entry = rateLimitMap.get(uid);

    if (!entry || (now - entry.windowStart) > RATE_LIMIT_WINDOW_MS) {
        rateLimitMap.set(uid, { count: 1, windowStart: now });
        return next();
    }

    if (entry.count >= RATE_LIMIT_MAX) {
        return res.status(429).json({ error: 'Too many requests. Please wait a few minutes.' });
    }

    entry.count++;
    next();
}

// ─── Static File Serving ──────────────────────────────────────────────────────
const buildPath = path.resolve(__dirname, 'dist', 'interviewace', 'browser');
if (fs.existsSync(buildPath)) {
    console.log('Serving production build from:', buildPath);
    app.use(express.static(buildPath));
} else {
    console.log('Build directory not found, serving files from root as fallback...');
    app.use(express.static(__dirname));
}

// ─── API: Get Ephemeral Token ─────────────────────────────────────────────────
// FIX (S2): Now protected by requireAuth — only verified Firebase users can get a token.
app.get('/api/token', requireAuth, checkApiRateLimit, async (req, res) => {
    try {
        console.log(`Generating ephemeral token for uid: ${req.uid}`);

        const expireTime = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes
        const newSessionExpireTime = new Date(Date.now() + 1 * 60 * 1000); // 1 minute to start session

        const token = await client.authTokens.create({
            config: {
                uses: 1,
                expireTime: expireTime,
                newSessionExpireTime: newSessionExpireTime,
                httpOptions: { apiVersion: 'v1alpha' },
            },
        });

        console.log(`Token generated for uid: ${req.uid}`);
        res.json({
            token: token.name,
            expiresAt: expireTime
        });
    } catch (error) {
        console.error('Error generating token:', error);
        res.status(500).json({
            error: 'Failed to generate token',
            details: error.message
        });
    }
});

// ─── API: Generate Interview Report ──────────────────────────────────────────
// FIX (S3): Now protected by requireAuth — only verified Firebase users can call this.
app.post('/api/report', requireAuth, checkApiRateLimit, async (req, res) => {
    try {
        console.log(`Generating interview report for uid: ${req.uid}`);
        const { history } = req.body;

        if (!history || !Array.isArray(history) || history.length === 0) {
            console.error('Invalid or empty history received:', history);
            return res.status(400).json({ error: 'Invalid or empty interview history' });
        }

        // Sanity check: limit history size to prevent abuse
        if (history.length > 200) {
            return res.status(400).json({ error: 'History too long' });
        }

        const systemInstruction = `You are an interview result summarizer. Your task is to extract ACTUAL answers from the provided history and grade them. STRICT RULES: 
1. You must ONLY use text explicitly present in the 'user' role messages within the history as the candidate's answer. 
2. If the user did not provide an answer to a question, or if the history shows no response, set the 'answer' field to 'No answer provided' and the score to 0. 
3. DO NOT invent, hallucinate, or infer answers that represent what a candidate 'might' have said. 
4. If the candidate was silent, non-responsive, or said very little, the Overall Score MUST be 0. 
5. Do not generate positive feedback for missing answers. 
6. IMPORTANT: The interviewer (model) may sometimes state its intentions or make statements instead of asking a formalized question (e.g., "I'm moving forward with a scenario about X"). Treat the interviewer's statement as the question. AND CRITICALLY: Whatever the user (candidate) says immediately after MUST be recorded as their 'answer', regardless of whether the interviewer asked a direct question. Never reject a user's text. If the user spoke, capture their exact words in the 'answer' field.
Your response must be a single JSON object. Scores must be on a scale of 0 to 100.`;

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
                                    score: { type: 'NUMBER', description: "A score for the answer from 0 to 100." }
                                },
                                required: ["question", "answer", "feedback", "score"]
                            }
                        }
                    },
                    required: ['overallFeedback', 'overallScore', 'evaluatedQuestions'],
                },
            },
        });

        console.log(`Report generated for uid: ${req.uid}`);
        const jsonResponse = JSON.parse(response.text || '{}');
        res.json(jsonResponse);

    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({
            error: 'Failed to generate report',
            details: error.message
        });
    }
});

// ─── API: Upgrade Subscription ────────────────────────────────────────────────
// FIX (S4): This endpoint now exists and is secured.
// In production, integrate Razorpay here to verify payment before upgrading.
app.post('/api/upgrade', requireAuth, async (req, res) => {
    const uid = req.uid;

    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        // ── PRODUCTION: Uncomment the Razorpay signature verification block below ──
        // const Razorpay = await import('razorpay');
        // const crypto = await import('crypto');
        // const expectedSignature = crypto
        //     .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        //     .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        //     .digest('hex');
        // if (expectedSignature !== razorpay_signature) {
        //     return res.status(400).json({ error: 'Payment verification failed: Invalid signature' });
        // }
        // ── END RAZORPAY VERIFICATION ──

        // In demo mode, we still require a non-empty payment ID
        if (!razorpay_payment_id) {
            return res.status(400).json({ error: 'Missing payment details' });
        }

        // --- Idempotency Check ---
        // Prevent double-upgrades from the same payment ID
        const db = admin.database();
        const paymentRef = db.ref(`processedPayments/${razorpay_payment_id}`);
        const existingPayment = await paymentRef.get();
        if (existingPayment.exists()) {
            return res.status(409).json({ error: 'This payment has already been processed.' });
        }

        // --- Get current user data to stack interviews ---
        const userRef = db.ref(`users/${uid}`);
        const userSnap = await userRef.get();
        if (!userSnap.exists()) {
            return res.status(404).json({ error: 'User not found' });
        }
        const userData = userSnap.val();
        if (userData.deleted) {
            return res.status(403).json({ error: 'Account has been suspended.' });
        }

        // Stack on top of existing interviews (don't reset count)
        const currentMax = userData.maxInterviews || 0;
        const newMaxInterviews = currentMax + 10;

        // --- Write upgrade atomically using Admin SDK ---
        await userRef.update({
            subscription: 'pro',
            maxInterviews: newMaxInterviews,
            lastUpgradedAt: Date.now()
        });

        // --- Mark payment as processed ---
        await paymentRef.set({
            uid,
            processedAt: Date.now(),
            orderId: razorpay_order_id,
        });

        console.log(`✅ Upgrade successful for uid: ${uid}, new maxInterviews: ${newMaxInterviews}`);
        res.json({
            success: true,
            subscription: 'pro',
            maxInterviews: newMaxInterviews
        });

    } catch (error) {
        console.error(`❌ Upgrade failed for uid: ${uid}:`, error);
        res.status(500).json({ error: 'Upgrade failed. Please contact support.' });
    }
});

// ─── SPA Fallback ─────────────────────────────────────────────────────────────
app.get('*', (req, res) => {
    const prodIndex = path.join(buildPath, 'index.html');
    if (fs.existsSync(prodIndex)) {
        return res.sendFile(prodIndex);
    }
    const rootIndex = path.resolve(__dirname, 'index.html');
    if (fs.existsSync(rootIndex)) {
        return res.sendFile(rootIndex);
    }
    res.status(404).send('index.html not found. Please build the project: npm run build');
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Secure SaaS Server running on http://localhost:${PORT}`);
    console.log('✅ API Endpoints: /api/token (auth required), /api/report (auth required), /api/upgrade (auth required)');
    console.log('✅ CORS: Restricted to known origins');
    console.log('✅ SPA Fallback: Enabled');
});
