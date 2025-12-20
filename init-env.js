import fs from 'fs';
try {
    fs.writeFileSync('.env', 'API_KEY=AIzaSyAkK91nWCPJCLpKlzvffcqGno3_HDb6N1I', 'utf8');
    console.log('Successfully repaired .env file');
} catch (e) {
    console.error('Failed to write .env', e);
}
