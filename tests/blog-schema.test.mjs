/**
 * A SECTION MAY BE A CHECKLIST AND NOTHING ELSE.
 *
 * `BlogSection.paragraphs` was required, and both readers reached into it
 * without a guard: `readingMinutes` spread it, and the post template mapped it.
 * The first draft whose opening section was a bare run sheet did not just fail
 * its own page. `astro build` errored, `dist` was left incomplete, and
 * `npm run verify` could not run at all, so the failure looked like a broken
 * toolchain rather than one missing field.
 *
 * The build is the only thing that catches the template's half of that, and the
 * build is slow and easy to skip. This catches the counter's half in
 * milliseconds, and asserts the shape the schema now permits.
 *
 * Mutation-checked when written: removing the `?? []` in readingMinutes makes
 * the first test throw, and the same removal makes `npm run build` emit two
 * TypeErrors on a post with a paragraphs-less section.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readingMinutes, BLOG_POSTS } from "../src/data/blog.ts";

/** A post shaped like a guide that opens with its checklist. */
const CHECKLIST_FIRST = {
  slug: "fixture-checklist-first",
  title: "Fixture",
  description: "Fixture",
  publishedAt: "2026-08-22",
  author: { name: "Fixture", role: "Fixture" },
  category: "Operations",
  artSubject: "renewal",
  lede: "One two three four five six seven eight nine ten.",
  sections: [
    {
      heading: "The run sheet",
      list: { title: "Checklist", items: ["First item here", "Second item here"] },
    },
  ],
  citations: [],
};

test("readingMinutes counts a section that has no paragraphs", () => {
  const m = readingMinutes(CHECKLIST_FIRST);
  assert.ok(Number.isInteger(m) && m > 0, `expected a positive integer, got ${m}`);
});

test("readingMinutes counts list items, not just paragraphs", () => {
  const withList = readingMinutes(CHECKLIST_FIRST);
  const withoutList = readingMinutes({
    ...CHECKLIST_FIRST,
    sections: [{ heading: "The run sheet" }],
  });
  /* Both round to 1 minute at this size, so compare the raw contribution by
     repeating the list until the difference has to show. A counter that ignored
     list items would return the same number for both. */
  const many = {
    ...CHECKLIST_FIRST,
    sections: [{
      heading: "The run sheet",
      list: { title: "Checklist", items: Array.from({ length: 400 }, (_, i) => `Checklist item number ${i} with several words in it`) },
    }],
  };
  assert.ok(
    readingMinutes(many) > readingMinutes({ ...CHECKLIST_FIRST, sections: [{ heading: "The run sheet" }] }),
    "readingMinutes ignores list items, so a checklist post would report as unreadably short"
  );
  assert.ok(withList >= withoutList, "sanity: adding a list cannot reduce the count");
});

test("every shipped post survives the counter", () => {
  for (const post of BLOG_POSTS) {
    const m = readingMinutes(post);
    assert.ok(Number.isInteger(m) && m > 0, `${post.slug}: got ${m}`);
  }
});

/*
 * The template's half of this defect cannot be reached from a unit test: it
 * lives in an .astro file that only the build evaluates. The guard there is
 * `(section.paragraphs ?? [])` in src/pages/blog/[slug].astro. If that guard is
 * removed, this file stays green and `npm run build` fails. Stated here so the
 * next reader does not take a green run as proof that both halves are covered.
 */
