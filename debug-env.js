import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
console.log('Checking .env at:', envPath);

try {
    const content = fs.readFileSync(envPath, 'utf8');
    console.log('--- RAW CONTENT START ---');
    console.log(content);
    console.log('--- RAW CONTENT END ---');

    const parsed = dotenv.parse(content);
    console.log('Parsed keys:', Object.keys(parsed));

    if (!parsed.API_KEY) {
        console.log('API_KEY is missing from parsed output');
    } else {
        console.log('API_KEY found starting with:', parsed.API_KEY.substring(0, 5) + '...');
    }

} catch (e) {
    console.error('Error reading .env:', e.message);
}
