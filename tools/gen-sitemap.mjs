/**
 * Sitemap from the route manifest, so it cannot list a page that does not exist
 * or miss one that does. Written into dist after the build.
 */
import { readFileSync, writeFileSync } from "node:fs";
const src = readFileSync("src/data/routes.ts", "utf8");
const declared = Array.from(src.matchAll(/path:\s*"([^"]+)"/g), (m) => m[1]);
const routes = [...new Set(["/", "/pricing", "/compliance", "/use-cases", "/blog", ...declared])]
  .filter((p) => p !== "/404")
  .sort();
const today = new Date().toISOString().slice(0, 10);
const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...routes.map((p) => [
    "  <url>",
    `    <loc>https://commonparcel.com${p}</loc>`,
    `    <lastmod>${today}</lastmod>`,
    "  </url>",
  ].join("\n")),
  "</urlset>",
  "",
].join("\n");
writeFileSync("dist/sitemap.xml", xml);
writeFileSync("public/sitemap.xml", xml);
console.log(`sitemap: ${routes.length} urls`);
