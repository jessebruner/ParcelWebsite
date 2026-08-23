/**
 * vendors-and-insurance
 *
 * One page, one file. See src/data/content.ts for the shared shape and
 * src/data/features/index.ts for the order they appear in.
 */
import type { PageSpec } from "../content";

export const vendorsAndInsurance: PageSpec = {
  slug: "vendors-and-insurance",
  title: "Vendors and insurance",
  description:
    "Surface contracts before they renew, prepare quote requests for board review, and keep invoices beside the agreements behind them.",
  h1: "Vendors and insurance",
  lede: "Put each renewal date and notice period on one board calendar. Parcel counts back from both and helps prepare quote requests for board review.",
  closer: "Know before the renewal does.",
  bands: [
    {
      title: "See renewals before the deadline",
      body: [
        { "panel": {
                          "label": "Landscaping · renews 2 April",
                          "note": "3 quotes in",
                          "rows": [
                                    {
                                              "label": "Incumbent, renewing",
                                              "value": "$26,400"
                                    },
                                    {
                                              "label": "Quote two",
                                              "value": "$24,550"
                                    },
                                    {
                                              "label": "Quote three",
                                              "value": "$21,650",
                                              "chip": "Lowest"
                                    },
                                    {
                                              "label": "Board review",
                                              "value": "3 quotes",
                                              "cite": "Ready to compare"
                                    }
                          ],
                          "footing": {
                                    "label": "Decision",
                                    "value": "Board chooses"
                          }
                } },
        { p: "Every contract has a renewal date and a notice period, and Parcel counts back from both. Before a contract renews, it alerts the board, drafts requests for fresh quotes, and lets you compare recorded vendor bids." },
        { coda: "You review and send the requests, and you pick the vendor. Parcel surfaces the renewal so the date does not pass unnoticed." },
      ],
    },
    {
      title: "Compare every quote on the same facts",
      field: true,
      body: [
        { p: "Prepare a request for several vendors from one screen, review it, and send it. Record the replies in one table so the board can compare the same facts." },
        { p: "Compare an invoice with its contract before board approval. A changed rate, an out-of-scope line, or a duplicate stays visible beside the document that answers it." },
      ],
    },
    {
      title: "Put policy renewals on the board calendar",
      body: [
        { p: "Policies are read the way governing documents are read. Coverage limits, deductibles, renewal dates, and notice periods sit beside the source page for board confirmation." },
        { coda: "The renewal belongs on the board calendar, not in one officer's memory." },
      ],
    },
    {
      title: "Plan reserves from the study you already have",
      field: true,
      note: ["See accounting and budgets", "/product/accounting-and-budgets"],
      body: [{ p: "Upload the reserve study and the numbers come out of it. Parcel tracks the funded position against what the study recommends, and says which it is missing when it only has one side." }],
    },
  ],
};
