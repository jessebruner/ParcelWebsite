/**
 * Conform the restored homepage bundle to the voice guide. Idempotent.
 *
 * Restoring the original homepage also restored the copy that predates the
 * voice pass. These are the edits that pass agreed: no em dashes anywhere in
 * copy, no banned words, and no price attached to a lot count that is not the
 * reader's.
 *
 * The bundle carries each sentence more than once: in the static block a crawler
 * reads, in the JSON template a visitor gets, and for the FAQ a third time in
 * the JSON-LD. All copies move together or the page tells two stories.
 *
 * The template is decoded, edited as plain HTML, and re-encoded. Nothing here
 * writes the bundler's "</" escapes by hand; doing that once collapsed a
 * backslash level and stopped the page parsing.
 */
import { readFileSync, writeFileSync } from "node:fs";

const EM = "—";

const EDITS = [
  [`Common Parcel ${EM} HOA management software for self-managed boards`,
   "Common Parcel: HOA management software for self-managed boards"],
  ["Run your HOA without a second job", "Software that reads your governing documents"],
  ["Empower residents.", "Owners answer their own questions."],
  [`a management company ${EM} chasing dues, sending notices, tracking deadlines, collecting bids ${EM} is exactly the work software now does`,
   "a management company (collecting dues, sending notices, tracking deadlines, gathering bids) is exactly the work software now does"],
  ["Common Parcel was built to be completely automated and to replace expensive software and management companies.",
   "Common Parcel does the month from your own documents, and replaces the company you were paying to do it."],
  ["Common Parcel is your all-in-one HOA management platform. Manage dues, voting, communications, board meetings, vendor contracts, and more all in one place.",
   "Common Parcel reads your declaration and bylaws, then runs the dues, the notices, the violations, the elections and the vendor contracts on the schedule your documents already set."],
  [`No. Anything with legal weight ${EM} a lien, a fine, a statutory notice ${EM} requires two officers to sign.`,
   "No. A lien, a fine, or a statutory notice requires two officers to sign."],
  [`Everything is included ${EM} collections, violations, elections, vendor management, documents and the audit trail ${EM} with no feature tiers and no per-notice charge.`,
   "Everything is included. Collections, violations, elections, vendor management, documents and the record, with no feature tiers and no per-notice charge."],
  [`Everything is included ${EM} no per-feature tiers, no payment-processing upcharge to the association ${EM} and civic and neighborhood associations pay a discounted rate.`,
   "Everything is included. No per-feature tiers, and nothing added on to the association for processing a payment. Civic and neighborhood associations pay a discounted rate."],
  [`runs the month unattended ${EM} and it undercuts typical per-door software pricing while including collections, violations, voting and vendor management in one price.`,
   "runs the month unattended. It also undercuts typical per-door software pricing, and collections, violations, voting and vendor management are all in the one price."],
  [`Yes ${EM} electronic ballots and proxies where your state permits them`,
   "Yes. Electronic ballots and proxies where your state permits them"],
  [`and Parcel reads them ${EM} pulling the assessment amount, due dates, grace period, late fee, meeting and voting rules ${EM} and shows you each one with the page and line it came from.`,
   "and Parcel reads them. It pulls out the assessment amount, the due dates, the grace period, the late fee, and the meeting and voting rules, and shows you each one with the page and line it came from."],
  [`and civic, neighborhood and block associations ${EM} which carry lighter statutory obligations and pay a discounted rate.`,
   "and civic, neighborhood and block associations, which carry lighter statutory obligations and pay a discounted rate."],
  [`is available any month ${EM} including the month you leave.`,
   "is available any month, including the month you leave."],
  [`extracts the numbers that govern everything else ${EM} the assessment amount, the due date, the grace period, the late fee, the meeting and voting rules ${EM} and shows each one with the page and line it came from.`,
   "extracts the numbers that govern everything else. The assessment amount, the due date, the grace period, the late fee, the meeting and voting rules. Each one is shown with the page and line it came from."],
  [`for early access ${EM} the founder answers.`, "for early access. The founder answers."],
  [`jesse@commonparcel.com ${EM} the founder answers.`, "jesse@commonparcel.com. The founder answers."],
  [`minutes filed ${EM} each one ticked off`, "minutes filed. Each one ticked off"],
  [`A person replies ${EM} the founder.`, "A person replies. The founder."],
  [`Sent straight to the team ${EM} your mail app never opens`, "Sent straight to the team, so your mail app never opens"],
  [`Demo mode ${EM} nothing was transmitted.`, "Demo mode. Nothing was transmitted."],
  ["A four-lot association pays $10 a month; a 100-lot association pays about $110; a 1,000-lot association pays about $513.",
   "The smallest associations pay the monthly minimum, and the rate per lot keeps falling as the association grows."],
  ["Common Parcel is priced per door on a sliding scale that drops as the association grows: $10 a month at five units, about $100 a month for a hundred-home association, and roughly $0.40 per door at a thousand.",
   "Common Parcel starts at $10 a month, and the rate per lot falls as the association grows. Work out what your own association would pay on the pricing page."],
  ["<h2>Who it is for</h2>", "<h2>Be a neighbor again.</h2>"],
];

let n = 0;
function apply(text) {
  for (const [from, to] of EDITS) {
    const c = text.split(from).length - 1;
    if (c) { text = text.split(from).join(to); n += c; }
  }
  return text;
}

const PAGE = "public/index.html";
const lines = readFileSync(PAGE, "utf8").split("\n");
const at = {};
lines.forEach((l, i) => {
  const m = /<script type="__bundler\/(\w+)">/.exec(l);
  if (m) at[m[1]] = i + 1;
});
for (const tag of ["template", "manifest", "ext_resources", "page_order"]) {
  if (at[tag] === undefined) throw new Error(`missing ${tag}`);
}
const payloads = new Set(Object.values(at));

/* Every line that is not a payload. The manifest sits before the template, so a
   naive split would run these replacements across a megabyte of base64. */
const out = lines.map((l, i) => (payloads.has(i) ? l : apply(l)));

/* The template payload, as plain HTML. */
out[at.template] = JSON.stringify(apply(JSON.parse(lines[at.template]))).replace(/<\//g, "<\\u002F");
writeFileSync(PAGE, out.join("\n"));

/* llms.txt is hard wrapped and keeps CRLF. */
{
  const p = "public/llms.txt";
  const raw = readFileSync(p, "utf8");
  const crlf = raw.includes("\r\n");
  let s = raw.replace(/\r\n/g, "\n");
  const wrapped = [
    [`everything else ${EM} the\nassessment amount, the due date, the grace period, the late fee, the meeting and\nvoting rules ${EM} and shows each one with the page and line it came from.`,
     "everything else. The\nassessment amount, the due date, the grace period, the late fee, the meeting and\nvoting rules. Each one is shown with the page and line it came from."],
    [`Everything is included ${EM} collections, violations, elections, vendor management,\ndocuments and the audit trail ${EM} with no feature tiers and no per-notice charge.`,
     "Everything is included. Collections, violations, elections, vendor management,\ndocuments and the record, with no feature tiers and no per-notice charge."],
  ];
  for (const [from, to] of wrapped) if (s.includes(from)) { s = s.split(from).join(to); n++; }
  s = apply(s);
  writeFileSync(p, crlf ? s.replace(/\n/g, "\r\n") : s);
}

/* Every payload must still parse, or the page will not unpack at all. */
const check = readFileSync(PAGE, "utf8").split("\n");
const cAt = {};
check.forEach((l, i) => {
  const m = /<script type="__bundler\/(\w+)">/.exec(l);
  if (m) cAt[m[1]] = i + 1;
});
const parsed = {};
for (const tag of ["template", "manifest", "ext_resources", "page_order"]) parsed[tag] = JSON.parse(check[cAt[tag]]);

const emLeft = (parsed.template.match(/—/g) || []).length;
console.log(`${n} replacement(s)`);
console.log(`  all four payloads parse; manifest ${Object.keys(parsed.manifest).length} assets`);
console.log(`  em dashes left in the template: ${emLeft} (code comments and the unknown-value marker)`);
console.log(`  nav links intact: ${parsed.template.includes('href="/compliance"')}`);
