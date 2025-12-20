import fs from 'fs';

const content = `API_KEY=AIzaSyAkK91nWCPJCLpKlzvffcqGno3_HDb6N1I`;

fs.writeFileSync('.env', content, { encoding: 'utf8' });
console.log('.env file rewritten successfully');
