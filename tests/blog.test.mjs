/**
 * Blog system and citation integrity test suite.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { BLOG_POSTS, getAllPosts, getPostBySlug, readingMinutes } from "../src/data/blog.ts";
import { ALL_ROUTES } from "../src/data/routes.ts";

test("blog posts have valid structure and metadata", () => {
  const posts = getAllPosts();
  assert.ok(posts.length > 0, "must contain at least one post");

  for (const post of posts) {
    assert.ok(post.slug && typeof post.slug === "string", "slug is required");
    assert.ok(post.title && typeof post.title === "string", "title is required");
    assert.ok(post.description && typeof post.description === "string", "description is required");
    assert.match(post.publishedAt, /^\d{4}-\d{2}-\d{2}$/, "publishedAt must be YYYY-MM-DD");
    assert.ok(post.author && post.author.name && post.author.role, "author name and role required");
    assert.ok(["Statutory Guidance", "Operations", "Board Governance", "Financial Controls"].includes(post.category), "valid category");
    /*
     * readTime used to be a hand-typed string, and this line asserted its
     * shape. Checking the shape of a guess only proves the guess was
     * well-formatted. Reading time is now counted from the post by
     * readingMinutes(), so the assertion is that the count is a sane positive
     * integer and that nobody has reintroduced a typed field beside it.
     */
    assert.equal(post.readTime, undefined, "readTime is counted by readingMinutes(), not typed on the post");
    const minutes = readingMinutes(post);
    assert.ok(Number.isInteger(minutes) && minutes > 0, `readingMinutes must be a positive integer, got ${minutes}`);
    assert.ok(minutes < 120, `readingMinutes of ${minutes} is implausible; the counter is probably reading the wrong field`);
    assert.ok(Number.isInteger(post.artSeed), "artSeed must be an integer");
    assert.ok(post.lede && typeof post.lede === "string", "lede is required");
    assert.ok(Array.isArray(post.sections) && post.sections.length > 0, "sections must not be empty");
    assert.ok(Array.isArray(post.citations), "citations must be an array");
  }
});

test("all blog post citations have valid source, section, title, and retrieval date", () => {
  for (const post of BLOG_POSTS) {
    for (const citation of post.citations) {
      assert.ok(citation.source && citation.source.trim().length > 0, `empty source in ${post.slug}`);
      assert.ok(citation.section && citation.section.trim().length > 0, `empty section in ${post.slug}`);
      assert.ok(citation.title && citation.title.trim().length > 0, `empty title in ${post.slug}`);
      assert.match(citation.retrievedAt, /^\d{4}-\d{2}-\d{2}$/, `retrievedAt must be YYYY-MM-DD in ${post.slug}`);
    }
  }
});

test("every blog post route is declared in ALL_ROUTES and resolves via getPostBySlug", () => {
  for (const post of BLOG_POSTS) {
    const route = `/blog/${post.slug}`;
    assert.ok(ALL_ROUTES.includes(route), `route ${route} missing from ALL_ROUTES`);
    const fetched = getPostBySlug(post.slug);
    assert.equal(fetched?.slug, post.slug);
  }
});

test("blog art PRNG algorithm produces deterministic numbers for a given seed", () => {
  function createPrng(s) {
    let current = Math.abs(s) % 2147483647;
    if (current === 0) current = 1;
    return () => {
      current = (current * 48271) % 2147483647;
      return (current - 1) / 2147483646;
    };
  }

  const prng1 = createPrng(101);
  const seq1 = [prng1(), prng1(), prng1(), prng1()];

  const prng2 = createPrng(101);
  const seq2 = [prng2(), prng2(), prng2(), prng2()];

  assert.deepEqual(seq1, seq2, "PRNG sequence must be identical for identical seeds");
});
