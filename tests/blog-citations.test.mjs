/**
 * EVERY QUOTED STATUTE, CHECKED AGAINST THE BYTES OF THE SECTION IT NAMES.
 *
 * A statutory post is the one page on this site where being wrong costs a
 * reader money. The first attempt at one attributed an annual CPA audit
 * requirement and a "detailed books of account" quotation to MCL 559.168.
 * Section 168 is a single sentence about keeping the condominium documents
 * available. The quoted words are in no part of it, and the audit rule is in
 * Section 157. Nobody had opened either section, and nothing in the suite
 * could tell.
 *
 * So: a statutory callout must quote, and the quote must appear verbatim in a
 * snapshot of the section it is attributed to. tests/sources holds those
 * snapshots, fetched with curl from legislature.mi.gov on the retrieval date
 * the post prints.
 *
 * WHAT THIS TEST DOES NOT PROVE, stated here so nobody mistakes a green run
 * for more than it is:
 *
 *   - Not that the law is current. The snapshot is what was on the page that
 *     day. Michigan amends these acts, and a snapshot cannot notice. That is
 *     what the printed retrieval date is for.
 *   - Not that the reading is right. A correctly quoted sentence can still be
 *     summarised wrongly in the paragraph beside it, and the paragraphs are
 *     not checked here. A person has to read those.
 *   - Not that the snapshot is honest. Anyone able to edit a post can edit the
 *     fixture beside it. The check catches drift and typos, not bad faith.
 *
 * A model-mediated check is not a substitute for this. Asked whether a quote
 * matched, a fetch-and-summarise pass told me the last three words of MCL
 * 559.168 were singular when the page says plural, because the question named
 * the word I was unsure about. Only the bytes settle it.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { BLOG_POSTS } from "../src/data/blog.ts";

/** Section prefix -> snapshot. Add a pair when a post cites a new section. */
const SNAPSHOTS = {
  "MCL 559.157": "tests/sources/mcl-559-157.html",
  "MCL 559.168": "tests/sources/mcl-559-168.html",
  "MCL 450.2487": "tests/sources/mcl-450-2487.html",
};

/** Tags out, entities decoded, whitespace flattened. No other normalising. */
function plain(file) {
  let s = readFileSync(file, "utf8").replace(/<[^>]+>/g, " ");
  s = s.replace(/&nbsp;|&#160;/g, " ").replace(/&amp;/g, "&");
  s = s.replace(/&#39;|&apos;|&rsquo;/g, "'").replace(/&quot;|&ldquo;|&rdquo;/g, '"');
  return s.replace(/\s+/g, " ");
}

const cache = new Map();
function sourceText(file) {
  if (!cache.has(file)) cache.set(file, plain(file));
  return cache.get(file);
}

/**
 * Every double-quoted run of 40 characters or more inside a statutory callout
 * is treated as a claim to be verbatim. An ellipsis marks a deliberate
 * omission and splits one claim into two.
 */
function claimsIn(text) {
  const out = [];
  for (const m of text.matchAll(/"([^"]{40,})"/g)) {
    for (const part of m[1].split("...").map((p) => p.trim())) {
      if (part.length >= 40) out.push(part);
    }
  }
  return out;
}

const statutoryCallouts = [];
for (const post of BLOG_POSTS) {
  for (const section of post.sections) {
    for (const c of [section.callout, ...(section.callouts ?? [])]) {
      if (c && c.type === "statutory") statutoryCallouts.push({ post, section, c });
    }
  }
}

for (const { post, c } of statutoryCallouts) {
  const label = c.title ?? "(untitled)";

  test(`${post.slug}: ${label} names a section with a snapshot`, () => {
    const key = Object.keys(SNAPSHOTS).find((k) => label.startsWith(k));
    assert.ok(
      key,
      `statutory callout titled ${JSON.stringify(label)} does not start with a section in SNAPSHOTS. ` +
        `Fetch the section into tests/sources and add it, or the quote is unchecked.`
    );
    assert.ok(existsSync(SNAPSHOTS[key]), `missing snapshot ${SNAPSHOTS[key]}`);
  });

  test(`${post.slug}: ${label} quotes the section verbatim`, () => {
    const key = Object.keys(SNAPSHOTS).find((k) => label.startsWith(k));
    if (!key) return; // reported by the test above
    const src = sourceText(SNAPSHOTS[key]);
    const claims = claimsIn(c.text);
    assert.ok(
      claims.length > 0,
      `statutory callout ${label} contains no quoted run of 40+ characters. A statutory ` +
        `callout must quote the section, not summarise it.`
    );
    for (const q of claims) {
      assert.ok(
        src.includes(q),
        `not found in ${SNAPSHOTS[key]}:\n  ${q.slice(0, 180)}`
      );
    }
  });
}

test("there is at least one statutory callout to check", () => {
  assert.ok(
    statutoryCallouts.length > 0,
    "no statutory callouts found. If the statutory post was removed, remove this file too, " +
      "rather than leaving a suite that passes by having nothing to check."
  );
});

/* A citation panel is the site telling a reader a claim can be checked, so
   every entry in it has to be checkable: a section, a date, and a URL. */
for (const post of BLOG_POSTS) {
  test(`${post.slug}: every citation carries a section, a date and a URL`, () => {
    for (const cite of post.citations) {
      assert.match(cite.retrievedAt, /^\d{4}-\d{2}-\d{2}$/, `${post.slug}: bad retrievedAt ${cite.retrievedAt}`);
      assert.ok(cite.section?.trim(), `${post.slug}: citation with no section`);
      assert.ok(
        cite.url?.startsWith("https://"),
        `${post.slug}: citation ${JSON.stringify(cite.section)} has no https URL. A reader cannot ` +
          `check a source they cannot reach, and an unreachable citation is how an invented one ` +
          `gets in. If the source is not on the web, the post should not cite it.`
      );
    }
  });

  test(`${post.slug}: a post with statutory callouts also lists its sources`, () => {
    const hasStatutory = post.sections.some(
      (s) => [s.callout, ...(s.callouts ?? [])].some((c) => c && c.type === "statutory")
    );
    if (!hasStatutory) return;
    assert.ok(post.citations.length > 0, `${post.slug} quotes a statute and cites nothing`);
  });
}
