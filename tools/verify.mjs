import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
const steps = [
  ["tools/build.mjs"],
  ["--test", ...readdirSync("tests").filter(name => name.endsWith(".test.mjs")).map(name => `tests/${name}`)],
  ["tools/check-determinism.mjs"],
  ["tools/check-links.mjs"],
  ["tools/voice-lint.mjs"],
  ["tools/check-seo.mjs"],
];
for (const args of steps) {
  const result = spawnSync(process.execPath, args, { stdio: "inherit", env: { ...process.env, ASTRO_TELEMETRY_DISABLED: "1" } });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
