import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target file path
const targetPath = path.resolve(__dirname, 'src', 'firebase.config.ts');

// Use environment variables from Netlify/local process.env
const config = {
    apiKey: process.env.FIREBASE_API_KEY || "AIzaSyCiVu_bRDTIlfQoRl5VxusSuMSLvcM4PMw",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "scoremyinter.firebaseapp.com",
    projectId: process.env.FIREBASE_PROJECT_ID || "scoremyinter",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "scoremyinter.firebasestorage.app",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "762155553897",
    appId: process.env.FIREBASE_APP_ID || "1:762155553897:web:8dad3621cc9708cd3c3ef8",
    measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-1XCKJBXYXP",
    databaseURL: process.env.FIREBASE_DATABASE_URL || "https://scoremyinter-default-rtdb.firebaseio.com"
};

const content = `// This file is auto-generated during the build process
export const firebaseConfig = ${JSON.stringify(config, null, 4)};
`;

try {
    fs.writeFileSync(targetPath, content, 'utf8');
    console.log('✅ Successfully generated firebase.config.ts from environment variables');
} catch (e) {
    console.error('❌ Failed to generate firebase.config.ts', e);
    process.exit(1);
}
