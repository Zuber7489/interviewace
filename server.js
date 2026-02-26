// Simple backend server to generate ephemeral tokens for Gemini Live API
// Run with: node server.js

import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly point to config.env in the current directory (renamed to avoid gitignore issues during setup)
const envPath = path.resolve(__dirname, 'config.env');
console.log('Loading env from:', envPath);

// Try loading from standard locations
const result = dotenv.config({ path: envPath });

if (result.error) {
    if (fs.existsSync(envPath)) {
        dotenv.config({ path: envPath });
    } else {
        console.warn('config.env file not found at', envPath);
    }
}

const API_KEY = process.env.API_KEY;

const app = express();
app.use(cors());
app.use(express.json());

// Use the API_KEY loaded above
const client = new GoogleGenAI({ apiKey: API_KEY });

// --- Static File Serving & SPA Fallback ---
// Serve static files from the 'dist/interviewace/browser' directory
const buildPath = path.resolve(__dirname, 'dist', 'interviewace', 'browser');
if (fs.existsSync(buildPath)) {
    console.log('Serving production build from:', buildPath);
    app.use(express.static(buildPath));
} else {
    // If build doesn't exist, serve the root (for dev environments using root index.html)
    console.log('Build directory not found, serving files from root as fallback...');
    app.use(express.static(__dirname));
}

// Endpoint to get an ephemeral token
app.get('/api/token', async (req, res) => {
    try {
        console.log('Generating ephemeral token...');

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

        console.log('Token generated successfully');
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

// Endpoint to generate interview report
app.post('/api/report', async (req, res) => {
    try {
        console.log('Generating interview report...');
        const { history } = req.body;

        if (!history || !Array.isArray(history) || history.length === 0) {
            console.error('Invalid or empty history received:', history);
            return res.status(400).json({ error: 'Invalid or empty interview history' });
        }

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
});

// CRITICAL: Handle the SPA fallback to index.html for all sub-routes
// This prevents 404 errors when refreshing on deep links like /dashboard/history
app.get('*', (req, res) => {
    // 1. Try serving from the production build first
    const prodIndex = path.join(buildPath, 'index.html');
    if (fs.existsSync(prodIndex)) {
        return res.sendFile(prodIndex);
    }
    // 2. Fallback to the root index.html
    const rootIndex = path.resolve(__dirname, 'index.html');
    if (fs.existsSync(rootIndex)) {
        return res.sendFile(rootIndex);
    }
    res.status(404).send('index.html not found. Please build the project: npm run build');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Unified SaaS Server running on http://localhost:${PORT}`);
    console.log('✅ API Endpoints: /api/token, /api/report');
    console.log('✅ SPA Fallback: Enabled (Prevents 404s on refresh)');
});
