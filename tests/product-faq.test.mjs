import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { requireFreshDist } from "../tools/dist-freshness.mjs";
import { FEATURES } from "../src/data/features/index.ts";

/**
 * Every product page carries its own questions, and the FAQPage markup says
 * only what the page shows.
 *
 * The failure this is built against is not a missing section. It is the
 * ordinary one: FAQ answers get written once, the page's claims get tightened
 * later, and the answer keeps promising the old thing where nobody looks.
 * Two of the assertions below exist for that and nothing else -- every
 * question and every answer in the structured data has to be findable in the
 * visible HTML, so a schema block can never outlive the copy it describes.
 *
 * The third guards the heading level. voice-lint holds h1 and h2 to rules a
 * question cannot pass (ten words, no hinge, one sentence), and its own note
 * says FAQ questions are h3. Rendering them as h2 would fail the lint on
 * copy that is correct, and the tempting fix at that point is to weaken the
 * lint.
 */

requireFreshDist();

const read = (slug) => readFileSync(`dist/product/${slug}.html`, "utf8");

/** The document with every <script> removed: what a reader can actually see. */
function visible(html) {
  let out = "";
  let from = 0;
  for (;;) {
    const open = html.indexOf("<script", from);
    if (open === -1) return out + html.slice(from);
    out += html.slice(from, open);
    const close = html.indexOf("</script>", open);
    assert.notEqual(close, -1, "unterminated script");
    from = close + "</script>".length;
  }
}

/** The one application/ld+json block, parsed. */
function schemaOf(html) {
  const mark = '<script type="application/ld+json">';
  const at = html.indexOf(mark);
  assert.notEqual(at, -1, "no structured data on the page");
  const end = html.indexOf("</script>", at);
  return JSON.parse(html.slice(at + mark.length, end));
}

/**
 * Astro escapes text into HTML entities, so a question containing an
 * apostrophe is not findable as written. Nothing in the copy needs more than
 * these five, and an unknown entity would show up as a failing search rather
 * than as a silently loosened test.
 */
const decode = (s) =>
  s
    .replaceAll("&#39;", "'")
    .replaceAll("&quot;", '"')
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");

/**
 * THE LIMIT EACH OF THESE PAGES STATES MUST STILL BE STATED.
 *
 * This is a presence check and nothing more, and the reason it is nothing more
 * is worth writing down, because the obvious stronger version was tried here
 * and was wrong.
 *
 * An FAQ answer rewritten to claim that certified mail IS connected passes
 * every other assertion in this file and passes the voice lint. So the first
 * draft added a forbidden-string list beside each limit, with "certified mail
 * is connected" forbidden on /product/collections. It failed on correct copy
 * immediately: the band states the limit as "Until certified mail is
 * connected, serving the notice and keeping the proof stay with the board."
 * The banned string is a substring of the sentence that states the limit.
 *
 * Substring matching is the wrong axis for a claim whose sense is carried by
 * the word in front of it. Nothing on this repo encodes the semantic
 * objection -- Codex established the same thing about the copy detector on
 * 2026-08-23 -- so the general case stays a reviewer's job and this file does
 * not pretend otherwise. What it catches is the cheap failure: a limit
 * sentence quietly deleted while the FAQ around it keeps selling.
 */
const LIMITS = {
  collections: "certified mail is not connected",
  "rules-and-enforcement": "qualified legal review",
  "dues-and-payments": "connected its own Stripe account",
  "documents-and-answers": "prints as unknown",
  "records-and-audit": "only where the rule for that association has been verified",
};

for (const [slug, keep] of Object.entries(LIMITS)) {
  test(`${slug}: the limit it states is still stated`, () => {
    const shown = decode(visible(read(slug))).toLowerCase();
    assert.ok(shown.includes(keep.toLowerCase()), `${slug} no longer says "${keep}"`);
  });
}

test("every product page has questions", () => {
  for (const feature of FEATURES) {
    assert.ok(
      feature.faqs && feature.faqs.length >= 3,
      `${feature.slug} has no questions; the shipped site had none on any page and that was the defect`,
    );
  }
});

for (const feature of FEATURES) {
  test(`${feature.slug}: questions render and the markup matches them`, () => {
    const html = read(feature.slug);
    const shown = decode(visible(html));

    const opened = html.split("<details").length - 1;
    assert.equal(
      opened,
      feature.faqs.length,
      `${feature.slug} renders ${opened} disclosures for ${feature.faqs.length} questions`,
    );

    const schema = schemaOf(html);
    assert.equal(schema["@type"], "FAQPage");
    assert.equal(schema.mainEntity.length, feature.faqs.length);

    for (const entry of schema.mainEntity) {
      assert.ok(
        shown.includes(entry.name),
        `${feature.slug}: structured data asks "${entry.name}" and the page does not`,
      );
      assert.ok(
        shown.includes(entry.acceptedAnswer.text),
        `${feature.slug}: structured data answers something the page does not say -- "${entry.acceptedAnswer.text.slice(0, 60)}"`,
      );
    }

    for (const [question] of feature.faqs) {
      const at = shown.indexOf(question);
      assert.notEqual(at, -1, `${feature.slug}: "${question}" is not on the page`);
      const before = shown.slice(Math.max(0, at - 120), at);
      assert.ok(
        before.includes("<h3"),
        `${feature.slug}: "${question}" is not an h3; voice-lint holds h1 and h2 to rules a question cannot pass`,
      );
    }
  });
}
