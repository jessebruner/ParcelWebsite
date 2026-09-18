import { spawnSync } from "node:child_process";
for (const script of ["node_modules/astro/bin/astro.mjs", "tools/gen-sitemap.mjs"]) {
  const result = spawnSync(process.execPath, [script, ...(script.includes("astro.mjs") ? ["build"] : [])], { stdio: "inherit", env: { ...process.env, ASTRO_TELEMETRY_DISABLED: "1" } });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
