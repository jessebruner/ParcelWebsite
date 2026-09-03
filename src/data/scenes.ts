/**
 * WHICH LANDSCAPE EACH PAGE STANDS IN.
 *
 * src/scripts/scene-engine.js paints eight. Two of them, `summer` and
 * `winterglade`, are bright green and bright white respectively; white hero
 * copy over either needs a scrim heavy enough to hide the picture, which is a
 * worse outcome than not using the picture. They are good art for a light
 * surface and every scene on this site is drawn behind white, so six are in
 * play:
 *
 *   dusk    a marsh at sunset. Purple sky, dark conifer treeline.
 *   dawn    a river under mist. Cold greys, the lightest of the six.
 *   winter  the marsh under snow, stars out. High contrast, quiet.
 *   street  houses at dusk with their windows lit. The one that is
 *           unmistakably about a neighbourhood rather than about weather.
 *   storm   rain over a lake. The darkest, and the only one with weather in it.
 *   autumn  an orange treeline over cold water. The only warm mid-tone.
 *
 * Nine pages and six scenes means three scenes are used twice, and the seed is
 * what makes the second use a different picture: the treeline, the cloud
 * layers and the reed placement all come off it.
 *
 * The rule the table keeps: a page's closer is never its own hero's scene, and
 * no two pages share the same (hero, closer) pair. A reader moving down one
 * page sees two different landscapes, and a reader moving across the nine
 * never sees the same page twice. Both are asserted in
 * tests/product-scenes.test.mjs, because a table is exactly the kind of thing
 * that gets edited one row at a time.
 */
export type SceneKey = "dusk" | "dawn" | "winter" | "street" | "storm" | "autumn" | "hilltop";

export interface FeatureArt {
  /** Behind the h1. */
  scene: SceneKey;
  /** Seed for the hero. Prime and far apart, so no two treelines rhyme. */
  seed: number;
  /** Behind the closing line. Never the same scene as the hero. */
  closeScene: SceneKey;
  seedClose: number;
  /**
   * The weather strip between chapters. sky.js paints it and knows two ramps,
   * so this stays dusk or dawn whatever the hero is -- a strip is a texture
   * between chapters, not a small copy of the picture at the top.
   */
  strip: "dusk" | "dawn";
}

export const FEATURE_ART: Record<string, FeatureArt> = {
  /* The street is the most on-brand picture we have, so it opens the page a
     board is most likely to arrive on. */
  "dues-and-payments": { scene: "street", seed: 13, closeScene: "dusk", seedClose: 211, strip: "dawn" },
  collections: { scene: "storm", seed: 29, closeScene: "dawn", seedClose: 223, strip: "dawn" },
  "accounting-and-budgets": { scene: "dusk", seed: 43, closeScene: "autumn", seedClose: 227, strip: "dusk" },
  "rules-and-enforcement": { scene: "autumn", seed: 57, closeScene: "winter", seedClose: 229, strip: "dawn" },
  "meetings-and-voting": { scene: "dawn", seed: 71, closeScene: "street", seedClose: 233, strip: "dusk" },
  "documents-and-answers": { scene: "winter", seed: 89, closeScene: "storm", seedClose: 239, strip: "dusk" },
  "vendors-and-insurance": { scene: "dusk", seed: 103, closeScene: "street", seedClose: 241, strip: "dawn" },
  "resident-portal": { scene: "street", seed: 127, closeScene: "autumn", seedClose: 251, strip: "dusk" },
  "records-and-audit": { scene: "winter", seed: 149, closeScene: "dawn", seedClose: 257, strip: "dawn" },
};

export const DEFAULT_ART: FeatureArt = {
  scene: "dusk",
  seed: 7,
  closeScene: "dawn",
  seedClose: 4,
  strip: "dawn",
};
