const fs = require('fs');
const xml = fs.readFileSync('c:/antigravity/gasera/docs/extracted_doc/word/document.xml', 'utf8');

// Regex to find paragraphs
const pRegex = /<w:p[^>]*>(.*?)<\/w:p>/g;
const tRegex = /<w:t[^>]*>(.*?)<\/w:t>/g;

let paragraphs = [];
let pMatch;

while ((pMatch = pRegex.exec(xml)) !== null) {
    let pXml = pMatch[1];
    let tParts = [];
    let tMatch;
    while ((tMatch = tRegex.exec(pXml)) !== null) {
        tParts.push(tMatch[1]);
    }
    if (tParts.length > 0) {
        paragraphs.push(tParts.join('').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&apos;/g, "'"));
    }
}

fs.writeFileSync('c:/antigravity/gasera/docs/extracted_doc/text_content.txt', paragraphs.join('\n\n'), 'utf8');
console.log('Extraction complete with paragraphs');
