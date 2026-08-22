const fs = require('fs');
const p = 'src/data/blog.ts';
let b = fs.readFileSync(p).toString('latin1');
const from = '    parts.push(...section.paragraphs);';
const to = '    parts.push(...(section.paragraphs ?? []));';
if (!b.includes(from)) { console.error('FROM not found'); process.exit(2); }
if (b.includes(to)) { console.error('already patched'); process.exit(3); }
const out = b.replace(from, to);
fs.writeFileSync(p, out, 'latin1');
console.log('readingMinutes guarded OK');
