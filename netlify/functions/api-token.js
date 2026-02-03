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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Generating ephemeral token...');

    if (!API_KEY) {
      throw new Error('API_KEY not configured');
    }

    const client = new GoogleGenAI({ apiKey: API_KEY });
    
    const expireTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    const newSessionExpireTime = new Date(Date.now() + 1 * 60 * 1000);

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
}
