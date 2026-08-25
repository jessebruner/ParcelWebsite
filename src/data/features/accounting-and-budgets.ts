/**
 * accounting-and-budgets
 *
 * One page, one file. See src/data/content.ts for the shared shape and
 * src/data/features/index.ts for the order they appear in.
 *
 * The reconciliation band says "import a month of bank activity" rather than
 * assuming a live bank feed, because there is no promise of one. The panel
 * footing reconciles to the rows above it: nothing unmatched, so the
 * difference is zero.
 */
import type { PageSpec } from "../content";

export const accountingAndBudgets: PageSpec = {
  slug: "accounting-and-budgets",
  title: "Accounting and budgets",
  description:
    "One ledger for every charge and payment, bank activity matched line by line, and an export your accountant can open.",
  h1: "Accounting and budgets",
  lede: "Your treasurer keeps clean books without becoming an accountant. Dues, fees and vendor payments land in one ledger that matches the bank.",
  closer: "Books your treasurer can hand over.",
  bands: [
    {
      title: "Clean books that reconcile directly to your bank",
      layout: "wide",
      body: [
        { panel: {
            label: "Monthly Bank Reconciliation",
            note: "March 31 Close",
            rows: [
              { label: "Transactions matched", meter: 1 },
              { label: "Dues & assessments collected", value: "$14,820" },
              { label: "Vendor invoices disbursed", value: "$9,404" },
              { label: "Unmatched entries", value: "0" },
            ],
            footing: { label: "Ledger Variance", value: "$0.00" },
        } },
        { coda: "Import a month of bank activity and Common Parcel matches it against the ledger line by line, then flags whatever is left over." },
      ],
    },
    {
      title: "Defend every budget with recorded board approvals",
      layout: "rail",
      field: true,
      body: [
        { panel: {
          label: "Adopted Operating Budget",
          note: "FY 2026",
          rows: [
            { label: "Grounds & lawn care", value: "$18,500", cite: "Contracted rate" },
            { label: "Property insurance", value: "$6,400", cite: "Policy renewal" },
            { label: "Reserve fund contribution", value: "$12,000", cite: "Reserve study" },
            { label: "General repairs & maintenance", value: "$8,200", cite: "Historical average" },
          ],
          footing: { label: "Budget Adoption", value: "Approved 5-0" },
        } },
        { p: "Every draft of a budget is kept. The adopted one carries the meeting that adopted it and the notice that went out beforehand." },
        { coda: "That is the answer when an owner argues about an assessment." },
      ],
    },
    {
      title: "Automate special assessment billing after member votes",
      layout: "quiet",
      air: "tight",
      body: [{ p: "A special assessment needs the share of votes your documents require. Common Parcel counts them against it and prepares the billing after the board confirms the result." }],
    },
    {
      title: "Export audit-ready financials in seconds",
      layout: "rail",
      field: true,
      note: ["See dues and payments", "/product/dues-and-payments"],
      body: [
        { rows: [
          "Monthly income and expense statements.",
          "What you budgeted next to what you spent.",
          "Who is behind and by how much.",
          "Every owner's ledger, charge by charge.",
        ] },
        { coda: "A full export any month, with the records attached, in a form an accountant or an auditor can open." },
        { pull: "A treasurer should be able to close the books without learning accounting." },
      ],
    },
  ],
  faqs: [
    ["Does this replace our accountant?",
      "No. It hands them books that already match the bank, with every figure traceable to the transaction behind it."],
    ["How does the bank get matched?",
      "Import a month of bank activity and Common Parcel matches it against the ledger line by line, then flags whatever is left over instead of forcing it."],
    ["Can we still export everything?",
      "Any month, with the records attached, in a form an accountant or an auditor can open."],
    ["What about a special assessment?",
      "It needs the share of votes your documents require. Common Parcel counts against that share and prepares the billing after the board confirms the result."],
  ],
};
