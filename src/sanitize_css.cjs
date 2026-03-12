const fs = require('fs');
const path = 'e:/DPU MCA/SEM 2/DSE LAB/DSE PROJECT/insightx_dse/src/index.css';
const buf = fs.readFileSync(path);

// Force conversion to utf8 string, stripping any BOM
let content = buf.toString('utf8');
if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
    console.log('Stripped BOM');
}

// Ensure line endings are consistent
content = content.replace(/\r\n/g, '\n');

// Specific fix for the suspicious line 2342
// I'll search for the content: ''; pattern and ensure it's clean
const lines = content.split('\n');
let fixedCount = 0;
const newLines = lines.map((line, idx) => {
    if (line.includes('content:') && (line.includes("''") || line.includes("' '"))) {
        const newLine = line.replace(/content:\s*['"]\s*['"]/g, "content: ''");
        if (newLine !== line) {
            console.log(`Fixed suspicious content at line ${idx + 1}`);
            fixedCount++;
        }
        return newLine;
    }
    return line;
});

fs.writeFileSync(path, newLines.join('\n'), 'utf8');
console.log(`Finished sanitizing index.css. Fixed ${fixedCount} lines.`);
