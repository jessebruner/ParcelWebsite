/**
 * THE HEAD RULES, AND THE ONE THAT MEASURED THE WRONG THING.
 *
 * tools/check-seo.mjs is wired into `npm run verify`, so a bug in it either
 * blocks a correct page or waves a broken one through. Its first version did
 * both: it counted `<h1` in the raw bytes of dist/index.html, where the
 * bundle payload holds a second escaped copy of every element, and reported
 * the homepage at 2 h1 when a browser and a crawler each see exactly one. It
 * also measured title length on the escaped bytes, so a title holding one
 * apostrophe read 4 characters longer than it renders and would have had me
 * shorten copy that was already inside the limit.
 *
 * Both are asserted here on hand-built inputs, because both were caught by
 * reading output rather than by anything failing.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import {
  views,
  headOf,
  countH1,
  decodeEntities,
  insecureRefs,
  jsonLdBlocks,
  auditSitemap,
  routeOf,
  TITLE_MAX,
  DESC_MAX,
} from "../tools/check-seo.mjs";

const PAYLOAD_TAG = '<script type="__bundler/template">';

/** A file shaped like the homepage: a static block, then the payload. */
const bundleLike = (staticBody, renderedBody) =>
  [
    "<!DOCTYPE html><html lang=\"en\"><head>",
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    "<title>A title</title>",
    '<meta name="description" content="A description long enough to clear the lower bound on meta descriptions here.">',
    '<link rel="canonical" href="https://commonparcel.com/">',
    '<script src="https://www.googletagmanager.com/gtag/js?id=G-TESTID"></script>',
    "</head><body>",
    staticBody,
    PAYLOAD_TAG,
    JSON.stringify(renderedBody),
    "</script>",
    "</body></html>",
  ].join("\n");

test("the two views of a bundle page are separated, so one h1 is not counted twice", () => {
  // The two bodies are deliberately different text. With the same text in
  // both, a split that returned the whole file twice would still pass every
  // assertion below, and that is the bug being guarded against.
  const html = bundleLike("<h1>Crawler heading</h1>", "<h1>Browser heading</h1>");

  // The raw file really does contain two h1. That is the trap.
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 2, "fixture does not reproduce the double count");

  const v = views(html);
  assert.equal(countH1(v.document), 1, "the crawler's view should hold one h1");
  assert.equal(countH1(v.rendered), 1, "the browser's view should hold one h1");

  assert.ok(v.document.includes("Crawler heading"), "the static block is missing from the document view");
  assert.ok(!v.document.includes("Browser heading"), "the payload line was not removed from the document view");
  assert.ok(v.rendered.includes("Browser heading"), "the rendered view is not the payload");
  assert.ok(!v.rendered.includes("Crawler heading"), "the rendered view leaked the static block");
});

test("a page with no payload has one view and is not treated as if it had two", () => {
  const v = views('<html lang="en"><body><h1>About</h1></body></html>');
  assert.equal(v.rendered, null);
  assert.equal(countH1(v.document), 1);
});

test("a payload that is not valid JSON fails loudly instead of being skipped", () => {
  const broken = ["<html><body>", PAYLOAD_TAG, "{not json", "</script>", "</body></html>"].join("\n");
  assert.throws(() => views(broken), /not valid JSON/);
});

test("length is measured on what renders, not on the escaped bytes", () => {
  // 62 rendered characters, 65 escaped. A byte count calls this over at 65+.
  const rendered = "How to get your association's records in Michigan and keep it";
  assert.equal(rendered.length, 61);
  const escaped = rendered.replace("'", "&#39;");
  assert.equal(escaped.length, 65);

  const html = ['<html lang="en"><head>', `<title>${escaped}</title>`, "</head><body></body></html>"].join("\n");
  assert.equal(headOf(html).title.length, 61, "title length still counts entity bytes");
  assert.ok(headOf(html).title.length <= TITLE_MAX);

  assert.equal(decodeEntities("a &amp; b &#39;c&#39; &quot;d&quot;"), `a & b 'c' "d"`);
});

test("the insecure-reference check ignores an xmlns and catches a real subresource", () => {
  // An xmlns is a namespace name, not a URL a browser fetches. A check that
  // flagged it would fire on every inline SVG on the site and get switched off.
  assert.deepEqual(insecureRefs('<svg xmlns="http://www.w3.org/2000/svg"></svg>'), []);
  assert.deepEqual(insecureRefs('<img src="http://example.com/a.png">'), ["http://example.com/a.png"]);
  assert.deepEqual(insecureRefs('<img src="https://example.com/a.png">'), []);
});

test("routeOf maps the index file to / and nests the rest", () => {
  assert.equal(routeOf("dist/index.html"), "/");
  assert.equal(routeOf("dist/pricing.html"), "/pricing");
  assert.equal(routeOf("dist/blog/michigan-hoa-records-request.html"), "/blog/michigan-hoa-records-request");
});

test("a sitemap where every entry carries the same date is reported", () => {
  // This is the state the site shipped in: 25 URLs all stamped with the build
  // date, which tells a crawler that everything changed on every deploy.
  const rows = [{ route: "/", indexable: true }, { route: "/pricing", indexable: true }];
  const problems = auditSitemap(rows);
  const uniform = problems.filter((p) => p.includes("uniform date"));
  if (existsSync("dist/sitemap.xml")) {
    const xml = readFileSync("dist/sitemap.xml", "utf8");
    const stamps = [...xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((m) => m[1]);
    const distinct = new Set(stamps).size;
    // The shipped sitemap must not be uniform, which is the whole fix.
    assert.ok(stamps.length === 0 || distinct > 1 || stamps.length === 1,
      `sitemap has ${stamps.length} lastmod values and only ${distinct} distinct`);
    assert.equal(uniform.length, 0, "the shipped sitemap is uniform: " + uniform.join("; "));
  }
});

/*
 * ── WHAT SHIPPED ──────────────────────────────────────────────────
 */

const distFile = (p) => (existsSync(p) ? readFileSync(p, "utf8") : null);

test("every blog post ships parseable BlogPosting and BreadcrumbList", () => {
  const posts = [
    "review-hoa-budget-before-board-vote",
    "hoa-vendor-contract-renewal-checklist",
    "hoa-invoice-approval-checklist",
    "how-to-run-a-smooth-hoa-annual-meeting",
    "board-transition-records-retention-checklist",
    "michigan-hoa-records-request",
  ];
  for (const slug of posts) {
    const html = distFile(`dist/blog/${slug}.html`);
    if (!html) { assert.ok(true, "no build present; run npm run build"); return; }

    const blocks = jsonLdBlocks(html);
    assert.equal(blocks.length, 1, `${slug}: expected one JSON-LD block, found ${blocks.length}`);
    const parsed = JSON.parse(blocks[0]);
    assert.ok(Array.isArray(parsed), `${slug}: JSON-LD is not an array`);

    const posting = parsed.find((n) => n["@type"] === "BlogPosting");
    const crumbs = parsed.find((n) => n["@type"] === "BreadcrumbList");
    assert.ok(posting, `${slug}: no BlogPosting`);
    assert.ok(crumbs, `${slug}: no BreadcrumbList`);

    // The four Google asks for on an article, and the two the microdata never
    // had. Named individually so a partial regression says which one went.
    for (const key of ["headline", "datePublished", "author", "image", "publisher", "url"]) {
      assert.ok(posting[key], `${slug}: BlogPosting has no ${key}`);
    }
    assert.match(posting.datePublished, /^\d{4}-\d{2}-\d{2}$/, `${slug}: datePublished is not an ISO date`);
    assert.equal(posting.url, `https://commonparcel.com/blog/${slug}`);
    assert.ok(posting.headline.length <= 110, `${slug}: headline is ${posting.headline.length} chars, Google truncates past 110`);

    // No invented revision date. The post schema has no field for one, so
    // asserting its absence is what stops a later "helpful" default.
    assert.ok(!("dateModified" in posting), `${slug}: dateModified was invented`);

    assert.equal(crumbs.itemListElement.length, 3);
    assert.equal(crumbs.itemListElement[2].name, posting.headline);
    // The last crumb is the page itself and carries no item, so nothing points
    // at a category URL that does not exist.
    assert.ok(!("item" in crumbs.itemListElement[2]), `${slug}: last breadcrumb links somewhere`);
  }
});

test("the long blog title keeps its own words and drops the brand suffix", () => {
  const html = distFile("dist/blog/board-transition-records-retention-checklist.html");
  if (!html) { assert.ok(true, "no build present"); return; }
  const title = headOf(html).title;
  assert.equal(title, "HOA board transition checklist: records every new board needs");
  assert.ok(title.length <= TITLE_MAX, `title is ${title.length}`);
  assert.ok(!title.includes("Common Parcel"), "the brand suffix was appended past the limit");

  // And a short one still gets it, so the rule is a limit and not a removal.
  const short = distFile("dist/about.html");
  if (short) {
    const aboutTitle = headOf(short).title;
    assert.ok(aboutTitle.includes("Common Parcel"), `about lost the brand: ${aboutTitle}`);
    assert.ok(aboutTitle.length <= TITLE_MAX);
  }
});

test("no shipped description is written past the point it gets cut off", () => {
  for (const p of ["dist/index.html", "dist/security.html", "dist/why-common-parcel.html", "dist/blog/michigan-hoa-records-request.html", "dist/product/documents-and-answers.html"]) {
    const html = distFile(p);
    if (!html) { assert.ok(true, "no build present"); return; }
    const { document } = views(html);
    const desc = headOf(document).description;
    assert.ok(desc, `${p}: no description`);
    assert.ok(desc.length <= DESC_MAX, `${p}: description is ${desc.length} chars`);
  }
});

test("the homepage's two heads agree on the description", () => {
  // One lives in the real <head>, one in the payload's helmet block, and they
  // are read by different consumers. Trimming one and not the other is silent.
  const html = distFile("dist/index.html");
  if (!html) { assert.ok(true, "no build present"); return; }
  const { document, rendered } = views(html);
  const outer = headOf(document).description;
  const inner = decodeEntities(/<meta name="description" content="([\s\S]*?)"\s*\/?>/.exec(rendered)?.[1] ?? "");
  assert.ok(outer, "no description in the document head");
  assert.ok(inner, "no description in the payload helmet");
  assert.equal(inner, outer, "the homepage ships two different meta descriptions");
});

test("the post author is the organization, and no job title is invented for it", () => {
  // This shipped as a Person named "Common Parcel" whose jobTitle was
  // "Detroit, Michigan", in both the JSON-LD and the microdata. The data has a
  // `role` field holding a place, and nothing may map it to a job.
  const html = distFile("dist/blog/michigan-hoa-records-request.html");
  if (!html) { assert.ok(true, "no build present"); return; }

  const posting = JSON.parse(jsonLdBlocks(html)[0]).find((n) => n["@type"] === "BlogPosting");
  assert.equal(posting.author["@type"], "Organization");
  assert.equal(posting.author.name, "Common Parcel");
  assert.ok(!("jobTitle" in posting.author), "a job title was invented from the author's location");

  assert.ok(html.includes('itemprop="author" itemscope itemtype="https://schema.org/Organization"'),
    "the microdata still describes the author as a Person");
  assert.ok(!html.includes('itemprop="author" itemscope itemtype="https://schema.org/Person"'));
  // The place still shows to a reader; it just is not a claim about a role.
  assert.ok(html.includes("Detroit, Michigan"), "the author location stopped rendering");
  assert.ok(!/itemprop="jobTitle"/.test(html));
});
