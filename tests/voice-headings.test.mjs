/**
 * THE HEADING RULES, TESTED BOTH WAYS.
 *
 * A lint rule that fires on nothing is worse than no rule, because the green
 * run tells the next person the page was checked. Two of these rules shipped
 * dead the first time: the shell ate a backslash and left a literal 0x08 in
 * the pattern, so HEAD_JARGON matched nothing while `npm run voice` reported
 * pages clean. Hence a positive case per rule, and a negative case built from
 * the one page the owner has approved.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { lint } from "../tools/voice-lint.mjs";

const H = "<!-- voice-h -->";
const codes = (heading) => lint(H + heading, "general").map(([, c]) => c);

/* Every heading the owner rejected on 2026-08-22, and the rule that catches it. */
const REJECTED = [
  ["Two officers to authorize. One to halt.", "HEAD_MECHANISM"],
  ["Two officers to authorize. One to halt.", "HEAD_TWO_SENTENCES"],
  ["One price. Everything is in it.", "HEAD_TWO_SENTENCES"],
  ["Set the budget line from three numbers.", "HEAD_COUNT"],
  ["Where your records live, and who can reach them", "HEAD_HINGE"],
  ["Direct bank settlement with zero software custody", "HEAD_JARGON"],
  ["Access is scoped strictly by role", "HEAD_JARGON"],
  ["A heading that keeps going and going and going and going and on", "HEAD_LONG"],
  ["The board still makes every decision", "HEAD_NOT_SELLING"],
];

for (const [heading, code] of REJECTED) {
  test(`${code} catches: ${heading}`, () => {
    assert.ok(codes(heading).includes(code), `expected ${code}, got ${JSON.stringify(codes(heading))}`);
  });
}

/*
 * The reference page. These are the visible feature headlines from the
 * homepage bundle, which is the only page called near-final. If a heading rule
 * fires on one of these, the rule is wrong, not the homepage.
 *
 * "Empower residents." is deliberately absent: `empower` is on the linter's
 * banned-word list and the homepage says it anyway. That conflict is real and
 * is recorded in docs/VOICE.md for the owner to settle. Asserting it clean
 * here would paper over it.
 */
const APPROVED = [
  "Simplify due-collection.",
  "Let Common Parcel keep track of violations.",
  "Get the best price with Automatic Contract Renewal.",
  "Let residents vote easily and securely.",
  "Super simple setup.",
  "Everything is securely stored.",
  "Ditch your HOA management company.",
  "Leave your expensive management company.",
  "Get your evenings back.",
  "What Common Parcel does",
  "What it costs",
  "Who it is for",
];

for (const heading of APPROVED) {
  test(`approved heading stays clean: ${heading}`, () => {
    assert.deepEqual(codes(heading), [], `${heading} tripped ${JSON.stringify(codes(heading))}`);
  });
}

/* Body copy is not a heading. Prices and the street address must stay legal. */
test("heading rules do not touch body copy", () => {
  const body = [
    "The bands add to $80.00, so the $10 monthly minimum applies.",
    "Common Parcel, 1420 Washington Blvd, Ste 301, Detroit, MI 48226",
    "Consequential actions such as notices, fines, and liens require two officers.",
  ];
  for (const line of body) {
    const found = lint(line, "general").map(([, c]) => c).filter((c) => c.startsWith("HEAD_"));
    assert.deepEqual(found, [], `${line} tripped ${JSON.stringify(found)}`);
  }
});

/* h3 is exempt: the FAQ questions are h3 and are allowed to be long and hinged. */
test("h3 FAQ questions are not held to heading rules", () => {
  const q = "What is HOA management software, and what does Common Parcel actually do?";
  const found = lint(q, "general").map(([, c]) => c).filter((c) => c.startsWith("HEAD_"));
  assert.deepEqual(found, []);
});

/*
 * THROUGH extractCopy, NOT AROUND IT.
 *
 * The tests above hand-write the "<!-- voice-h -->" marker, so they keep
 * passing if extractCopy stops applying it or starts applying it to h3.
 * Mutation testing found both holes. These close them by starting from HTML.
 */
import { extractCopy } from "../tools/voice-lint.mjs";

const page = (body) => `<html><head><title>t</title></head><body>${body}</body></html>`;
const codesFor = (html) => lint(extractCopy(html), "general").map(([, c]) => c);

test("extractCopy marks h1 and h2 so the heading rules can see them", () => {
  const found = codesFor(page('<h2 class="t-sheet">Access is scoped strictly by role</h2>'));
  assert.ok(found.includes("HEAD_JARGON"), `got ${JSON.stringify(found)}`);
  const h1 = codesFor(page("<h1>Where your records live, and who can reach them</h1>"));
  assert.ok(h1.includes("HEAD_HINGE"), `got ${JSON.stringify(h1)}`);
});

test("extractCopy does not mark h3 or h4", () => {
  for (const tag of ["h3", "h4"]) {
    const found = codesFor(page(`<${tag}>Access is scoped strictly by role</${tag}>`));
    assert.deepEqual(found.filter((c) => c.startsWith("HEAD_")), [], `${tag} was treated as a section heading`);
  }
});

test("extractCopy does not mark paragraphs", () => {
  const found = codesFor(page("<p>Access is scoped strictly by role</p>"));
  assert.deepEqual(found.filter((c) => c.startsWith("HEAD_")), []);
});
