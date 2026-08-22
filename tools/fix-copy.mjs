/**
 * Replace headlines that are riddles with headlines that are statements.
 *
 * The pattern to kill: an internal metaphor stated as if the reader shares it.
 * "A late account climbs slowly, on purpose" only means something if you already
 * know the delinquency ladder is called a ladder. A stranger reads it as
 * nonsense, and they are right to.
 *
 * Test applied to each one: would a board member who has never seen this
 * product know what the page is about from the heading alone.
 */
import { readFileSync, writeFileSync } from "node:fs";

const EDITS = [
  /* ── Feature headlines ─────────────────────────────────────────────── */
  ['h1: "A late account climbs slowly, on purpose",',
   'h1: "What happens when someone stops paying",'],
  ['lede: "Climbing too fast is indefensible, and in most states it makes the result void rather than merely untidy. So the ladder is conservative, and where your documents are ambiguous it holds instead of guessing.",',
   'lede: "Parcel sends the reminder, then the late notice, then the demand, on the dates your documents and your state require. Moving faster than that is how a board loses the argument later.",'],

  ['h1: "The fine that gets challenged is the one that skipped a step",',
   'h1: "Violations, hearings, and fines that hold up",'],
  ['lede: "Skipping due process does not weaken a fine. In most states it voids it. A notice that fails to name the violation or cite the rule fails the standard.",',
   'lede: "A fine only sticks if the steps before it were done properly. Parcel runs each one on the clock your state sets, and will not produce the fine until the hearing is on the record.",'],

  ['h1: "The renewal nobody noticed",',
   'h1: "Contracts get re-bid before they renew",'],
  ['lede: "A landscaping contract renews at twelve per cent more than last year because the date passed and nobody was watching. That is the most common way an association loses money, and it is quiet.",',
   'lede: "Parcel watches every renewal date and goes out for fresh quotes before it arrives, with the going rate for that work beside them. You still choose the vendor.",'],

  ['h1: "The dues collect themselves",',
   'h1: "Dues go out on time, every period",'],

  ['h1: "Books an auditor can follow",',
   'h1: "Ledgers that reconcile, budgets that show their vote",'],

  /* ── Section headings that were doing the same thing ────────────────── */
  ['title: "The question nobody could answer before",',
   'title: "How often has this rule been enforced?",'],
  ['title: "What a hold means",', 'title: "Putting an account on hold",'],
  ['title: "The ladder",', 'title: "The order notices go out in",'],

  /* ── Blog ──────────────────────────────────────────────────────────── */
  ['h1: "A clock you cannot see is already running",',
   'h1: "The defect claim clock starts before turnover",'],
  ['lede: "Control has transferred, or is about to. You are a few neighbors with a legal obligation, a box of documents, and no way to tell whether it is complete.",',
   'lede: "Control has transferred, or is about to. You have a box of documents, a legal obligation, and one deadline that started years before your board existed.",'],
];

const PAGE_EDITS = [
  /* ── Use cases ─────────────────────────────────────────────────────── */
  ["src/pages/use-cases.astro",
   '<h1 class="t-display">Where this fits</h1>',
   '<h1 class="t-display">Which associations this fits</h1>'],
  ["src/pages/use-cases.astro",
   'By size, by type, and by what is happening to your board right now.',
   'By how many doors you have, what kind of association you are, and where your board is starting from.'],
];

let n = 0;
for (const file of ["src/data/content.ts", "src/data/posts.ts"]) {
  let s = readFileSync(file, "utf8");
  for (const [from, to] of EDITS) {
    if (!s.includes(from)) continue;
    s = s.split(from).join(to);
    n++;
    console.log(`  ${file}  ${from.slice(0, 58)}`);
  }
  writeFileSync(file, s);
}
for (const [file, from, to] of PAGE_EDITS) {
  let s = readFileSync(file, "utf8");
  if (!s.includes(from)) { console.error(`  MISS ${file}: ${from.slice(0, 50)}`); continue; }
  writeFileSync(file, s.split(from).join(to));
  n++;
  console.log(`  ${file}  ${from.slice(0, 58)}`);
}

const missed = EDITS.filter(([from]) =>
  !["src/data/content.ts", "src/data/posts.ts"].some((f) => readFileSync(f, "utf8").includes(from.replace(/^h1: "|^lede: "|^title: "/, "").slice(0, 30)))
);
console.log(`\n${n} replacement(s)`);
