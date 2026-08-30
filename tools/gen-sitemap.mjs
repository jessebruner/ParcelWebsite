/**
 * Sitemap from the route manifest. Written into dist after the build.
 *
 * LASTMOD IS A CLAIM, so it is only made where something knows the answer.
 * This used to stamp the build date on all 25 URLs, which told Google that
 * every page on the site changed every time anything deployed. A date that is
 * true of everything distinguishes nothing, and a crawler that learns the
 * signal is meaningless stops spending it on the pages that did change.
 *
 * Blog posts have a real date in src/data/blog.ts and carry it. Everything
 * else has no tracked date, so it carries no lastmod at all — the element is
 * optional, and omitting it says "unknown" where the build date said something
 * false. tools/check-seo.mjs fails if every entry ever agrees again.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

mkdirSync("dist", { recursive: true });

const src = readFileSync("src/data/routes.ts", "utf8");
const manifest = /export const ALL_ROUTES[^=]*=\s*\[([\s\S]*?)\];/.exec(src);
if (!manifest) throw new Error("ALL_ROUTES manifest not found in src/data/routes.ts");
const declared = Array.from(manifest[1].matchAll(/"([^"]+)"/g), (m) => m[1]);
const routes = [...new Set(declared)].filter((p) => p !== "/404").sort();

/*
 * Read straight out of the post data rather than importing it, because this
 * runs as plain node and blog.ts is TypeScript. Paired: a slug with no date,
 * or a date with no slug, throws instead of silently dropping the stamp.
 */
const blog = readFileSync("src/data/blog.ts", "utf8");
const dates = new Map();
for (const m of blog.matchAll(/slug:\s*"([^"]+)"[\s\S]{0,600}?publishedAt:\s*"(\d{4}-\d{2}-\d{2})"/g)) {
  dates.set(`/blog/${m[1]}`, m[2]);
}
const slugCount = [...blog.matchAll(/^\s{4}slug:\s*"[^"]+"/gm)].length;
if (slugCount === 0) throw new Error("no post slugs found in src/data/blog.ts");
if (dates.size !== slugCount) {
  throw new Error(`found ${slugCount} post slugs but only ${dates.size} publishedAt dates; the sitemap would omit some silently`);
}

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...routes.map((p) => {
    const lastmod = dates.get(p);
    return [
      "  <url>",
      `    <loc>https://commonparcel.com${p}</loc>`,
      ...(lastmod ? [`    <lastmod>${lastmod}</lastmod>`] : []),
      "  </url>",
    ].join("\n");
  }),
  "</urlset>",
  "",
].join("\n");

writeFileSync("dist/sitemap.xml", xml);
const stamped = routes.filter((p) => dates.has(p)).length;
console.log(`sitemap: ${routes.length} urls, ${stamped} with a real lastmod, ${routes.length - stamped} with none`);
