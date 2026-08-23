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
      title: "Books that match the bank",
      layout: "wide",
      body: [
        { panel: {
            label: "Reconciliation",
            note: "March 31",
            rows: [
              { label: "Transactions matched", meter: 1 },
              { label: "Deposits", value: "$14,820" },
              { label: "Vendor payments", value: "$9,404" },
              { label: "Unmatched", value: "0" },
            ],
            footing: { label: "Difference", value: "$0" },
        } },
        /* A coda, not a <p>: tokens.css line 224 zeroes the margin on every
           <p> in a band body, so a paragraph under a panel sits flush against
           it. Reported, not fixed here. */
        { coda: "Import a month of bank activity and Common Parcel matches it against the ledger line by line, then flags whatever is left over." },
      ],
    },
    {
      title: "Show owners how the budget was approved",
      layout: "rail",
      field: true,
      body: [
        { p: "Every draft of a budget is kept. The adopted one carries the meeting that adopted it and the notice that went out beforehand." },
        { coda: "That is the answer when an owner argues about an assessment." },
      ],
    },
    {
      title: "Special assessments wait for the vote",
      layout: "quiet",
      air: "tight",
      body: [{ p: "A special assessment needs the share of votes your documents require. Common Parcel counts them against it and prepares the billing after the board confirms the result." }],
    },
    {
      title: "Hand it all to the next treasurer",
      layout: "stack",
      field: true,
      note: ["See dues and payments", "/product/dues-and-payments"],
      body: [
        { rows: [
          "Monthly financial statements.",
          "What you budgeted next to what you spent.",
          "Who is behind and by how much.",
          "Every owner's ledger, charge by charge.",
        ] },
        { coda: "A full export any month, with the records attached, in a form an accountant or an auditor can open." },
      
        { pull: "A treasurer should be able to close the books without learning accounting." },
      ],
    },
  ],
};
