import type { APIRoute } from "astro";
import { POSTS } from "../../data/posts";

const SITE = "https://commonparcel.com";
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const GET: APIRoute = () => {
  const sorted = [...POSTS].sort((a, b) => b.published.localeCompare(a.published));
  const items = sorted.map((p) => [
    "    <item>",
    `      <title>${esc(p.title)}</title>`,
    `      <link>${SITE}/blog/${p.slug}</link>`,
    `      <guid isPermaLink="true">${SITE}/blog/${p.slug}</guid>`,
    `      <description>${esc(p.description)}</description>`,
    `      <category>${esc(p.topic)}</category>`,
    `      <pubDate>${new Date(p.published + "T00:00:00Z").toUTCString()}</pubDate>`,
    "      <author>jesse@commonparcel.com (Jesse Bruner)</author>",
    "    </item>",
  ].join("\n")).join("\n");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    "  <channel>",
    "    <title>Common Parcel</title>",
    `    <link>${SITE}/blog</link>`,
    "    <description>Statutory deadlines, due process, and what things actually cost. Written for volunteer boards.</description>",
    "    <language>en-us</language>",
    items,
    "  </channel>",
    "</rss>",
  ].join("\n");

  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
