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

console.log("Checking build determinism...");
execSync("npm.cmd run build", { stdio: "inherit" });
const hash1 = hashDir("dist");

rmSync("dist", { recursive: true, force: true });

execSync("npm.cmd run build", { stdio: "inherit" });
const hash2 = hashDir("dist");

if (hash1 !== hash2) {
  console.error(`Build determinism failure!\nRun 1: ${hash1}\nRun 2: ${hash2}`);
  process.exit(1);
}

console.log(`Build is 100% deterministic (dist SHA-256: ${hash1.slice(0, 16)}...)`);
