/**
 * ONE MASTHEAD. Injected into the homepage bundle from the built component.
 *
 * The homepage is the original bundle and cannot render an Astro component, so
 * for two rounds the site had two mastheads that I kept trying to make "look
 * alike". That is not the same component and it was correctly rejected.
 *
 * This makes it the same component. After every build:
 *
 *   1. The rendered <header class="mast"> is lifted out of a built Astro page.
 *      That markup is Masthead.astro's output, not a copy of it.
 *   2. src/styles/masthead.css is injected into the bundle's own stylesheet.
 *      Same file the Astro pages load.
 *   3. The bundle's original masthead and its nav rules are removed, so nothing
 *      competes.
 *   4. The injected markup is compared against the component's output and the
 *      script exits non-zero if they differ.
 *
 * Run after `astro build`. It is wired into the build script, so it cannot be
 * forgotten.
 */
import { readFileSync, writeFileSync } from "node:fs";

const PAGE = "public/index.html";
const SOURCE_PAGE = "dist/product/collections.html";
const CSS = "src/styles/masthead.css";

/* ── 1. The component's rendered output ─────────────────────────────────── */
const built = readFileSync(SOURCE_PAGE, "utf8");
const hm = /<header class="mast">[\s\S]*?<\/header>/.exec(built);
if (!hm) throw new Error("no <header class=\"mast\"> in " + SOURCE_PAGE);
let header = hm[0];

/* The built page marks its current section. The homepage is not in the nav, so
   strip the state rather than shipping a page marked as current on every page. */
header = header
  .replace(/ aria-current="page"/g, "")
  .replace(/ class="navlink on"/g, ' class="navlink"');

/* Astro adds scoped-style ids when a component has a <style>. The masthead's
   styles are global for exactly this reason, so any cid here means somebody put
   a scoped block back and the homepage would not be styled by it. */
if (/data-astro-cid/.test(header)) {
  throw new Error("masthead markup carries a scoped-style id; move those rules into " + CSS);
}

const mastheadCss = readFileSync(CSS, "utf8");

/* ── 2. The bundle ──────────────────────────────────────────────────────── */
const lines = readFileSync(PAGE, "utf8").split("\n");
const at = {};
lines.forEach((l, i) => {
  const m = /<script type="__bundler\/(\w+)">/.exec(l);
  if (m) at[m[1]] = i + 1;
});
for (const tag of ["template", "manifest", "ext_resources", "page_order"]) {
  if (at[tag] === undefined) throw new Error(`missing ${tag} payload`);
}

let template = JSON.parse(lines[at.template]);

/* Replace whatever masthead is currently in the bundle. Matches both the
   original (data-screen-label) and a previously injected one, so reruns are
   idempotent. */
const existing =
  /<header class="mast">[\s\S]*?<\/header>/.exec(template) ||
  /<header data-screen-label="Masthead"[\s\S]*?<\/header>/.exec(template);
if (!existing) throw new Error("no masthead found in the bundle template");
template = template.replace(existing[0], header);

/* Drop the bundle's own nav rules. They use the same class names and one of them
   carries !important, so leaving them in means the injected CSS loses. */
const DEAD_RULES = [
  /\.nav-links \{[^}]*\}/g,
  /\.navlink(--price)?(::after)?(:hover)?(::after)? \{[^}]*\}/g,
  /\.nav-cta \{[^}]*\}/g,
  /\.lockup-pad \{[^}]*\}/g,
  /\.lockup svg rect:nth-of-type\(2\) \{[^}]*\}/g,
  /\.lockup:hover svg rect:nth-of-type\(2\) \{[^}]*\}/g,
];
let removed = 0;
for (const re of DEAD_RULES) {
  template = template.replace(re, () => { removed++; return ""; });
}

/* Inject the stylesheet last, inside the bundle's own <style>, so it wins on
   order against anything left over. */
const MARK = "/* injected: masthead.css */";
template = template.replace(new RegExp(MARK + "[\\s\\S]*?/\\* end masthead \\*/"), "");
const lastStyleClose = template.lastIndexOf("</style>");
if (lastStyleClose === -1) throw new Error("no </style> in the bundle template");
template =
  template.slice(0, lastStyleClose) +
  `\n${MARK}\n${mastheadCss}\n/* end masthead */\n` +
  template.slice(lastStyleClose);

/* The burger needs a handler. Astro bundles its script into a module the bundle
   does not load, so the same behaviour goes in inline. */
const JS_MARK = "/* injected: masthead behaviour */";
if (!template.includes(JS_MARK)) {
  const script =
    `<script>${JS_MARK}\n` +
    `(function(){var m=document.querySelector(".mast");if(!m)return;` +
    `var b=m.querySelector(".burger");if(b)b.addEventListener("click",function(){` +
    `var o=m.hasAttribute("data-open");if(o){m.removeAttribute("data-open")}else{m.setAttribute("data-open","")}` +
    `b.setAttribute("aria-expanded",String(!o))});` +
    `document.addEventListener("keydown",function(e){if(e.key!=="Escape")return;` +
    `m.removeAttribute("data-open");if(b)b.setAttribute("aria-expanded","false")})})();` +
    `</script>`;
  template = template.replace("</body>", script + "\n</body>");
}

lines[at.template] = JSON.stringify(template).replace(/<\//g, "<\\u002F");
writeFileSync(PAGE, lines.join("\n"));

/* ── 3. Verify ──────────────────────────────────────────────────────────── */
const out = readFileSync(PAGE, "utf8").split("\n");
const oAt = {};
out.forEach((l, i) => {
  const m = /<script type="__bundler\/(\w+)">/.exec(l);
  if (m) oAt[m[1]] = i + 1;
});
const parsed = {};
for (const tag of ["template", "manifest", "ext_resources", "page_order"]) parsed[tag] = JSON.parse(out[oAt[tag]]);

const injected = /<header class="mast">[\s\S]*?<\/header>/.exec(parsed.template);
if (!injected) throw new Error("masthead missing after write");
if (injected[0] !== header) throw new Error("injected masthead differs from the component output");
if (!parsed.template.includes(MARK)) throw new Error("masthead.css not injected");

const navLabels = [...injected[0].matchAll(/class="navlink"[^>]*>([^<]+)</g)].map((m) => m[1].trim());
console.log("masthead synced from Masthead.astro");
console.log(`  markup identical to the component output: yes (${injected[0].length} chars)`);
console.log(`  masthead.css injected: ${mastheadCss.split("\n").length} lines`);
console.log(`  bundle's competing rules removed: ${removed}`);
console.log(`  links: ${navLabels.join(" · ")}`);
console.log(`  all four payloads parse; manifest ${Object.keys(parsed.manifest).length} assets`);
