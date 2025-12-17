// Simple backend server to generate ephemeral tokens for Gemini Live API
// Run with: node server.js

const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(cors());
app.use(express.json());

// Your API key (keep this server-side only!)
const API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyBU_f8ZMbQPykaY-KKt8nrWZhpdmfUWIz8';

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
