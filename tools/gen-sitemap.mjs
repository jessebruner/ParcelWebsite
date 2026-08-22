/**
 * Sitemap from the route manifest. Written into dist after the build.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
mkdirSync("dist", { recursive: true });
const src = readFileSync("src/data/routes.ts", "utf8");
const declared = Array.from(src.matchAll(/path:\s*"([^"]+)"/g), (m) => m[1]);
const routes = [...new Set(["/", "/pricing", ...declared])]
  .filter((p) => p !== "/404")
  .sort();
const epoch = process.env.SOURCE_DATE_EPOCH ? parseInt(process.env.SOURCE_DATE_EPOCH, 10) * 1000 : Date.now();
const today = new Date(epoch).toISOString().slice(0, 10);
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
console.log(`sitemap: ${routes.length} urls`);
