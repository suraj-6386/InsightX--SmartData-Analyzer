const fs = require('fs');
const content = fs.readFileSync('e:/DPU MCA/SEM 2/DSE LAB/DSE PROJECT/insightx_dse/src/index.css', 'utf8');

let inSingle = false;
let inDouble = false;
let startLine = -1;
let startCol = -1;

const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === "'" && !inDouble) {
            inSingle = !inSingle;
            if (inSingle) {
                startLine = i + 1;
                startCol = j + 1;
            } else {
                startLine = -1;
                startCol = -1;
            }
        } else if (char === '"' && !inSingle) {
            inDouble = !inDouble;
            if (inDouble) {
                startLine = i + 1;
                startCol = j + 1;
            } else {
                startLine = -1;
                startCol = -1;
            }
        }
    }
}

if (inSingle || inDouble) {
    console.log(`Unclosed ${inSingle ? 'single' : 'double'} quote detected!`);
    console.log(`Started at Line ${startLine}, Column ${startCol}`);
    const lineText = lines[startLine - 1];
    console.log(`Line content: ${lineText.trim()}`);
    console.log(`Context: ${lineText.substring(Math.max(0, startCol - 10), Math.min(lineText.length, startCol + 40))}`);
} else {
    console.log('All quotes are balanced globally.');
}
