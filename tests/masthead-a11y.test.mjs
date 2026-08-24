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

/**
 * The five nav columns have to exist for a screen reader, not only for an eye.
 *
 * Codex found this and the shape is the same as the unnamed home link above:
 * the markup reads perfectly and the accessibility tree does not carry it. A
 * heading rendered as a visual <span> inside a generic <div> groups nothing,
 * so the panel arrived as nine links in a row and none of the five columns
 * Jesse chose. Verified in Chrome's accessibility tree on this build --
 * five group nodes, named MONEY IN, COMPLIANCE, PROPERTY AND SPEND,
 * GOVERNANCE, PEOPLE -- and pinned here so it stays.
 *
 * Both forms again, because the homepage's masthead is written into the
 * bundle with every quote escaped, and a check that only understood the plain
 * form would pass on twenty-two pages and never look at the one built by a
 * script.
 */
/**
 * The ids labelled by `role=group` tags written with `quote`.
 *
 * indexOf and not a RegExp, and the reason is a bug this had for one run.
 * ESCAPED_QUOTE is the two characters backslash and quote; inside a RegExp
 * that is an escaped quote, so a pattern built from it matches PLAIN markup
 * too. Every page then counted as an escaped page, and the id lookup that
 * followed -- correctly written with the literal backslash -- found nothing.
 * The helper above this file already avoids RegExp for exactly this reason.
 */
function labelledGroups(html, quote) {
  const needle = "role=" + quote + "group" + quote + " aria-labelledby=" + quote;
  const ids = [];
  let from = 0;
  for (;;) {
    const at = html.indexOf(needle, from);
    if (at === -1) return ids;
    const start = at + needle.length;
    const end = html.indexOf(quote, start);
    assert.notEqual(end, -1, "unterminated aria-labelledby");
    ids.push(html.slice(start, end));
    from = end;
  }
}

test("every nav column is a labelled group on every built page", () => {
  requireFreshDist();
  const PRODUCT_GROUPS = readGroupNames();
  assert.ok(PRODUCT_GROUPS.length >= 4, "expected at least four nav columns");

  let plainPages = 0;
  let escapedPages = 0;

  for (const page of htmlFiles("dist")) {
    const html = readFileSync(page, "utf8");
    for (const [quote, count] of [['"', () => plainPages++], [ESCAPED_QUOTE, () => escapedPages++]]) {
      const q = quote;
      const groups = labelledGroups(html, q);
      if (!groups.length) continue;
      count();
      assert.equal(
        groups.length,
        PRODUCT_GROUPS.length,
        `${page} labels ${groups.length} nav columns for ${PRODUCT_GROUPS.length} groups`,
      );
      for (let i = 0; i < PRODUCT_GROUPS.length; i++) {
        const id = `mega-g${i}`;
        assert.ok(groups.includes(id), `${page} has no group labelled by ${id}`);
        const anchor = html.indexOf(`id=${q}${id}${q}`);
        assert.notEqual(anchor, -1, `${page} has ${id} as a label with no element carrying that id`);
        const after = html.slice(anchor, anchor + 200);
        assert.ok(
          after.includes(PRODUCT_GROUPS[i]),
          `${page}: ${id} does not name "${PRODUCT_GROUPS[i]}"`,
        );
      }
    }
  }

  assert.ok(plainPages >= 20, `only ${plainPages} pages carried the plain grouping`);
  assert.equal(escapedPages, 1, `expected one escaped masthead in the bundle, saw ${escapedPages}`);
});

test("every declared navigation icon has a matching SVG symbol", () => {
  const routes = readFileSync("src/data/routes.ts", "utf8");
  const masthead = readFileSync("src/components/Masthead.astro", "utf8");
  const icons = [...routes.matchAll(/icon:\s*"([^"]+)"/g)].map((match) => match[1]);

  assert.ok(icons.length >= 13, `expected the product and company menus to declare icons, saw ${icons.length}`);
  for (const icon of new Set(icons)) {
    assert.ok(
      masthead.includes(`id="nav-${icon}"`),
      `navigation route uses icon "${icon}" but Masthead.astro has no matching symbol`,
    );
  }
});

/** The group names, read from the source of truth rather than restated here. */
function readGroupNames() {
  const src = readFileSync("src/data/routes.ts", "utf8");
  const start = src.indexOf("export const PRODUCT_GROUPS");
  const end = src.indexOf("\n];", start);
  assert.notEqual(start, -1, "PRODUCT_GROUPS is gone from routes.ts");
  return [...src.slice(start, end).matchAll(/name: "([^"]+)"/g)].map((m) => m[1]);
}
