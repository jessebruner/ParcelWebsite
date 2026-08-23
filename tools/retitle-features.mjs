/**
 * One-shot structural edit of the nine feature specs in src/data/content.ts.
 *
 * Three mechanical changes, done here rather than by hand because each one is
 * nine near-identical edits in a 900-line file:
 *
 *   1. `h1` becomes the page's own name. On every one of the nine, `eyebrow`
 *      was already a byte-for-byte copy of `title` and `h1` was a different
 *      sentence, so the page's name was rendered in a small gray label above a
 *      headline that never said it.
 *   2. `eyebrow` is deleted. Nothing renders it any more.
 *   3. `closer` is added: the line the closing band carries. It used to be
 *      generated as `See ${title} in Common Parcel.` for all nine.
 *
 * The sentence displaced from `h1` is not thrown away — it is printed at the
 * end so it can be placed as a selling point in the body, which is what the
 * brief asks for on rules-and-enforcement by name.
 *
 * Run once. It asserts every anchor it needs and exits non-zero if the file has
 * moved underneath it.
 */
import { readFileSync, writeFileSync } from "node:fs";

const FILE = "src/data/content.ts";

/** Slug -> the closing line. Short, human, no digits, and about the reader. */
const CLOSERS = {
  "dues-and-payments": "Get paid without asking twice.",
  collections: "The hard letter, already written.",
  "accounting-and-budgets": "Books your treasurer can hand over.",
  "rules-and-enforcement": "The same rule for every neighbour.",
  "meetings-and-voting": "Every vote, already in the record.",
  "documents-and-answers": "Ask your declaration.",
  "vendors-and-insurance": "Know before the renewal does.",
  "resident-portal": "Your phone stops ringing.",
  "records-and-audit": "The next board inherits everything.",
};

let src = readFileSync(FILE, "utf8");
const nl = src.includes("\r\n") ? "\r\n" : "\n";
const displaced = [];

// The features block only. COMPARISONS and POSTS keep their own shape.
const startAt = src.indexOf("export const FEATURES: PageSpec[] = [");
if (startAt === -1) throw new Error("FEATURES array not found");
const endAt = src.indexOf(nl + "];", startAt);
if (endAt === -1) throw new Error("FEATURES array is not closed");

let block = src.slice(startAt, endAt);
const before = block;

for (const [slug, closer] of Object.entries(CLOSERS)) {
  const at = block.indexOf(`slug: "${slug}",`);
  if (at === -1) throw new Error(`slug not found: ${slug}`);
  // The spec ends where the next one begins, or at the end of the block.
  const nextAt = block.indexOf("    slug: \"", at + 10);
  const stop = nextAt === -1 ? block.length : nextAt;
  let spec = block.slice(at, stop);

  const grab = (key) => {
    const k = `${key}: "`;
    const i = spec.indexOf(k);
    if (i === -1) throw new Error(`${slug}: no ${key}`);
    const j = spec.indexOf('",', i + k.length);
    if (j === -1) throw new Error(`${slug}: ${key} is not closed`);
    return { value: spec.slice(i + k.length, j), from: i, to: j + 2 };
  };

  const eyebrow = grab("eyebrow");
  const title = grab("title");
  const h1 = grab("h1");

  if (eyebrow.value !== title.value) {
    throw new Error(`${slug}: eyebrow "${eyebrow.value}" is not the title "${title.value}" — check before replacing`);
  }
  displaced.push({ slug, was: h1.value, now: title.value });

  // h1 first: replacing the eyebrow line shifts every later offset.
  spec = spec.slice(0, h1.from) + `h1: "${title.value}",` + spec.slice(h1.to);
  const eb = grab.call(null, "eyebrow");
  const ebLineStart = spec.lastIndexOf(nl, eb.from) + nl.length;
  let ebLineEnd = spec.indexOf(nl, eb.to);
  ebLineEnd = ebLineEnd === -1 ? spec.length : ebLineEnd + nl.length;
  spec = spec.slice(0, ebLineStart) + spec.slice(ebLineEnd);

  // closer goes next to lede, so the two pieces of hero-and-closer copy sit
  // together and neither can be edited without seeing the other.
  const lede = (() => {
    const i = spec.indexOf("lede: \"");
    if (i === -1) throw new Error(`${slug}: no lede`);
    let end = spec.indexOf(nl, i);
    return end === -1 ? spec.length : end + nl.length;
  })();
  spec = spec.slice(0, lede) + `    closer: ${JSON.stringify(closer)},${nl}` + spec.slice(lede);

  block = block.slice(0, at) + spec + block.slice(stop);
}

if (block === before) throw new Error("nothing changed");
src = src.slice(0, startAt) + block + src.slice(endAt);

// The type has to move with the data.
const typeFrom = `export interface PageSpec {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  lede: string;
  bands: BandSpec[];
}`.split("\n").join(nl);
const typeTo = `export interface PageSpec {
  slug: string;
  title: string;
  description: string;
  /** The page's own name. Nothing renders a label above it. */
  h1: string;
  lede: string;
  /** The line the closing band carries. Written per page, never generated. */
  closer?: string;
  bands: BandSpec[];
}`.split("\n").join(nl);
if (!src.includes(typeFrom)) throw new Error("PageSpec shape has moved; not rewriting the type blind");
src = src.replace(typeFrom, typeTo);

const bandFrom = `export interface BandSpec {
  title: string;
  field?: boolean;`.split("\n").join(nl);
const bandTo = `export interface BandSpec {
  title: string;
  field?: boolean;
  /** Breaks the run of equal-height sections. See tokens.css. */
  air?: "tight" | "open";`.split("\n").join(nl);
if (!src.includes(bandFrom)) throw new Error("BandSpec shape has moved");
src = src.replace(bandFrom, bandTo);

writeFileSync(FILE, src);

console.log("h1 replaced with the page name on " + displaced.length + " pages.\n");
console.log("Sentences displaced from h1, for placement as body selling points:");
for (const d of displaced) console.log(`  ${d.now.padEnd(24)} was: "${d.was}"`);
