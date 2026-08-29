/**
 * vendors-and-insurance
 *
 * One page, one file. See src/data/content.ts for the shared shape and
 * src/data/features/index.ts for the order they appear in.
 *
 * Rewritten 2026-08-23. The contract band says "A contract that renews on its
 * own is a price nobody shopped" because that is the commercial argument for
 * tracking the date, and the insurance band is honest that the board still has
 * to upload the policy.
 */
import type { PageSpec } from "../content";

export const vendorsAndInsurance: PageSpec = {
  slug: "vendors-and-insurance",
  title: "Vendors and insurance",
  description:
    "Contracts and insurance policies on a calendar the whole board can see, invoices matched to the rate you agreed to, and renewals before they roll over.",
  h1: "Vendors and insurance",
  lede: "Contracts renew silently and prices go up when nobody is looking. Common Parcel puts vendor agreements and insurance policies on a calendar the whole board shares.",
  closer: "See the renewal coming.",
  bands: [
    {
      title: "Compare competitive quotes before contracts auto-renew",
      layout: "wide",
      body: [
        { panel: {
          label: "Lawn care agreement",
          note: "Contract renewal",
          rows: [
            { label: "Vendor", value: "GreenThumb Lawn" },
            { label: "Current rate", value: "$1,850 / mo", chip: "Contracted" },
            { label: "Renewal window", value: "60 days", pending: true },
            { label: "Market quotes", value: "3 received", cite: "Bids attached" },
          ],
          footing: { label: "Board Action", value: "Review required" },
        } },
        { p: "Contracts often auto-renew if notice is not given months in advance. Common Parcel alerts the board well before deadlines so you can renegotiate or solicit bids." },
      ],
    },
    {
      title: "Verify invoice amounts against contracted rates",
      layout: "rail",
      field: true,
      air: "tight",
      note: ["See accounting and budgets", "/product/accounting-and-budgets"],
      body: [
        { panel: {
          label: "Contract Rate Audit",
          note: "Invoice #1042",
          rows: [
            { label: "Vendor", value: "GreenThumb Lawn", cite: "Active contract" },
            { label: "Billed amount", value: "$2,200.00", cite: "Monthly billing" },
            { label: "Contracted rate", value: "$2,200.00", cite: "Agreement §3" },
            { label: "Duplicate check", value: "Passed", cite: "First billing for period" },
          ],
          footing: { label: "Verification Status", value: "Cleared for payment" },
        } },
        { p: "Common Parcel checks incoming vendor invoices against contracted rates in the agreement. Discrepancies or duplicate bills are flagged before payment is approved." },
        { coda: "Automatic contract audits ensure your association pays only what was agreed." },
      ],
    },
    {
      title: "Never miss an insurance policy expiration or renewal",
      layout: "rail",
      body: [
        { p: "Upload your policy and key details like coverage limits, deductibles, and renewal dates populate a shared board calendar automatically." },
        { rows: [
          "Tracks policy renewal dates with advance reminders.",
          "Stores deductible, liability limits, and broker contact info.",
          "Ensures board transitions retain complete insurance coverage history.",
        ] },
        { coda: "Insurance milestones remain visible across annual board transitions." },
      ],
    },
  ],
  faqs: [
    ["How does Common Parcel know when a contract renews?",
      "Upload the agreement and Common Parcel reads the term and the notice period. The renewal date goes on the shared board calendar with a reminder ahead of the deadline."],
    ["How does invoice matching work?",
      "When an invoice arrives, Common Parcel compares the amount to the rate in the recorded agreement. If the rate has increased or the bill has already been paid, it flags the invoice for board review."],
    ["What insurance details are tracked?",
      "Coverage limits, deductibles, policy expiration dates, and broker contact information."],
    ["Can we store vendor insurance certificates (COIs)?",
      "Yes. Upload COIs alongside vendor agreements to track expiration dates and ensure active coverage before work begins."],
  ],
};
