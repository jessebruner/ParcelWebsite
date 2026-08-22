/**
 * The voice guide, mechanically enforced.
 *
 * A port of voice_lint.py, which cannot run here because the python on PATH is
 * the Windows Store stub.
 *
 * IT RUNS ON dist, NOT ON src. Pointing a copy linter at a component lints the
 * stylesheet, where "transform" is a banned word and every --s-4 is a digit. So
 * the copy is pulled out of the built HTML instead, which also means the title
 * and the meta description get checked, and what is checked is exactly what a
 * reader and a crawler receive.
 *
 * Surfaces: hero and email additionally ban every number, back-office
 * vocabulary, and scenes that narrate the reader's life. Everything else is
 * "general". A page may declare its own with <!-- voice-surface: hero -->.
 *
 * One number is cleared to travel anywhere: the starting price. A page names the
 * codes it is excused from with <!-- voice-allow-file: CODE,CODE -->, matched
 * anywhere in the document so the allowance cannot depend on where it lands.
 *
 * Three deviations from the original, each because the substring matching in it
 * misfires on a real HOA site:
 *   "chase" matches purchase. "navigate" matches navigation. And the stand-in
 *   rule matches the NOUN "features", so every /product/ blurb would flag.
 *
 *   node tools/voice-lint.mjs
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const BANNED_WORDS = [
  "leverage", "synerg", "solution", "ecosystem", "best-in-class", "world-class",
  "cutting-edge", "state-of-the-art", "next-generation", "robust", "holistic",
  "end-to-end", "seamless", "frictionless", "scalable", "empower", "supercharge",
  "unlock", "unleash", "elevate", "revolution", "disrupt", "game-changer",
  "one-stop shop", "peace of mind", "delv", "underscore", "tapestry", "intricat",
  "meticulous", "pivotal", "realm", "navigate", "foster", "showcase", "boast",
  "unveil", "embark", "testament", "harness", "streamline", "enhance",
  "commendable", "groundbreaking", "transform", "ever-evolving", "vibrant",
  "bustling", "nestled", "journey", "endeavor", "utilize", "additionally",
  "crucial", "chase", "chasing", "vital", "comprehensive", "poised", "deep dive",
  "shed light on", "demystify",
];
const WORD_EXCEPTIONS = { chase: [/purchas/g], chasing: [/purchasing/g], navigate: [/navigation/g] };

const BANNED_FRAMES = [
  "say goodbye to", "look no further", "we've got you covered", "in today's fast-paced world",
  "we're excited to announce", "it's never been easier", "made simple", "made easy",
  "made effortless", "all-in-one solution", "join thousands", "trusted by", "take your hoa",
  "to the next level", "it is important to note", "it is worth noting", "it goes without saying",
  "when it comes to", "at its core", "at the end of the day", "the bottom line", "in conclusion",
  "in summary", "needless to say", "we've all been there", "let's face it", "picture this",
  "imagine a world", "here's the thing", "sound familiar", "we get it", "studies show",
  "the landscape of", "experts agree", "experts say", "industry reports", "in short", "no catch",
  "long story short", "keeps the difference", "keep the difference", "failure to comply",
];
const PRESUMPTION = [
  "you're probably", "you are probably", "chances are", "odds are", "we all know",
  "if you're like most", "you know the feeling", "you've been there", "somebody on your board",
  "someone on your board", "you didn't sign up", "after a long day", "at ten at night",
];
const NOT_SELLING = [
  "still makes every decision", "still decides", "keeps the decisions", "keep the decisions",
  "stay in control", "you're in control", "you are in control", "final say", "the board decides",
  "no lock-in", "you own your data",
];
const CATCH_CLAIM = ["pay nothing", "no fee", "no fees", "at no cost", "no extra cost", "unlimited", "no charge", "guaranteed"];
const VAGUE_WORK = [
  "the part that repeats", "the piece that", "the stuff that", "recurring work",
  "the heavy lifting", "busywork", "handles the rest", "takes care of the rest",
  "operational overhead", "administrative burden", "back-office", "runs itself",
];

const REVERSALS = [/not just .*? but/i, /it's not .*?, it's/i, /this isn't .*?, it's/i];
const ING_TAIL = /,\s+(ensuring|delivering|providing|allowing|enabling|fostering|unlocking|driving|maximizing|optimizing|facilitating|reflecting|demonstrating|showcasing)\b/i;
const STANDIN = /\b(serves as|stands as|functions as|represents|boasts)\b/i;
const WHETHER = /whether you'?re\b/i;
const FROM_TO = /from [a-z ]+ to [a-z ]+(,| and|\.|\bwe)/i;
const MECHANISM = /\b(page and line|citation|legal weight|signature|signatures|two officers|audit trail|provision)\b/i;
const COUNT_WORD = /\b(two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|dozen|hundred|thousand|fifteen|twenty|thirty|sixty|ninety)\b/i;
const PRICE_FIGURE = /\$\s?\d|\b\d+\s?(?:\/|per )?\s?(?:mo\b|month\b|door\b|doors\b)/i;
const LOT_COUNT = /\b\d{1,5}\s?(?:homes|lots|doors|units|owners|households)\b/i;
const AI_WORD = /\bai\b|artificial intelligence|machine learning|\bllm\b/i;
const USER_WORD = /\busers?\b/i;

const BLOCK = "h1 h2 h3 h4 p li dt dd th td caption blockquote summary a button label".split(" ");

/** Pull the human-visible copy, plus the head copy, out of a built page. */
export function extractCopy(html) {
  let s = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, "");

  const out = [];
  const t = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(s);
  if (t) out.push(`<!-- voice-title -->${t[1].trim()}`);
  for (const re of [/<meta\s+name="description"\s+content="([^"]*)"/i, /<meta\s+property="og:title"\s+content="([^"]*)"/i]) {
    const m = re.exec(s);
    if (m) {
      if (re.source.includes("og:title")) {
        out.push(`<!-- voice-title -->${m[1].trim()}`);
      } else {
        out.push(m[1]);
      }
    }
  }
  for (const m of s.matchAll(/<!--([\s\S]*?)-->/g)) if (/voice-(allow|surface)/i.test(m[1])) out.push(`<!--${m[1]}-->`);

  const body = /<body\b[^>]*>([\s\S]*)<\/body>/i.exec(s);
  const inner = body ? body[1] : s;
  const tagRe = new RegExp(`<(${BLOCK.join("|")})\\b[^>]*>([\\s\\S]*?)</\\1>`, "gi");
  for (const m of inner.matchAll(tagRe)) {
    const text = m[2].replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&mdash;/g, "—")
      .replace(/\s+/g, " ").trim();
    if (text) out.push(text);
  }
  const seen = new Set();
  return out.filter((x) => { const k = x.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; }).join("\n");
}

const hit = (low, w) => {
  if (!low.includes(w)) return false;
  let s = low;
  for (const e of WORD_EXCEPTIONS[w] ?? []) s = s.replace(e, "");
  return s.includes(w);
};

export function lint(text, surface = "general") {
  const tof = surface === "hero" || surface === "email";
  const allow = new Set(
    Array.from(text.matchAll(/voice-allow-file:\s*([A-Z_,\s]+)/g))
      .flatMap((m) => m[1].split(",").map((x) => x.trim()).filter(Boolean))
  );
  const problems = [];
  const lines = text.split("\n");

  lines.forEach((line, i) => {
    const isTitle = line.startsWith("<!-- voice-title -->");
    const rawLine = isTitle ? line.replace("<!-- voice-title -->", "") : line;
    const low = rawLine.toLowerCase();
    const push = (code, msg) => { if (!allow.has(code)) problems.push([i + 1, code, msg]); };

    if (!isTitle && (rawLine.includes("—") || rawLine.includes("–"))) push("EM_DASH", rawLine.trim().slice(0, 70));
    for (const w of BANNED_WORDS) if (hit(low, w)) push("BANNED_WORD", `'${w}'`);
    for (const f of BANNED_FRAMES) if (low.includes(f)) push("BANNED_FRAME", `'${f}'`);
    for (const r of REVERSALS) if (r.test(low)) push("REVERSAL", line.trim().slice(0, 60));
    if (ING_TAIL.test(line)) push("ING_TAIL", line.trim().slice(0, 60));
    if (STANDIN.test(line)) push("STANDIN", line.trim().slice(0, 60));
    if (WHETHER.test(line)) push("WHETHER_SWEEP", line.trim().slice(0, 60));
    if (FROM_TO.test(line)) push("FROM_TO_SWEEP", line.trim().slice(0, 60));
    if (AI_WORD.test(low)) push("AI_WORD", line.trim().slice(0, 60));
    if (USER_WORD.test(low)) push("USER_WORD", line.trim().slice(0, 60));

    if (!tof) return;
    if (PRICE_FIGURE.test(line)) push("PRICE_IN_TOF", line.trim().slice(0, 60));
    if (LOT_COUNT.test(line)) push("LOT_COUNT_IN_TOF", line.trim().slice(0, 60));
    if (/\d/.test(line) && !/\[[^\]]*\d/.test(line)) push("NUMBER_IN_TOF", line.trim().slice(0, 60));
    if (COUNT_WORD.test(line)) push("COUNT_IN_TOF", line.trim().slice(0, 60));
    if (MECHANISM.test(line)) push("MECHANISM_IN_TOF", line.trim().slice(0, 60));
    for (const n of NOT_SELLING) if (low.includes(n)) push("NOT_SELLING_POINT", `'${n}'`);
    for (const c of CATCH_CLAIM) if (low.includes(c)) push("CATCH_CLAIM", `'${c}'`);
    for (const v of VAGUE_WORK) if (low.includes(v)) push("VAGUE_WORK", `'${v}'`);
    for (const p of PRESUMPTION) if (low.includes(p)) push("PRESUMPTION", `'${p}'`);
  });

  const cleanForPunctuation = lines
    .filter((l) => !l.startsWith("<!--"))
    .join("\n");
  const excl = (cleanForPunctuation.match(/!/g) || []).length;
  if (excl > 1 && !allow.has("EXCLAMATION")) problems.push([0, "EXCLAMATION", `${excl} exclamation marks`]);
  return problems;
}

/*
 * The homepage is "general", not "hero", and the reason is worth recording. The
 * linter works per file, and the homepage is one file carrying a hero, a price
 * band and a five-question FAQ. Linting all of that at the hero surface would
 * demand that the FAQ answer about dues custody avoid the word "provision",
 * which is the honest answer to the question asked. Hero rules are for
 * hero-length units, and the hero block is held to them by reading it.
 */
const SURFACE_BY_PATH = [[/[/\\]index\.html$/, "general"]];

function surfaceFor(file, html) {
  const m = /<!--\s*voice-surface:\s*(\w+)\s*-->/i.exec(html);
  if (m) return m[1].toLowerCase();
  for (const [re, s] of SURFACE_BY_PATH) if (re.test(file)) return s;
  return "general";
}

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith(".html")) out.push(p);
  }
  return out;
}

import { fileURLToPath } from "node:url";

const isMain = process.argv[1] && (process.argv[1].endsWith("voice-lint.mjs") || fileURLToPath(import.meta.url) === process.argv[1]);

if (isMain) {
  if (!existsSync("dist")) {
    console.error("No dist/. Run `npm run build` first.");
    process.exit(2);
  }

  let total = 0;
  const files = walk("dist");
  for (const file of files) {
    const html = readFileSync(file, "utf8");
    const surface = surfaceFor(file, html);
    const problems = lint(extractCopy(html), surface);
    const name = relative("dist", file).replace(/\\/g, "/");
    if (!problems.length) continue;
    total += problems.length;
    console.log(`\n${name}  [${surface}]  ${problems.length} problem(s)`);
    for (const [ln, code, msg] of problems) console.log(`  [${code}] ${ln ? "line " + ln : "doc"}: ${msg}`);
  }

  if (total) {
    console.log(`\n${total} problem(s). The judgment half of the pre-flight is still yours.`);
    process.exit(1);
  }
  console.log(`${files.length} pages clean.`);
}
