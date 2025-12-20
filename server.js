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
console.log('Current working directory:', process.cwd());
console.log('Script directory:', __dirname);

// Try loading from standard locations
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.log('Standard dotenv.config() failed for config.env...');
    if (fs.existsSync(envPath)) {
        dotenv.config({ path: envPath });
    } else {
        console.error('CRITICAL: config.env file not found at', envPath);
    }
}

console.log('Environment variables loaded. Checking API_KEY...');
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    console.error('ERROR: API_KEY is NOT set. Debugging content...');
    // Last ditch debug: read the file manually
    try {
        const raw = fs.readFileSync('config.env', 'utf8');
        console.log('Raw config.env content length:', raw.length);
        console.log('First 20 chars:', raw.substring(0, 20));

        // Manual parse fallback
        const manualParse = dotenv.parse(raw);
        if (manualParse.API_KEY) {
            console.log('Manual parse succeeded! Using that.');
            process.env.API_KEY = manualParse.API_KEY;
        }
    } catch (e) {
        console.error('Could not read .env manually:', e.message);
    }
}

const app = express();
app.use(cors());
app.use(express.json());

// Use the API_KEY loaded above
if (!process.env.API_KEY && API_KEY) {
    // If manual parse worked but process.env wasn't set (unlikely but safe)
    process.env.API_KEY = API_KEY;
}

const client = new GoogleGenAI({ apiKey: API_KEY });

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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Token server running on http://localhost:${PORT}`);
    console.log('Frontend should call GET /api/token to get an ephemeral token');
});
