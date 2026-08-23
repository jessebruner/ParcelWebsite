/**
 * accounting-and-budgets
 *
 * One page, one file. See src/data/content.ts for the shared shape and
 * src/data/features/index.ts for the order they appear in.
 */
import type { PageSpec } from "../content";

export const accountingAndBudgets: PageSpec = {
  slug: "accounting-and-budgets",
  title: "Accounting and budgets",
  description:
    "Assisted bank reconciliation, budgets that carry the vote that adopted them, and a full export for your accountant any month.",
  h1: "Accounting and budgets",
  lede: "Every charge, payment, fee and credit lands in one ledger, keeping bank activity and association records organized.",
  closer: "Books your treasurer can hand over.",
  bands: [
    {
      title: "Keep the ledger tied to the bank",
      body: [
        { "panel": {
                          "label": "Reconciliation · 31 March",
                          "note": "Complete",
                          "rows": [
                                    {
                                              "label": "Transactions matched",
                                              "meter": 1
                                    },
                                    {
                                              "label": "Deposits",
                                              "value": "$14,820"
                                    },
                                    {
                                              "label": "Vendor payments",
                                              "value": "$9,404"
                                    },
                                    {
                                              "label": "Unmatched",
                                              "value": "0",
                                              "cite": "A partial reconciliation is not accepted"
                                    }
                          ],
                          "footing": {
                                    "label": "Budget against actual",
                                    "value": "+$1,206"
                          }
                } },{ p: "Reconciliation sessions keep imported bank activity matched against ledger entries. A reconciliation that does not account for every transaction is flagged, helping the treasurer keep books clean." }],
    },
    {
      title: "Show owners how the budget was approved",
      field: true,
      body: [
        { p: "A budget moves through draft, proposed and adopted, and every version is kept. The adopted one carries the meeting that adopted it and the notice that preceded it." },
        { coda: "When an owner disputes an assessment, the board can show the date it was adopted, the notice that preceded it, and the budget attached to the vote." },
      ],
    },
    {
      title: "Bill from the approved result",
      body: [{ p: "A special assessment uses the threshold in your documents. Parcel tracks the vote against it and prepares billing after the board confirms the result." }],
    },
    {
      title: "Give the next treasurer clean books",
      field: true,
      note: ["See dues and payments", "/product/dues-and-payments"],
      body: [
        { rows: [
          "Monthly financials.",
          "Budget against actual.",
          "Delinquency by lot.",
          "Owner ledgers with every charge, payment, fee and credit.",
        ] },
        { coda: "A full export any month, with the record attached, in a form an accountant or an auditor can open." },
      ],
    },
  ],
};
