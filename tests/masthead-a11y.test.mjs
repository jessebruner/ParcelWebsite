import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { requireFreshDist } from "../tools/dist-freshness.mjs";

/**
 * The masthead home link must have a name a screen reader can read, on every
 * page and at every width.
 *
 * It cannot get that name from anything inside itself. The heron is
 * aria-hidden, so it contributes nothing, and masthead.css hides .wordmark at
 * 420px and below, so on a phone the link had no name at all. Two of the three
 * facts this test pins are the reasons the third one matters.
 *
 * The homepage is the case worth testing. It is not an Astro page: its masthead
 * is lifted out of a built page by tools/sync-homepage-masthead.mjs and written
 * into a JSON template inside the bundle, with every quote escaped. A test that
 * only understood the plain form would pass on twenty-two pages and never look
 * at the one built by a script.
 */

const ESCAPED_QUOTE = "\\" + '"';
const NAME = "Common Parcel home";

function htmlFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...htmlFiles(full));
    else if (entry.endsWith(".html")) out.push(full);
  }
  return out;
}

/** Every opening tag in `html` whose attributes contain `class="lockup"`. */
function lockupTags(html, quote) {
  const needle = "<a class=" + quote + "lockup" + quote;
  const tags = [];
  let from = 0;
  for (;;) {
    const at = html.indexOf(needle, from);
    if (at === -1) return tags;
    const end = html.indexOf(">", at);
    assert.notEqual(end, -1, "unterminated lockup tag");
    tags.push(html.slice(at, end));
    from = end;
  }
}

/** The value of `aria-label`, or null when the attribute is absent or empty. */
function ariaLabel(tag, quote) {
  const key = "aria-label=" + quote;
  const at = tag.indexOf(key);
  if (at === -1) return null;
  const from = at + key.length;
  const end = tag.indexOf(quote, from);
  if (end === -1) return null;
  const value = tag.slice(from, end).trim();
  return value.length === 0 ? null : value;
}

test("the masthead home link is named on every built page", () => {
  requireFreshDist();
  const pages = htmlFiles("dist");
  assert.ok(pages.length >= 20, `only ${pages.length} built pages found`);

  const unnamed = [];
  let plainPages = 0;
  let escapedPages = 0;

  for (const page of pages) {
    const html = readFileSync(page, "utf8");
    const plain = lockupTags(html, '"');
    const escaped = lockupTags(html, ESCAPED_QUOTE);
    const found = plain.length + escaped.length;
    assert.ok(found > 0, `${page} has no masthead home link`);
    if (plain.length > 0) plainPages += 1;
    if (escaped.length > 0) escapedPages += 1;

    for (const tag of plain) {
      if (ariaLabel(tag, '"') !== NAME) unnamed.push(page + " (plain)");
    }
    for (const tag of escaped) {
      if (ariaLabel(tag, ESCAPED_QUOTE) !== NAME) unnamed.push(page + " (bundle)");
    }
  }

  assert.deepEqual(unnamed, [], "home link has no accessible name on: " + unnamed.join(", "));

  // Not vacuous: both forms of the markup were actually seen. The bundle count
  // is the homepage; if the injection stops carrying a masthead this fails
  // instead of passing on the twenty-two pages Astro renders.
  assert.ok(plainPages >= 20, `only ${plainPages} pages carried the plain markup`);
  assert.equal(escapedPages, 1, `expected the homepage bundle to carry one escaped masthead, saw ${escapedPages}`);
});

test("nothing inside the home link can supply its name", () => {
  // The heron is decorative. If this ever stops being true the aria-label is
  // still correct, but the reason it is load-bearing has changed.
  const mark = readFileSync("src/components/Mark.astro", "utf8");
  assert.ok(mark.includes('aria-hidden="true"'), "Mark.astro no longer hides the heron from assistive tech");

  // The wordmark is display:none on a phone. This is the width the bug lived at.
  const css = readFileSync("src/styles/masthead.css", "utf8");
  const at = css.indexOf(".wordmark { display: none; }");
  assert.notEqual(at, -1, "masthead.css no longer hides .wordmark; re-check whether the aria-label is still the only name");
  const query = css.lastIndexOf("@media", at);
  assert.notEqual(query, -1, ".wordmark is hidden outside any media query");
  assert.ok(css.slice(query, at).includes("max-width: 420px"), "the .wordmark hide moved off the 420px breakpoint");
});
