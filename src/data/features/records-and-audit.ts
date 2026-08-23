/**
 * records-and-audit
 *
 * One page, one file. See src/data/content.ts for the shared shape and
 * src/data/features/index.ts for the order they appear in.
 */
import type { PageSpec } from "../content";

export const recordsAndAudit: PageSpec = {
  slug: "records-and-audit",
  title: "Records and audit",
  description:
    "Keep meeting records, board resolutions, vendor contracts, and numbered change history together across board transitions.",
  h1: "Records and audit",
  lede: "When officers rotate, institutional memory disappears. Keep minutes, resolutions, notices, and financial ledgers together so the next board inherits a usable association record.",
  closer: "The next board inherits everything.",
  bands: [
    {
      title: "Keep decisions with the records behind them",
      body: [
        {
          panel: {
            label: "Record · March",
            note: "Numbered",
            rows: [
              { label: "Resolution 2026-04 · Roofing", chip: "Passed" },
              { label: "Notice · Lot 77 Fence", chip: "Delivered" },
              { label: "Invoice · Apex Landscaping", chip: "Reconciled" },
              { label: "Annual Meeting Minutes", chip: "Signed" },
            ],
            footing: {
              label: "Export",
              value: "Included",
            },
          },
        },
        {
          rows: [
            "Meeting notices, verified attendance, and signed minutes.",
            "Board resolutions with documented voting tallies.",
            "Vendor contracts, renewals, and reconciled invoices.",
            "Notices, violation timelines, and hearing decisions.",
            "Monthly financial statements and bank reconciliation records.",
          ],
        },
      ],
    },
    {
      title: "Show who changed what",
      field: true,
      body: [
        { p: "Changes to supported accounts, rules, and records note who made them and when." },
        { coda: "The next board inherits structured association history instead of scattered email threads." },
      ],
    },
  ],
};
