/**
 * SECURE SUBSCRIPTION UPGRADE ENDPOINT
 *
 * This endpoint is the ONLY place that can mark a user as 'pro'.
 * The client CANNOT write to Firebase subscription fields directly
 * (enforced by Firebase Security Rules).
 *
 * Flow:
 *  1. Client verifies payment with Razorpay (or your gateway)
 *  2. Client sends: Firebase ID token + payment_order_id + payment_id + payment_signature
 *  3. This server verifies: the ID token with Firebase Admin SDK, and
 *     the payment signature with Razorpay secret — both MUST pass
 *  4. Only then does the server write subscription:'pro' to Firebase
 */

import { createHmac } from 'crypto';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';

// --- Firebase Admin Initialization ---
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

// --- Allowed Origins ---
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

// --- Pro Pack Config ---
const PRO_MAX_INTERVIEWS = 10;

export const handler = async (event) => {
    const requestOrigin = event.headers?.origin || event.headers?.Origin || '';
    const headers = getCorsHeaders(requestOrigin);

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    // --- 1. Verify Firebase Auth Token ---
    const authHeader = event.headers?.authorization || event.headers?.Authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
        return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    let uid;
    try {
        const decoded = await getAuth(adminApp).verifyIdToken(authHeader.split('Bearer ')[1]);
        uid = decoded.uid;
    } catch {
        return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized: Invalid token' }) };
    }

    // --- 2. Parse and Validate Payload ---
    let body;
    try {
        body = JSON.parse(event.body || '{}');
    } catch {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON body' }) };
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing payment verification fields' }) };
    }

    // --- 3. Verify Razorpay Payment Signature (HMAC-SHA256) ---
    // This cryptographically proves the payment was made via Razorpay and not forged.
    const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
    if (!RAZORPAY_KEY_SECRET) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Payment service misconfigured' }) };
    }

    const expectedSignature = createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

    if (expectedSignature !== razorpay_signature) {
        // Signature mismatch — this is a forgery attempt
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Payment verification failed' }) };
    }

    // --- 4. Check for Duplicate/Replay Payment ---
    // Prevent the same payment_id from being used twice to get multiple upgrades
    const db = getDatabase(adminApp);
    const paymentRef = db.ref(`processedPayments/${razorpay_payment_id}`);
    const existingPayment = await paymentRef.get();

    if (existingPayment.exists()) {
        return { statusCode: 409, headers, body: JSON.stringify({ error: 'Payment already processed' }) };
    }

    // --- 5. Atomically Update User Subscription in Firebase (server-side only) ---
    try {
        const userRef = db.ref(`users/${uid}`);
        const userSnap = await userRef.get();

        if (!userSnap.exists()) {
            return { statusCode: 404, headers, body: JSON.stringify({ error: 'User not found' }) };
        }

        const userData = userSnap.val();

        // Update subscription fields — ONLY the server can write these fields
        await userRef.update({
            subscription: 'pro',
            maxInterviews: PRO_MAX_INTERVIEWS,
            interviewsCount: 0, // Reset count for new Pro Pack
            lastUpgradedAt: new Date().toISOString(),
        });

        // Mark payment as processed to prevent replay attacks
        await paymentRef.set({
            uid,
            processedAt: new Date().toISOString(),
            orderId: razorpay_order_id,
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Pro Pack activated! You now have 10 interviews.',
                maxInterviews: PRO_MAX_INTERVIEWS,
            })
        };
    } catch (err) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to activate subscription' }) };
    }
};
