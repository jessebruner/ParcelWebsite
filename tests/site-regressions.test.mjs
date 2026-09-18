import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { ALL_ROUTES, PRODUCT_GROUPS } from "../src/data/routes.ts";
import { BLOG_POSTS } from "../src/data/blog.ts";
import { APP_URL, HOME_FAQS } from "../src/data/site.ts";
import { price, money, DEFAULT_BRACKETS, DEFAULT_MINIMUM } from "../src/components/pricing/brackets.ts";
import { requireFreshDist } from "../tools/dist-freshness.mjs";
import { decodeEntities, jsonLdBlocks } from "../tools/check-seo.mjs";
requireFreshDist();
const read = route => readFileSync(`dist/${route === "/" ? "index" : route.slice(1)}.html`, "utf8");
const shown = html => decodeEntities(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "").replace(/<style\b[^>]*>[\s\S]*?<\/style>/g, ""));

for (const route of ALL_ROUTES) {
  test(`${route}: shared landmarks, navigation, and direct app CTA`, () => {
    const html = read(route);
    assert.equal((html.match(/<main[\s>]/g) ?? []).length, 1);
    assert.equal((html.match(/<header[\s>][^>]*class="mast"/g) ?? []).length, 1);
    assert.equal((html.match(/<footer[\s>]/g) ?? []).length, 1);
    assert.match(html, /href="#main"[^>]*>Skip to content/);
    assert.match(html, /<main id="main"/);
    assert.match(html, /aria-label="Main navigation"/);
    assert.match(html, /class="lockup"[^>]*aria-label="Common Parcel home"/);
    assert.match(html, /aria-controls="site-nav"/);
    assert.ok(html.includes(`href="${APP_URL}"`));
    assert.doesNotMatch(shown(html), /early.access|data-open-modal|<dialog\b|mailto:[^"<>]*\?subject=/i);
    assert.doesNotMatch(html, /__bundler\/template/);
  });
}

test("all primary conversion links go to the requested app", () => {
  let count = 0;
  for (const route of ALL_ROUTES) {
    for (const [, attrs, body] of read(route).matchAll(/<a\s([^>]+)>([\s\S]*?)<\/a>/g)) {
      const label = body.replace(/<[^>]+>/g, "").trim();
      if (/^(Get started|Open the app)/.test(label)) { assert.ok(attrs.includes(`href="${APP_URL}"`), `${route}: ${label}`); count++; }
    }
  }
  assert.ok(count >= ALL_ROUTES.length);
});

test("native homepage is small and has matching visible FAQ data", () => {
  const html = read("/");
  assert.ok(statSync("dist/index.html").size < 50000, "homepage regressed to an exported asset bundle");
  const schema = jsonLdBlocks(html).flatMap(block => JSON.parse(block)).find(item => item["@type"] === "FAQPage");
  assert.deepEqual(schema.mainEntity.map(item => [item.name, item.acceptedAnswer.text]), HOME_FAQS);
  for (const [question, answer] of HOME_FAQS) { assert.ok(shown(html).includes(question)); assert.ok(shown(html).includes(answer)); }
});

for (const route of ["/", "/pricing"]) test(`${route}: four units cost $10 before client scripts run`, () => {
  const html = read(route);
  const total = price(DEFAULT_BRACKETS, 4, DEFAULT_MINIMUM).total;
  assert.ok(html.includes(`>${money(total, 0)}</span>`));
  assert.match(html, /id="lot-count"[^>]*value="4"/);
  assert.match(html, /<output[^>]*aria-live="polite"[^>]*aria-atomic="true"/);
  assert.match(html, /<label for="lot-count"[^>]*>/);
  assert.match(html, /<noscript>/);
});

test("every guide has a working table of contents and related guides", () => {
  for (const post of BLOG_POSTS) {
    const html = read(`/blog/${post.slug}`);
    assert.match(html, /aria-label="In this guide"/);
    const targets = [...html.matchAll(/href="#(section-\d+)"/g)].map(match => match[1]);
    assert.equal(targets.length, post.sections.filter(section => section.heading).length);
    assert.ok(targets.length > 0);
    for (const id of targets) assert.ok(html.includes(`id="${id}"`));
    assert.match(html, /class="related-guides"/);
  }
});

test("reading and action colors have sufficient text contrast", () => {
  const css = readFileSync("src/styles/tokens.css", "utf8");
  const colors = Object.fromEntries([...css.matchAll(/--([a-z0-9-]+):\s*(#[a-f0-9]{6})/gi)].map(m => [m[1], m[2]]));
  const luminance = hex => {
    const rgb = hex.slice(1).match(/../g).map(channel => parseInt(channel, 16) / 255).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4);
    return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
  };
  for (const [fg, bg] of [["ink", "paper"], ["ink-body", "paper"], ["ink-3", "field"], ["terracotta", "paper"], ["paper", "terracotta"], ["mist", "night"], ["sand", "night"], ["forest", "sage"], ["paper", "forest"]]) {
    const a = luminance(colors[fg]), b = luminance(colors[bg]);
    assert.ok((Math.max(a, b) + .05) / (Math.min(a, b) + .05) >= 4.5, `${fg} on ${bg}`);
  }
});

test("all pages have a full closing CTA and no decorative preheadings", () => {
  for (const route of ALL_ROUTES) {
    const html = read(route);
    assert.equal((html.match(/class="closing on-ink"/g) ?? []).length, 1, route);
    assert.doesNotMatch(shown(html), /class="eyebrow"|Everything in its place|Find a rule|Hand over the records/);
    const closing = html.slice(html.indexOf('class="closing on-ink"'), html.indexOf("</main>"));
    assert.ok(closing.includes('data-animated="true"'), route);
    assert.ok(closing.includes(`href="${APP_URL}"`), route);
    assert.ok(closing.includes("Pause animation"), route);
  }
});

test("the mega menu and homepage reach every product area", () => {
  const home = read("/");
  const menu = home.slice(home.indexOf('id="product-menu"'), home.indexOf('id="company-menu"'));
  const main = home.slice(home.indexOf('<main id="main"'), home.indexOf('</main>'));
  for (const item of PRODUCT_GROUPS.flatMap(group => group.items)) {
    assert.ok(menu.includes(`href="${item.path}"`), `menu: ${item.path}`);
    assert.ok(main.includes(`href="${item.path}"`), `homepage: ${item.path}`);
  }
});

test("each guide has its own illustration in the directory and article", () => {
  const directory = read("/blog");
  for (const post of BLOG_POSTS) {
    assert.ok(directory.includes(`subject-${post.artSubject}`));
    assert.ok(read(`/blog/${post.slug}`).includes(`subject-${post.artSubject}`));
  }
});
