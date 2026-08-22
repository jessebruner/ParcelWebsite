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
execSync("npm.cmd run build", { stdio: "inherit", env: process.env });
const hash1 = hashDir("dist");

rmSync("dist", { recursive: true, force: true });

execSync("npm.cmd run build", { stdio: "inherit", env: process.env });
const hash2 = hashDir("dist");

if (hash1 !== hash2) {
  console.error(`Build determinism failure!\nRun 1: ${hash1}\nRun 2: ${hash2}`);
  process.exit(1);
}

console.log(`Build is reproducible from source (SOURCE_DATE_EPOCH=${epoch}, dist SHA-256: ${hash1.slice(0, 16)}...)`);
