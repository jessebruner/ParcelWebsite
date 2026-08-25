/**
 * records-and-audit
 *
 * One page, one file. See src/data/content.ts for the shared shape and
 * src/data/features/index.ts for the order they appear in.
 *
 * This was the thinnest page on the site: two bands, no onward link, and a
 * band whose paragraph repeated its own heading word for word. It now argues
 * the two things that actually make an association keep records: an owner can
 * demand them, and the board that has them will not be here next year.
 */
import type { PageSpec } from "../content";

export const recordsAndAudit: PageSpec = {
  slug: "records-and-audit",
  title: "Records and audit",
  description:
    "Minutes, resolutions, notices, and ledgers kept in one place, with a name and a time on every change.",
  h1: "Records and audit",
  lede: "Officers change every year or two and what they knew leaves with them. Common Parcel keeps minutes, resolutions, notices, and ledgers where the next board will find them.",
  closer: "Nothing leaves with the treasurer.",
  bands: [
    {
      title: "Permanent association records that outlast board turnover",
      layout: "wide",
      air: "open",
      body: [
        { panel: {
          label: "Association Archive Vault",
          note: "Fiscal Year 2026",
          rows: [
            { label: "Annual meeting minutes", chip: "Signed", cite: "March 12, 2026" },
            { label: "Board resolution · Landscaping RFP", chip: "Passed", cite: "2 of 2 officers signed" },
            { label: "Delinquency notice · Lot 63", chip: "Delivered", cite: "Certified dispatch" },
            { label: "Operating ledger & bank match", chip: "Reconciled", cite: "$0 difference" },
          ],
          footing: { label: "Complete Archive Export", value: "Available anytime" },
        } },
        { p: "Every decision, notice, and reconciled financial ledger is preserved in one centralized archive that transitions automatically to incoming board members." },
      ],
    },
    {
      title: "Track every modification with immutable timestamps",
      layout: "rail",
      field: true,
      body: [
        { panel: {
          label: "Dual-Approval & Modification Log",
          note: "Live Audit Log",
          rows: [
            { label: "Rule update · Architectural guidelines", value: "Recorded", cite: "Sarah M. (President)" },
            { label: "Second officer sign-off", value: "Confirmed", cite: "John D. (Treasurer)" },
            { label: "Assessment schedule revision", value: "Verified", cite: "Matched to Bylaws p. 6" },
          ],
          footing: { label: "Audit Integrity", value: "Immutable" },
        } },
        { p: "An edit to a rule or a record carries the name of whoever made it and the time. Every action has clear accountability." },
        { rows: [
          "Every edit logs officer identity, date, and exact changes.",
          "Dual sign-off records both officers before legal actions proceed.",
          "Exportable records for CPA reviews and legal inquiries.",
        ] },
      ],
    },
    {
      title: "Fulfill owner records requests without digging",
      layout: "rail",
      air: "tight",
      note: ["Michigan records requests", "/blog/michigan-hoa-records-request"],
      body: [
        { p: "Record the day the request arrives and what the owner asked for. Common Parcel gathers the records it already holds and shows a response clock only where the rule for that association has been verified." },
        { pull: "The next treasurer should not have to ask where anything is." },
      ],
    },
    {
      title: "Zero knowledge lost when volunteers step down",
      layout: "stack",
      field: true,
      body: [
        { p: "The officer who knew where everything was is gone. The next one opens association records that outlast any board." },
        { coda: "Handing over the association takes five minutes instead of three boxes of loose paper." },
      ],
    },
  ],
  faqs: [
    ["An owner has demanded the books. What now?",
      "Record the request and what the owner asked for. Common Parcel gathers the records it already holds and shows a statutory deadline only where the rule for that association has been verified."],
    ["Who can change a record?",
      "Whoever the board has given that role. An edit to a rule or a record carries the name of whoever made it and the time."],
    ["What happens when the treasurer resigns?",
      "Nothing leaves with them. The next officer opens the same records."],
    ["Can we get everything out?",
      "An export any month, with the records attached."],
  ],
};
