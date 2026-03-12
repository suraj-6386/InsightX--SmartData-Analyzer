const fs = require('fs');
const path = 'e:/DPU MCA/SEM 2/DSE LAB/DSE PROJECT/insightx_dse/src/index.css';
let content = fs.readFileSync(path, 'utf8');

// List of known URLs that might have been mangled
const repairs = [
    { from: "@import url('https:", to: "@import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,100..900;1,100..900&family=Outfit:wght@100..900&display=swap');" },
    // Add other suspected URLs here if found
];

let changed = false;
repairs.forEach(r => {
    if (content.includes(r.from) && !content.includes(r.to)) {
        content = content.replace(r.from, r.to);
        changed = true;
    }
});

// Also search for any url(' or url(" that doesn't end with ') or ") on the same line
const lines = content.split('\n');
const fixedLines = lines.map((line, idx) => {
    if (line.includes('url(')) {
        const singleStart = line.indexOf("url('");
        const doubleStart = line.indexOf('url("');
        
        if (singleStart !== -1) {
            const rest = line.substring(singleStart + 5);
            if (!rest.includes("')")) {
                console.log(`Potential corruption found at line ${idx + 1}: ${line.trim()}`);
                // Since we don't know the original URL, let's try to see if we can find it in previous versions or common patterns
                // If it's just 'https:', it's definitely line 3
            }
        }
        if (doubleStart !== -1) {
            const rest = line.substring(doubleStart + 5);
            if (!rest.includes('")')) {
                console.log(`Potential corruption found at line ${idx + 1}: ${line.trim()}`);
            }
        }
    }
    return line;
});

if (changed) {
    fs.writeFileSync(path, content, 'utf8');
    console.log('Repaired known corruptions.');
} else {
    console.log('No known corruptions found or already repaired.');
}
