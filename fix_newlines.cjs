const fs = require('fs');
const file = 'c:\\\\Users\\\\priya\\\\Desktop\\\\KisanMitra\\\\src\\\\utils\\\\translations.js';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/,\\n/g, ',\\n');
fs.writeFileSync(file, content, 'utf8');
