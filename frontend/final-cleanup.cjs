/**
 * final-cleanup.cjs
 * Scans the TableNest frontend codebase for remaining hardcoded, test, or dummy data.
 * Run: node final-cleanup.cjs
 */

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'src');
const IGNORE = ['node_modules', '.git', 'dist', 'build'];

const PATTERNS = [
    { name: 'TODO', regex: /\bTODO\b/i },
    { name: 'FIXME', regex: /\bFIXME\b/i },
    { name: 'HACK', regex: /\bHACK\b/i },
    { name: 'hardcoded', regex: /hardcoded/i },
    { name: 'dummy data', regex: /dummy\s*data/i },
    { name: 'mock data', regex: /mock\s*data/i },
    { name: 'fake data', regex: /fake\s*data/i },
    { name: 'test data', regex: /test[\s-]*data/i },
    { name: 'placeholder data', regex: /placeholder\s*data/i },
    { name: 'console.log (debug)', regex: /console\.log\(/ },
    { name: 'debugger', regex: /\bdebugger\b/ },
];

let totalHits = 0;

function walk(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (!IGNORE.includes(entry.name)) walk(full);
        } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
            const content = fs.readFileSync(full, 'utf-8');
            const lines = content.split('\n');
            for (let i = 0; i < lines.length; i++) {
                for (const p of PATTERNS) {
                    if (p.regex.test(lines[i])) {
                        const rel = path.relative(__dirname, full);
                        console.log(`  ${rel}:${i + 1} [${p.name}] ${lines[i].trim().slice(0, 120)}`);
                        totalHits++;
                    }
                }
            }
        }
    }
}

console.log('\n🔍 TableNest Final Cleanup Scanner\n');
console.log('Scanning frontend/src...\n');
walk(SRC);

if (totalHits === 0) {
    console.log('✅ No issues found. Frontend is clean.\n');
} else {
    console.log(`\n⚠️  Found ${totalHits} potential issue(s). Review above.\n`);
}
