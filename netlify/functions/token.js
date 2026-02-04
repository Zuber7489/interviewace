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

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    // Netlify provides environment variables via process.env automatically
    const API_KEY = process.env.API_KEY;

    if (!API_KEY) {
      console.error('API_KEY is missing in environment variables');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'API_KEY not configured in Netlify' })
      };
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
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        token: token.name,
        expiresAt: expireTime
      })
    };
  } catch (error) {
    console.error('Error generating token:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to generate token',
        details: error.message
      })
    };
  }
};
