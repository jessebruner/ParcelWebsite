/**
 * Split the two monoliths so nine pages can actually be nine different pages.
 *
 *   src/data/content.ts          908 lines, FEATURES holds all nine specs
 *   src/components/product/FeatureScene.astro   299 lines, nine diagrams and
 *                                               one stylesheet
 *
 * Both become a directory of one file per page plus a small index. This is not
 * only so that several people can edit different pages without landing on the
 * same lines: the brief is that the nine pages should stop looking like one
 * page rendered nine times, and a single 900-line array is the thing that made
 * "give this page its own shape" mean "edit the file every other page shares".
 *
 * The template stays. Nine hand-written .astro routes would drift.
 *
 * Run once, from the repo root. Every anchor is asserted.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";

const SLUGS = [
  "dues-and-payments", "collections", "accounting-and-budgets", "rules-and-enforcement",
  "meetings-and-voting", "documents-and-answers", "vendors-and-insurance",
  "resident-portal", "records-and-audit",
];

const camel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

/* ── 1. content.ts ──────────────────────────────────────────────────── */

const CONTENT = "src/data/content.ts";
let content = readFileSync(CONTENT, "utf8");
const nl = content.includes("\r\n") ? "\r\n" : "\n";

const arrStart = content.indexOf("export const FEATURES: PageSpec[] = [");
if (arrStart === -1) throw new Error("FEATURES not found");
const arrEnd = content.indexOf(nl + "];", arrStart);
if (arrEnd === -1) throw new Error("FEATURES not closed");
const arrBody = content.slice(content.indexOf("[", arrStart) + 1, arrEnd);

mkdirSync("src/data/features", { recursive: true });

const specs = [];
for (let i = 0; i < SLUGS.length; i++) {
  const at = arrBody.indexOf(`slug: "${SLUGS[i]}",`);
  if (at === -1) throw new Error(`slug missing: ${SLUGS[i]}`);
  const objStart = arrBody.lastIndexOf("{", at);
  const nextAt = i + 1 < SLUGS.length ? arrBody.indexOf(`slug: "${SLUGS[i + 1]}",`) : -1;
  const objEnd = nextAt === -1 ? arrBody.length : arrBody.lastIndexOf("{", nextAt);
  specs.push({ slug: SLUGS[i], text: arrBody.slice(objStart, objEnd) });
}

for (const s of specs) {
  // Re-indent from inside an array literal to top level.
  const body = s.text
    .split(nl)
    .map((l) => (l.startsWith("  ") ? l.slice(2) : l))
    .join(nl)
    .replace(/,\s*$/, "")
    .trimEnd();
  const file = `src/data/features/${s.slug}.ts`;
  const out =
    `/**${nl}` +
    ` * ${s.slug}${nl}` +
    ` *${nl}` +
    ` * One page, one file. See src/data/content.ts for the shared shape and${nl}` +
    ` * src/data/features/index.ts for the order they appear in.${nl}` +
    ` */${nl}` +
    `import type { PageSpec } from "../content";${nl}${nl}` +
    `export const ${camel(s.slug)}: PageSpec = ${body};${nl}`;
  writeFileSync(file, out);
}

const idx =
  `/**${nl}` +
  ` * The nine feature pages, in nav order.${nl}` +
  ` *${nl}` +
  ` * They still render through one template, because nine hand-written routes${nl}` +
  ` * would drift. They no longer share one file, because "give this page its own${nl}` +
  ` * shape" should not mean "edit the file every other page shares".${nl}` +
  ` */${nl}` +
  `import type { PageSpec } from "../content";${nl}` +
  SLUGS.map((s) => `import { ${camel(s)} } from "./${s}";`).join(nl) + nl + nl +
  `export const FEATURES: PageSpec[] = [${nl}` +
  SLUGS.map((s) => `  ${camel(s)},`).join(nl) + nl +
  `];${nl}`;
writeFileSync("src/data/features/index.ts", idx);

// content.ts keeps the types and the other collections, and re-exports FEATURES
// so nothing that imports it has to change.
content =
  content.slice(0, arrStart) +
  `export { FEATURES } from "./features";${nl}` +
  content.slice(arrEnd + nl.length + 2);
writeFileSync(CONTENT, content);

/* ── 2. FeatureScene.astro ──────────────────────────────────────────── */

const SCENE = "src/components/product/FeatureScene.astro";
const scene = readFileSync(SCENE, "utf8");

const styleAt = scene.indexOf("<style>");
if (styleAt === -1) throw new Error("FeatureScene has no <style>");
const sharedStyle = scene.slice(styleAt);

mkdirSync("src/components/product/scenes", { recursive: true });

for (const slug of SLUGS) {
  const open = scene.indexOf(`{slug === "${slug}" && (`);
  if (open === -1) throw new Error(`scene block missing: ${slug}`);
  const bodyStart = scene.indexOf("(", open) + 1;
  // Walk to the matching paren so nested JSX does not truncate the block.
  let depth = 1, i = bodyStart;
  while (i < scene.length && depth > 0) {
    if (scene[i] === "(") depth++;
    else if (scene[i] === ")") depth--;
    i++;
  }
  if (depth !== 0) throw new Error(`scene block unbalanced: ${slug}`);
  const markup = scene.slice(bodyStart, i - 1).trim();

  const file = `src/components/product/scenes/${slug}.astro`;
  if (existsSync(file)) throw new Error(`refusing to overwrite ${file}`);
  writeFileSync(
    file,
    `---${nl}` +
    `/**${nl}` +
    ` * ${slug} — the hero diagram.${nl}` +
    ` *${nl}` +
    ` * Lifted verbatim from the nine-in-one FeatureScene so it can be rebuilt${nl}` +
    ` * without touching the other eight. It is still the static version.${nl}` +
    ` *${nl}` +
    ` * The shared chrome (.feature-scene, .scene-top, .scene-body) lives in${nl}` +
    ` * FeatureScene.astro and is inherited. Styles that belong only to this${nl}` +
    ` * scene belong in this file.${nl}` +
    ` */${nl}` +
    `---${nl}${nl}` +
    markup + nl
  );
}

const router =
  `---${nl}` +
  `/**${nl}` +
  ` * The hero diagram for a feature page. One file per scene under ./scenes.${nl}` +
  ` *${nl}` +
  ` * These are diagrams, not screenshots. They are hidden from assistive${nl}` +
  ` * technology, so any text inside one reaches nobody — not a screen reader,${nl}` +
  ` * not a crawler. A scene that needs a sentence to be understood is a scene${nl}` +
  ` * that has not been drawn yet.${nl}` +
  ` */${nl}` +
  SLUGS.map((s) => `import ${camel(s)} from "./scenes/${s}.astro";`).join(nl) + nl + nl +
  `interface Props { slug: string; }${nl}` +
  `const { slug } = Astro.props;${nl}${nl}` +
  `const SCENES: Record<string, any> = {${nl}` +
  SLUGS.map((s) => `  "${s}": ${camel(s)},`).join(nl) + nl +
  `};${nl}${nl}` +
  `const TITLES: Record<string, string> = {${nl}` +
  `  "dues-and-payments": "Owner to association",${nl}` +
  `  collections: "Collections plan",${nl}` +
  `  "accounting-and-budgets": "Board budget",${nl}` +
  `  "rules-and-enforcement": "Rule review",${nl}` +
  `  "meetings-and-voting": "Meeting workspace",${nl}` +
  `  "documents-and-answers": "Association library",${nl}` +
  `  "vendors-and-insurance": "Contract calendar",${nl}` +
  `  "resident-portal": "Resident view",${nl}` +
  `  "records-and-audit": "Decision record",${nl}` +
  `};${nl}${nl}` +
  `const Scene = SCENES[slug];${nl}` +
  `---${nl}${nl}` +
  `<div class:list={["feature-scene", \`feature-scene--\${slug}\`]} aria-hidden="true">${nl}` +
  `  <div class="scene-top">${nl}` +
  `    <span class="scene-mark"><i></i><i></i><i></i></span>${nl}` +
  `    <span>{TITLES[slug] ?? "Common Parcel"}</span>${nl}` +
  `  </div>${nl}` +
  `  {Scene && <Scene />}${nl}` +
  `</div>${nl}${nl}` +
  sharedStyle;
writeFileSync(SCENE, router);

console.log("content.ts   -> src/data/features/{" + SLUGS.length + " files}.ts + index.ts");
console.log("FeatureScene -> src/components/product/scenes/{" + SLUGS.length + " files}.astro + router");
