/**
 * vendors-and-insurance
 *
 * One page, one file. See src/data/content.ts for the shared shape and
 * src/data/features/index.ts for the order they appear in.
 *
 * Rewritten 2026-08-23. Three of the four band titles here were rejected by
 * name, and two of them for the same reason: they described the mechanism and
 * never named the payoff.
 *
 *   - "Compare every quote on the same facts" is gone. The panel underneath it
 *     already held the argument and never said it out loud: the incumbent is
 *     renewing $4,750 above the lowest quote. The saving is now the loudest
 *     number in the figure and the heading points at it.
 *   - "Plan reserves from the study you already have" is gone with its band.
 *     A reserve study is a real document that most small associations have
 *     never commissioned, and a page cannot open by assuming the reader owns
 *     one. Reserves belong on accounting-and-budgets, which is linked.
 *   - "Stay ahead of vendor renewals and compare quotes" was the old h1 and the
 *     one line here the owner liked. It opens the page as a selling point.
 */
import type { PageSpec } from "../content";

export const vendorsAndInsurance: PageSpec = {
  slug: "vendors-and-insurance",
  title: "Vendors and insurance",
  description:
    "Watch the date every vendor contract and insurance policy renews on, put fresh quotes beside what you pay now, and check invoices against the agreement behind them.",
  h1: "Vendors and insurance",
  lede: "Stay ahead of vendor renewals and compare quotes. A contract that renews on its own gives the board one window to shop the price, and it closes quietly.",
  closer: "Know before the renewal does.",
  bands: [
    {
      title: "What the renewal is costing you",
      body: [
        { panel: {
          label: "Landscaping · renews April 16",
          note: "3 quotes in",
          rows: [
            { label: "Current vendor, renewing", value: "$26,400" },
            { label: "Second quote", value: "$24,550" },
            { label: "Third quote", value: "$21,650", chip: "Lowest" },
          ],
          footing: { label: "Lower than the renewal", value: "$4,750" },
        } },
        { p: "Common Parcel watches the date each contract renews on, drafts the requests for fresh quotes, and puts the replies beside what you pay now." },
        { coda: "You send the requests and you pick the vendor." },
      ],
    },
    {
      title: "Pay the rate you agreed to",
      field: true,
      air: "tight",
      note: ["See accounting and budgets", "/product/accounting-and-budgets"],
      body: [
        { p: "Common Parcel checks the invoice against the rate in the agreement. A rate that moved, or a bill sent twice, comes back to the board before the check goes out." },
      ],
    },
    {
      title: "Your policy has a renewal date too",
      body: [
        { p: "Upload the policy and the coverage limit, the deductible and the renewal date come out of it and onto a calendar the whole board can see." },
        { coda: "If the only person who knows the renewal date leaves the board, the date leaves with them." },
      ],
    },
  ],
};
