import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

function assertTextureHeroScrim(source) {
  const start = source.indexOf(".veil {");
  const live = source.indexOf(".hero.live .veil", start);
  assert.notEqual(start, -1, "Hero.astro has no default veil rule");
  assert.ok(live > start, "Hero.astro has no separate live veil rule");
  const rule = source.slice(start, live);
  assert.ok(
    rule.includes("linear-gradient(90deg"),
    "texture heroes have no copy-side scrim; their ledes fall below 4.5:1",
  );
  assert.ok(
    rule.includes("rgba(14, 12, 20, 0.34) 70%"),
    "the texture scrim fades before the longest desktop lede ends",
  );
  assert.match(
    source,
    /@media \(max-width: 900px\)[\s\S]*?\.veil, \.hero\.live \.veil\s*\{/,
    "the full-width mobile copy does not get the full-width veil",
  );
}

function assertModalCloseTarget(source) {
  const start = source.indexOf(".ea-close-btn {");
  const end = source.indexOf("}", start);
  assert.notEqual(start, -1, "EarlyAccessModal.astro has no close-button rule");
  const rule = source.slice(start, end);
  assert.match(rule, /width:\s*44px;/, "modal close target is narrower than 44px");
  assert.match(rule, /height:\s*44px;/, "modal close target is shorter than 44px");
}

test("texture heroes carry a copy-side contrast scrim at desktop and mobile", () => {
  assertTextureHeroScrim(readFileSync("src/components/Hero.astro", "utf8"));
});

test("mutation: removing the texture copy-side scrim fails", () => {
  const source = readFileSync("src/components/Hero.astro", "utf8");
  assert.throws(
    () => assertTextureHeroScrim(source.replace("linear-gradient(90deg", "linear-gradient(180deg")),
    /copy-side scrim/,
  );
});

test("mutation: restoring the measured short fade fails", () => {
  const source = readFileSync("src/components/Hero.astro", "utf8").replace(
    "rgba(14, 12, 20, 0.34) 70%",
    "rgba(14, 12, 20, 0.26) 68%",
  );
  assert.throws(() => assertTextureHeroScrim(source), /fades before/);
});

test("the early-access close button is a 44px touch target", () => {
  assertModalCloseTarget(readFileSync("src/components/EarlyAccessModal.astro", "utf8"));
});

test("mutation: restoring the measured 24px close target fails", () => {
  const source = readFileSync("src/components/EarlyAccessModal.astro", "utf8")
    .replace("width: 44px;", "width: 24px;")
    .replace("height: 44px;", "height: 24px;");
  assert.throws(() => assertModalCloseTarget(source), /narrower than 44px/);
});
