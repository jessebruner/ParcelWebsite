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
  let lines = content.split(/\r?\n/);
  let lineOffset = 1;
  if (filePath.endsWith(".astro")) {
    const fmStart = lines.findIndex((l) => l.trim() === "---");
    if (fmStart !== -1) {
      const fmEnd = lines.slice(fmStart + 1).findIndex((l) => l.trim() === "---");
      if (fmEnd !== -1) {
        lineOffset = fmStart + 2;
        lines = lines.slice(fmStart + 1, fmStart + 1 + fmEnd);
      } else {
        lines = [];
      }
    } else {
      lines = [];
    }
  }

  lines.forEach((line, idx) => {
    const lineNum = lineOffset + idx;
    if (/\bDate\.now\b/.test(line)) {
      if (!line.includes("SOURCE_DATE_EPOCH")) {
        throw new Error(`Unpinned Date.now() call in ${filePath}:${lineNum}: line calls Date.now() without SOURCE_DATE_EPOCH check`);
      }
    }
    if (/\bnew\s+Date\b/.test(line)) {
      if (/\bnew\s+Date\s*\(\s*\)/.test(line)) {
        throw new Error(`Unpinned new Date() call in ${filePath}:${lineNum}: empty new Date() reads wall clock`);
      }
      if (!line.includes("epoch") && !line.includes("SOURCE_DATE_EPOCH")) {
        throw new Error(`Unpinned new Date(...) call in ${filePath}:${lineNum}: new Date argument must reference epoch or SOURCE_DATE_EPOCH`);
      }
    }
  });
}

function scanDir(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) {
      if (entry !== "node_modules" && entry !== "dist" && entry !== "scripts") scanDir(p);
    } else if (
      p.endsWith(".astro") ||
      p.endsWith(".ts") ||
      p.endsWith(".js") ||
      (p.endsWith(".mjs") && !p.endsWith("check-determinism.mjs"))
    ) {
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
rmSync("dist", { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
execSync(`${npmCmd} run build`, { stdio: "inherit", env: { ...process.env, SOURCE_DATE_EPOCH: TEST_EPOCH } });

/*
 * The footer year is the date sink, and it has to respond, or step 3's
 * "two builds match" proves nothing: a build with no clock read anywhere
 * would pass it trivially.
 */
const pricingHtml = readFileSync("dist/pricing.html", "utf8");
if (!pricingHtml.includes("2001")) {
  throw new Error("Date sink failure: pricing.html footer does not reflect skewed year 2001");
}

/*
 * The sitemap used to be the second sink, stamping the build date on every
 * URL. It no longer is, on purpose: a lastmod that says "today" for all 25
 * pages on every deploy is a false claim, so dates now come from post data and
 * pages with no tracked date carry none. That turns the old assertion inside
 * out. The sitemap must NOT move with the clock, and every date in it must be
 * a date something actually knows.
 */
const sitemapContent = readFileSync("dist/sitemap.xml", "utf8");
if (sitemapContent.includes("2001")) {
  throw new Error("sitemap.xml still reads the build clock: it moved with the skewed SOURCE_DATE_EPOCH");
}
const stamps = [...sitemapContent.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((m) => m[1]);
const known = new Set(
  [...readFileSync("src/data/blog.ts", "utf8").matchAll(/publishedAt:\s*"(\d{4}-\d{2}-\d{2})"/g)].map((m) => m[1])
);
if (stamps.length === 0) {
  throw new Error("sitemap.xml carries no lastmod at all; the post dates stopped reaching it");
}
for (const stamp of stamps) {
  if (!known.has(stamp)) {
    throw new Error(`sitemap.xml lastmod ${stamp} matches no publishedAt in src/data/blog.ts`);
  }
}
console.log(`✓ Date sink positively verified against SOURCE_DATE_EPOCH; sitemap holds ${stamps.length} data-derived dates and no build date.`);

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
rmSync("dist", { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
execSync(`${npmCmd} run build`, { stdio: "inherit", env: process.env });
const hash1 = hashDir("dist");

rmSync("dist", { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });

execSync(`${npmCmd} run build`, { stdio: "inherit", env: process.env });
const hash2 = hashDir("dist");

if (hash1 !== hash2) {
  console.error(`Build determinism failure!\nRun 1: ${hash1}\nRun 2: ${hash2}`);
  process.exit(1);
}

console.log(`Build is reproducible from source (SOURCE_DATE_EPOCH=${epoch}, dist SHA-256: ${hash1.slice(0, 16)}...)`);

