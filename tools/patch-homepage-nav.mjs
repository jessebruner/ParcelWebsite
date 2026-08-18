/**
 * Give the restored homepage the site's navigation. Idempotent.
 *
 * The homepage is the original bundle, which is the right call: it carries the
 * painted marsh, the scroll statement, the animated product panels and the
 * price slider, and rebuilding all of that produced something worse. But its
 * masthead only ever had a Price anchor and a button, so from home there was no
 * way into the rest of the site. That is the defect this fixes.
 *
 * The template is a JSON string on one line and the bundler escapes every "</"
 * so the payload cannot terminate its own script tag. Nothing here writes those
 * escapes by hand: the template is decoded, edited as plain HTML, re-encoded
 * with JSON.stringify, and only then is "</" put back. An earlier attempt did
 * write them by hand, a backslash level collapsed, and the page stopped
 * parsing.
 */
import { readFileSync, writeFileSync } from "node:fs";

const PAGE = "public/index.html";
const MARKER = "data-site-nav";

const LINKS = [
  ["/product/dues-and-payments", "Product"],
  ["/compliance", "Compliance"],
  ["/use-cases", "Use cases"],
  ["/pricing", "Price"],
  ["/vs/payhoa", "Compare"],
  ["/blog", "Blog"],
];

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

if (template.includes(MARKER)) {
  console.log("already patched");
  process.exit(0);
}

/* 1. Swap the single Price anchor for the site's top-level links. */
const oldLink = '<a href="#price" class="navlink navlink--price" style="color: #6E6559;">Price</a>';
if (!template.includes(oldLink)) throw new Error("nav link anchor not found");
const newLinks = LINKS.map(([href, label]) =>
  `<a href="${href}" class="navlink" ${MARKER}="" style="color: #6E6559;">${label}</a>`
).join("\n            ");
template = template.replace(oldLink, newLinks);

/*
 * 2. The bundle already hides its one nav link below 720px, where the lockup
 *    plus the button is the whole bar. Six links need the same treatment, so
 *    widen that rule rather than adding a competing one.
 */
const oldRule = ".navlink--price { display: none; }";
if (!template.includes(oldRule)) throw new Error("mobile nav rule not found");
template = template.replace(oldRule, ".navlink { display: none; }");

lines[at.template] = JSON.stringify(template).replace(/<\//g, "<\\u002F");
writeFileSync(PAGE, lines.join("\n"));

/* Every payload must still parse, or the page will not unpack at all. */
const out = readFileSync(PAGE, "utf8").split("\n");
const outAt = {};
out.forEach((l, i) => {
  const m = /<script type="__bundler\/(\w+)">/.exec(l);
  if (m) outAt[m[1]] = i + 1;
});
const parsed = {};
for (const tag of ["template", "manifest", "ext_resources", "page_order"]) parsed[tag] = JSON.parse(out[outAt[tag]]);

console.log(`added ${LINKS.length} nav links`);
console.log(`  template ${parsed.template.length} chars, manifest ${Object.keys(parsed.manifest).length} assets`);
console.log(`  all four payloads parse`);
console.log(`  payload cannot close its script tag: ${!out[outAt.template].includes("</")}`);
for (const [href] of LINKS) {
  if (!parsed.template.includes(`href="${href}"`)) throw new Error(`link missing after write: ${href}`);
}
console.log(`  every link present in the rendered page`);
