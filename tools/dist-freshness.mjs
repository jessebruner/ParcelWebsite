/**
 * Refuse to report on a build that is older than the source.
 *
 * Three of the four verification steps read `dist` rather than `src`, on
 * purpose: the voice linter checks the copy a reader actually receives, the
 * link checker resolves hrefs against real files, and the panel test asserts
 * against built HTML. The cost of that choice is that every one of them will
 * happily grade a stale build and report a number that belongs to a different
 * tree. `npm run verify` used to run the tests before anything built, so the
 * panel test either failed for a missing file or passed against whatever was
 * left in dist from the last run.
 *
 * So each of them calls this first. It is a real guard, not a comment: touch
 * any file in src/ without rebuilding and the step exits 2 naming the file.
 *
 *   node -e "import('./tools/dist-freshness.mjs').then(m => m.requireFreshDist())"
 */
import { readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const SKIP_DIRS = new Set(["node_modules", ".git", "dist", ".astro"]);

function newestMtime(dir) {
  let newest = { path: null, mtimeMs: 0 };
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) {
      const inner = newestMtime(p);
      if (inner.mtimeMs > newest.mtimeMs) newest = inner;
    } else if (st.mtimeMs > newest.mtimeMs) {
      newest = { path: p, mtimeMs: st.mtimeMs };
    }
  }
  return newest;
}

/**
 * @param {object} [opts]
 * @param {string[]} [opts.sources] Directories and files whose mtime must predate the build.
 * @returns {{ ok: true } | { ok: false, reason: string }}
 */
export function checkFreshDist(opts = {}) {
  const sources = opts.sources ?? ["src", "public", "tools", "astro.config.mjs", "package.json"];
  if (!existsSync("dist")) {
    return { ok: false, reason: "No dist/. Run `npm run build` first." };
  }

  // The build's own last write, not the directory's: on Windows a directory
  // mtime does not move when a nested file is rewritten.
  const built = newestMtime("dist");
  if (!built.path) return { ok: false, reason: "dist/ is empty. Run `npm run build` first." };

  let newestSource = { path: null, mtimeMs: 0 };
  for (const s of sources) {
    if (!existsSync(s)) continue;
    const st = statSync(s);
    const found = st.isDirectory() ? newestMtime(s) : { path: s, mtimeMs: st.mtimeMs };
    if (found.mtimeMs > newestSource.mtimeMs) newestSource = found;
  }

  if (newestSource.path && newestSource.mtimeMs > built.mtimeMs) {
    const drift = Math.round((newestSource.mtimeMs - built.mtimeMs) / 1000);
    return {
      ok: false,
      reason:
        `dist is ${drift}s older than ${newestSource.path.replace(/\\/g, "/")}.\n` +
        "This step reads dist, so it would report on the previous tree. Run `npm run build`.",
    };
  }
  return { ok: true };
}

/** Same check, exiting the process. For the two tools that are entry points. */
export function requireFreshDist(opts = {}) {
  const result = checkFreshDist(opts);
  if (!result.ok) {
    console.error(result.reason);
    process.exit(2);
  }
}
