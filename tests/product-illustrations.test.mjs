import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { FEATURES } from "../src/data/features/index.ts";
import { PRODUCT_ILLUSTRATIONS } from "../src/data/product-illustrations.ts";
import { requireFreshDist } from "../tools/dist-freshness.mjs";
import { decodeEntities } from "../tools/check-seo.mjs";
requireFreshDist();

test("every product has a distinct, accessible illustration with fictional data", () => {
  assert.deepEqual(Object.keys(PRODUCT_ILLUSTRATIONS).sort(), FEATURES.map(feature => feature.slug).sort());
  const descriptions = new Set();
  for (const feature of FEATURES) {
    const html = readFileSync(`dist/product/${feature.slug}.html`, "utf8");
    const figure = html.match(/<figure class="feature-art"[^>]*>([\s\S]*?)<\/figure>/)?.[1];
    assert.ok(figure, feature.slug);
    const description = PRODUCT_ILLUSTRATIONS[feature.slug].description;
    assert.ok(decodeEntities(figure).includes(`role="img" aria-label="${description}"`), feature.slug);
    assert.match(figure, /Illustrative example · Fictional association data/);
    assert.doesNotMatch(figure, /<(button|input|a)\b/, "illustrations must not add fake controls to keyboard navigation");
    descriptions.add(description);
  }
  assert.equal(descriptions.size, FEATURES.length);
});

test("navigation disclosures use centered vector chevrons and a valid product tour destination", () => {
  const home = readFileSync("dist/index.html", "utf8");
  const mast = home.slice(home.indexOf('<header class="mast"'), home.indexOf('</header>'));
  assert.equal((mast.match(/<svg class="chevron"/g) ?? []).length, 2);
  assert.doesNotMatch(mast, /⌄/);
  assert.match(mast, /href="\/product#product-tour"/);
  const product = readFileSync("dist/product.html", "utf8");
  assert.match(product, /id="product-tour"/);
});
