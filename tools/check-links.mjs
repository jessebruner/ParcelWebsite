/**
 * Fail the build if a link points at a page that is not there.
 *
 * This exists because of a specific failure: a menu shipped with links to
 * /hoa-laws and /pricing before those pages were written, so the navigation
 * 404'd on a live site. Reviewing markup did not catch it. Resolving every href
 * against the built output does.
 *
 * Three checks:
 *   1. Every internal href in dist resolves to a built file.
 *   2. Every route declared in src/data/routes.ts has a built file.
 *   3. Every in-page #anchor target exists on the page that links to it.
 *
 *   node tools/check-links.mjs
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const DIST = "dist";
if (!existsSync(DIST)) {
  console.error("No dist/. Run `npm run build` first.");
  process.exit(2);
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith(".html")) out.push(p);
  }
  return out;
}

const pages = walk(DIST);

/** dist/product/collections.html -> /product/collections ; dist/index.html -> / */
const toRoute = (file) => {
  const rel = relative(DIST, file).replace(/\\/g, "/").replace(/\.html$/, "");
  return rel === "index" ? "/" : "/" + rel;
};

const built = new Set(pages.map(toRoute));

/** Does an internal path resolve to something we shipped? */
function resolves(path) {
  if (built.has(path)) return true;
  // A directory-style link is fine if the file form exists.
  const trimmed = path.replace(/\/$/, "");
  if (trimmed !== path && built.has(trimmed || "/")) return true;
  // A real file in public/ (og.png, llms.txt, robots.txt, a font).
  if (existsSync(join(DIST, path.replace(/^\//, "")))) return true;
  return false;
}

const problems = [];

/* ── 1 + 3. Every href in every built page. ─────────────────────────────── */
for (const file of pages) {
  const html = readFileSync(file, "utf8");
  const from = toRoute(file);
  const ids = new Set(Array.from(html.matchAll(/\sid="([^"]+)"/g), (m) => m[1]));

  for (const m of html.matchAll(/\shref="([^"]*)"/g)) {
    const href = m[1];
    if (!href || href.startsWith("http") || href.startsWith("mailto:") ||
        href.startsWith("tel:") || href.startsWith("data:")) continue;

    const [path, hash] = href.split("#");

    if (!path) {
      // Same-page anchor.
      if (hash && !ids.has(hash)) problems.push([from, href, "no element with that id on this page"]);
      continue;
    }
    if (!path.startsWith("/")) {
      problems.push([from, href, "relative link; write internal links from the root"]);
      continue;
    }
    if (!resolves(path)) {
      problems.push([from, href, "no page or file at that path"]);
      continue;
    }
    if (hash) {
      const targetFile = path === "/" ? join(DIST, "index.html") : join(DIST, path.slice(1) + ".html");
      if (existsSync(targetFile)) {
        const targetIds = new Set(Array.from(readFileSync(targetFile, "utf8").matchAll(/\sid="([^"]+)"/g), (x) => x[1]));
        if (!targetIds.has(hash)) problems.push([from, href, "target page has no element with that id"]);
      }
    }
  }
}

/* ── 2. Every declared route has a page. ───────────────────────────────── */
const routesSrc = readFileSync("src/data/routes.ts", "utf8");
const declared = Array.from(routesSrc.matchAll(/path:\s*"([^"]+)"/g), (m) => m[1]);
const extraDeclared = ["/", "/pricing", "/404"];
for (const path of new Set([...declared, ...extraDeclared])) {
  if (!built.has(path)) problems.push(["src/data/routes.ts", path, "declared in the manifest but no page was built"]);
}

/* ── Report ────────────────────────────────────────────────────────────── */
console.log(`${pages.length} pages built, ${built.size} routes.`);

if (!problems.length) {
  console.log("Every internal link resolves. Every declared route has a page.");
  process.exit(0);
}

const byPage = new Map();
for (const [from, href, why] of problems) {
  if (!byPage.has(from)) byPage.set(from, []);
  byPage.get(from).push([href, why]);
}
console.log(`\n${problems.length} broken link(s):\n`);
for (const [from, list] of byPage) {
  console.log(`  ${from}`);
  for (const [href, why] of list) console.log(`    ${href}  ->  ${why}`);
}
process.exit(1);
