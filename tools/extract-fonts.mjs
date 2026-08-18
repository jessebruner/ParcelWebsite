/**
 * One-shot: lift the woff2 faces out of the old single-file bundle.
 *
 * The bundle carried every face base64-encoded in its manifest, which is why
 * index.html was 1.5 MB. These are the faces the site has always rendered
 * with, so extracting them keeps typography identical while letting a browser
 * cache them apart from the copy. Cyrillic, Greek and Vietnamese subsets are
 * dropped; a US-only product never serves them.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { gunzipSync } from "node:zlib";

const [src, outDir] = process.argv.slice(2);
const html = readFileSync(src, "utf8");
const lines = html.split("\n");
const at = {};
lines.forEach((l, i) => { const m = /<script type="__bundler\/(\w+)">/.exec(l); if (m) at[m[1]] = i + 1; });
const manifest = JSON.parse(lines[at.manifest]);
const template = JSON.parse(lines[at.template]);

const faces = [];
for (const m of template.matchAll(/@font-face\s*\{([^}]*)\}/g)) {
  const b = m[1];
  const g = k => (new RegExp(`${k}\s*:\s*([^;]+);`).exec(b) || [, ""])[1].trim();
  const url = /url\(\s*"([^"]+)"\s*\)/.exec(b);
  if (!url) continue;
  faces.push({
    uuid: url[1], family: g("font-family").replace(/['"]/g, ""), weight: g("font-weight"),
    style: g("font-style"), stretch: g("font-stretch"), range: g("unicode-range"),
    subset: (template.slice(Math.max(0, m.index - 60), m.index).match(/\/\*\s*([a-z-]+)\s*\*\//) || [, "?"])[1],
  });
}

mkdirSync(outDir, { recursive: true });
const KEEP = new Set(["latin", "latin-ext"]);
const slug = x => x.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const kept = [];
for (const f of faces) {
  if (!KEEP.has(f.subset)) continue;
  const a = manifest[f.uuid];
  if (!a) continue;
  let bytes = Buffer.from(a.data, "base64");
  if (a.compressed) bytes = gunzipSync(bytes);
  const file = `${slug(f.family)}-${slug(f.weight)}${f.style && f.style !== "normal" ? "-" + slug(f.style) : ""}-${f.subset}.woff2`;
  writeFileSync(join(outDir, file), bytes);
  kept.push({ ...f, file, bytes: bytes.length });
}

const css = ["/*", " * Typography, lifted from the bundle that used to inline it.", " *",
  " * Literata speaks. Bricolage labels. Plex Mono is evidence.", " */", "",
  ...kept.map(f => ["@font-face {", `  font-family: '${f.family}';`, `  font-style: ${f.style || "normal"};`,
    `  font-weight: ${f.weight};`, f.stretch ? `  font-stretch: ${f.stretch};` : null,
    "  font-display: swap;", `  src: url('/fonts/${f.file}') format('woff2');`,
    `  unicode-range: ${f.range};`, "}"].filter(Boolean).join("\n")), ""].join("\n");
writeFileSync("src/styles/fonts.css", css);
console.log(`${kept.length} faces, ${(kept.reduce((a, f) => a + f.bytes, 0) / 1024).toFixed(0)} KB total`);
