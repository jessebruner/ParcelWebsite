/**
 * Give every feature page the homepage's panel.
 *
 * The demo figures are the ones the original product section uses, so the pages
 * and the homepage show the same association. Sample data, and every panel says
 * so in its caption.
 */
import { readFileSync, writeFileSync } from "node:fs";

const PANELS = {
  "dues-and-payments": {
    label: "Assessments · March",
    note: "118 lots",
    rows: [
      { label: "Lot 12 · A. Wells", chip: "Paid" },
      { label: "Lot 27 · R. Okafor", chip: "Paid" },
      { label: "Lot 41 · Delgado", chip: "Paid" },
      { label: "Lot 58 · J. Pham", chip: "Paid" },
      { label: "Lot 63 · Hargrove", value: "Due", pending: true },
    ],
    footing: { label: "Collected", value: "$1,140" },
  },
  collections: {
    label: "Lot 63 · unpaid since 1 March",
    note: "Held",
    rows: [
      { label: "Friendly reminder", value: "Day 1", cite: "Sent" },
      { label: "Formal late notice", value: "Day 30", cite: "Sent" },
      { label: "Demand and lien warning", value: "Day 60", cite: "Awaiting two signatures", pending: true },
      { label: "Accrual", value: "Frozen", cite: "Hardship recorded by the board" },
    ],
    footing: { label: "Balance", value: "$570" },
  },
  "accounting-and-budgets": {
    label: "Reconciliation · 31 March",
    note: "Complete",
    rows: [
      { label: "Transactions matched", meter: 1 },
      { label: "Deposits", value: "$14,820" },
      { label: "Vendor payments", value: "$9,404" },
      { label: "Unmatched", value: "0", cite: "A partial reconciliation is not accepted" },
    ],
    footing: { label: "Budget against actual", value: "+$1,206" },
  },
  "rules-and-enforcement": {
    label: "Lot 77 · fence height",
    note: "On schedule",
    rows: [
      { label: "Notice sent", value: "2 March", cite: "Art. VII §3, p. 14" },
      { label: "Cure window", value: "closes 16 March", pending: true },
      { label: "Re-inspection", value: "17 March" },
      { label: "Enforced before", value: "3 times in 4 years", cite: "11 open instances" },
    ],
    footing: { label: "Fine available", value: "Not yet" },
  },
  "meetings-and-voting": {
    label: "Annual meeting · 14 November",
    note: "Live tally",
    rows: [
      { label: "Notice sent", value: "21 days prior", cite: "Bylaws Art. IV §2, p. 9" },
      { label: "Quorum", meter: 0.62 },
      { label: "Ballots in", value: "73 of 118" },
      { label: "Minutes", value: "Drafting", pending: true },
    ],
    footing: { label: "Quorum threshold", value: "Met" },
  },
  "documents-and-answers": {
    label: "Reading your declaration",
    note: "About 30 min",
    rows: [
      { label: "Assessment", value: "$285", cite: "P. 6, line 12" },
      { label: "Due date", value: "1st", cite: "P. 6, line 18" },
      { label: "Grace period", value: "10 days", cite: "P. 7, line 4" },
      { label: "Late fee", value: "$25", cite: "P. 7, line 9" },
      { label: "Fine cap", value: "Unknown", cite: "Not found in your documents", pending: true },
    ],
    footing: { label: "Confirmed by the board", value: "4 of 5" },
  },
  "vendors-and-insurance": {
    label: "Landscaping · renews 2 April",
    note: "3 quotes in",
    rows: [
      { label: "Incumbent, renewing", value: "$26,400" },
      { label: "Quote two", value: "$24,550" },
      { label: "Quote three", value: "$21,650", chip: "Lowest" },
      { label: "Going rate, your area", value: "$22,100", cite: "Benchmark" },
    ],
    footing: { label: "If you switch", value: "$4,750" },
  },
  "resident-portal": {
    label: "Portal · what an owner sees",
    note: "0 to your inbox",
    rows: [
      { label: "Balance", value: "$285" },
      { label: "Autopay", value: "On", cite: "Next 1 April" },
      { label: "Can I put a shed on my lot?", value: "Answered", cite: "Art. IX §2, p. 21" },
      { label: "Architectural request", value: "Submitted", pending: true },
    ],
    footing: { label: "Calls to the board", value: "None" },
  },
};

let s = readFileSync("src/data/content.ts", "utf8");
let added = 0;

for (const [slug, panel] of Object.entries(PANELS)) {
  const marker = `    slug: "${slug}",`;
  const at = s.indexOf(marker);
  if (at === -1) { console.error("no such feature: " + slug); process.exit(1); }

  // Insert the panel as the first block of the first band on that page.
  const bandsAt = s.indexOf("    bands: [", at);
  const firstBody = s.indexOf("body: [", bandsAt);
  if (firstBody === -1) { console.error("no body for " + slug); process.exit(1); }

  const json = JSON.stringify({ panel }, null, 10)
    .replace(/\n/g, "\n        ")
    .replace(/^\{\n/, "{\n")
    .slice(1, -1)
    .trim();

  const insert = `body: [\n          { ${json} },`;
  s = s.slice(0, firstBody) + insert + s.slice(firstBody + "body: [".length);
  added++;
}

writeFileSync("src/data/content.ts", s);
console.log(`${added} panels added`);
