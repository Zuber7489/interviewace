import fs from 'fs';

const files = [
    'src/environments/environment.ts',
    'src/environments/environment.prod.ts'
];

files.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`Processing ${file}...`);
        let content = fs.readFileSync(file, 'utf8');
        // Replace API_KEY value with empty string
        // Handles: API_KEY: 'stuff', API_KEY: "stuff", API_KEY: `stuff`
        const regex = /(API_KEY\s*:\s*)(['"`])(?:(?=(\\?))\2.)*?\2/g;
        // Simpler regex for standard strings without escaped quotes just to be safe and robust enough for this context
        // Matches key: '...'
        const simpleRegex = /(API_KEY|GEMINI_API_KEY)(\s*:\s*)(['"`].*?['"`])/g;

        if (simpleRegex.test(content)) {
            const newContent = content.replace(simpleRegex, '$1$2""');
            fs.writeFileSync(file, newContent);
            console.log(`  - Removed API key from ${file}`);
        } else {
            console.log(`  - No API key found in ${file} or it's already empty/variable.`);
        }
    } else {
        console.log(`File not found: ${file}`);
    }
});
