import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { requireFreshDist } from "../tools/dist-freshness.mjs";
import { FEATURES } from "../src/data/features/index.ts";
import { FEATURE_ART } from "../src/data/scenes.ts";

/**
 * Nine pages, six landscapes, and the table that assigns them.
 *
 * A lookup table keyed by slug is the shape that rots quietly: a page is
 * renamed and its row is orphaned, a row is copied and two pages open on the
 * same picture, a closer is set to its own hero's scene and the page reads as
 * one long band of the same weather. None of that fails a build.
 *
 * The engine's other two scenes are checked for too. `summer` and
 * `winterglade` are bright, every scene on this site is drawn behind white
 * copy, and the veil that would make them safe is heavy enough to hide them.
 * They are excluded by argument, so the exclusion is asserted rather than left
 * to whoever edits the table next.
 */

requireFreshDist();

const ALLOWED = new Set(["dusk", "dawn", "winter", "street", "storm", "autumn"]);
const TOO_BRIGHT = ["summer", "winterglade"];

test("every feature page has a row, and no row is orphaned", () => {
  const slugs = new Set(FEATURES.map((f) => f.slug));
  for (const f of FEATURES) {
    assert.ok(FEATURE_ART[f.slug], `${f.slug} has no scene`);
  }
  for (const key of Object.keys(FEATURE_ART)) {
    assert.ok(slugs.has(key), `scenes.ts has a row for "${key}", which is not a page`);
  }
});

test("a page never closes on the scene it opened with", () => {
  for (const [slug, art] of Object.entries(FEATURE_ART)) {
    assert.notEqual(
      art.scene,
      art.closeScene,
      `${slug} opens and closes on ${art.scene}; the page reads as one band of weather`,
    );
  }
});

test("no two pages run the same pair of scenes", () => {
  const seen = new Map();
  for (const [slug, art] of Object.entries(FEATURE_ART)) {
    const pair = `${art.scene}>${art.closeScene}`;
    assert.ok(!seen.has(pair), `${slug} and ${seen.get(pair)} are the same two pictures in the same order`);
    seen.set(pair, slug);
  }
});

test("no two pages share a seed", () => {
  const seeds = Object.values(FEATURE_ART).flatMap((a) => [a.seed, a.seedClose]);
  assert.equal(new Set(seeds).size, seeds.length, "a repeated seed paints a repeated picture");
});

test("only scenes that hold white copy are used", () => {
  for (const [slug, art] of Object.entries(FEATURE_ART)) {
    for (const key of [art.scene, art.closeScene]) {
      assert.ok(ALLOWED.has(key), `${slug} uses "${key}", which is not one of the six`);
    }
  }
});

test("the two bright scenes stay out of the table", () => {
  const used = new Set(Object.values(FEATURE_ART).flatMap((a) => [a.scene, a.closeScene]));
  for (const key of TOO_BRIGHT) {
    assert.ok(
      !used.has(key),
      `"${key}" is bright enough that the scrim needed to hold white copy over it would hide it`,
    );
  }
});

/**
 * The names in the table have to be names the painter knows. Nothing in the
 * pipeline checks that: the engine falls back to dusk for an unknown key, so a
 * typo would ship as nine pages quietly opening on the same marsh. Read as
 * text rather than imported, because the engine is a browser module that
 * touches document on load.
 */
test("every scene named in the table exists in the engine", () => {
  const src = readFileSync("src/scripts/scene-engine.js", "utf8");
  const registry = src.slice(src.indexOf("const SCENES = {"), src.indexOf("class Component"));
  for (const key of [...ALLOWED, ...TOO_BRIGHT]) {
    assert.ok(
      registry.includes(`\n  ${key}: {`),
      `the engine has no scene called "${key}"; the table would silently fall back to dusk`,
    );
  }
});

test("each page renders the scene the table gives it", () => {
  for (const [slug, art] of Object.entries(FEATURE_ART)) {
    const html = readFileSync(`dist/product/${slug}.html`, "utf8");
    const scenes = [...html.matchAll(/data-scene="([a-z]+)"/g)].map((m) => m[1]);
    assert.ok(
      scenes.includes(art.scene),
      `${slug} should open on ${art.scene}; the page carries ${JSON.stringify(scenes)}`,
    );
    assert.ok(
      scenes.includes(art.closeScene),
      `${slug} should close on ${art.closeScene}; the page carries ${JSON.stringify(scenes)}`,
    );
  }
});
