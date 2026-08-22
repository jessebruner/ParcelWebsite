import { execSync } from "node:child_process";
import { readFileSync, readdirSync, statSync, rmSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";

function hashDir(dir) {
  const hash = createHash("sha256");
  const files = [];

  function walk(d) {
    for (const entry of readdirSync(d)) {
      const p = join(d, entry);
      if (statSync(p).isDirectory()) walk(p);
      else files.push(p);
    }
  }

  walk(dir);
  files.sort();

  for (const f of files) {
    hash.update(f.replace(/\\/g, "/"));
    hash.update(readFileSync(f));
  }
  return hash.digest("hex");
}

const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";

// 1. Source-level guard: Forbid unpinned build-time Date reads outside epoch-aware sites
console.log("Checking for unpinned build-time Date reads...");
function checkFileForUnpinnedDate(filePath, content) {
  // Check frontmatter in .astro or full content in tools
  let textToCheck = content;
  if (filePath.endsWith(".astro")) {
    const fmMatch = /^---\r?\n([\s\S]*?)\r?\n---/.exec(content);
    textToCheck = fmMatch ? fmMatch[1] : "";
  }
  if (/\b(Date\.now|new Date)\b/.test(textToCheck)) {
    if (!textToCheck.includes("SOURCE_DATE_EPOCH")) {
      throw new Error(`Unpinned Date call in ${filePath}: file calls Date without referencing SOURCE_DATE_EPOCH`);
    }
  }
}

function scanDir(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) {
      if (entry !== "node_modules" && entry !== "dist" && entry !== "scripts") scanDir(p);
    } else if (p.endsWith(".astro") || (p.includes("tools") && p.endsWith(".mjs") && !p.endsWith("check-determinism.mjs"))) {
      checkFileForUnpinnedDate(p, readFileSync(p, "utf8"));
    }
  }
}
scanDir("src");
scanDir("tools");
console.log("✓ No unpinned build-time Date reads found in components or build tools.");

// 2. Skewed-epoch positive verification: verify that build outputs respond to SOURCE_DATE_EPOCH
const TEST_EPOCH = "978307200"; // 2001-01-01T00:00:00Z
console.log(`Verifying date sink response with skewed SOURCE_DATE_EPOCH=${TEST_EPOCH}...`);
rmSync("dist", { recursive: true, force: true });
execSync(`${npmCmd} run build`, { stdio: "inherit", env: { ...process.env, SOURCE_DATE_EPOCH: TEST_EPOCH } });

const sitemapContent = readFileSync("dist/sitemap.xml", "utf8");
if (!sitemapContent.includes("<lastmod>2001-01-01</lastmod>")) {
  throw new Error("Date sink failure: sitemap.xml does not contain expected skewed lastmod 2001-01-01");
}
const pricingHtml = readFileSync("dist/pricing.html", "utf8");
if (!pricingHtml.includes("2001")) {
  throw new Error("Date sink failure: pricing.html footer does not reflect skewed year 2001");
}
console.log("✓ Date sinks positively verified against SOURCE_DATE_EPOCH.");

// 3. Source determinism dual-build check
let epoch = process.env.SOURCE_DATE_EPOCH;
if (!epoch) {
  try {
    epoch = execSync("git log -1 --format=%ct").toString().trim();
  } catch {
    epoch = "1755835200";
  }
}

process.env.SOURCE_DATE_EPOCH = epoch;

console.log(`Checking build determinism with SOURCE_DATE_EPOCH=${epoch}...`);
rmSync("dist", { recursive: true, force: true });
execSync(`${npmCmd} run build`, { stdio: "inherit", env: process.env });
const hash1 = hashDir("dist");

rmSync("dist", { recursive: true, force: true });

execSync(`${npmCmd} run build`, { stdio: "inherit", env: process.env });
const hash2 = hashDir("dist");

if (hash1 !== hash2) {
  console.error(`Build determinism failure!\nRun 1: ${hash1}\nRun 2: ${hash2}`);
  process.exit(1);
}

console.log(`Build is reproducible from source (SOURCE_DATE_EPOCH=${epoch}, dist SHA-256: ${hash1.slice(0, 16)}...)`);

