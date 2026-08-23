/**
 * dues-and-payments
 *
 * One page, one file. See src/data/content.ts for the shared shape and
 * src/data/features/index.ts for the order they appear in.
 */
import type { PageSpec } from "../content";

export const duesAndPayments: PageSpec = {
  slug: "dues-and-payments",
  title: "Dues and payments",
  description:
    "Invoice every lot from one board-approved schedule, collect online when connected, and keep payment records organized for the treasurer.",
  h1: "Dues and payments",
  lede: "Parcel bills the assessment your declaration sets, on the date it sets. It does not ask you to type the amount, and it does not need reminding when the quarter turns.",
  closer: "Get paid without asking twice.",
  bands: [
    {
      title: "Send dues without rebuilding the schedule",
      body: [
        { "panel": {
                          "label": "Assessments · March",
                          "note": "118 lots",
                          "rows": [
                                    {
                                              "label": "Lot 12 · A. Wells",
                                              "chip": "Paid"
                                    },
                                    {
                                              "label": "Lot 27 · R. Okafor",
                                              "chip": "Paid"
                                    },
                                    {
                                              "label": "Lot 41 · Delgado",
                                              "chip": "Paid"
                                    },
                                    {
                                              "label": "Lot 58 · J. Pham",
                                              "chip": "Paid"
                                    },
                                    {
                                              "label": "Lot 63 · Hargrove",
                                              "value": "Due",
                                              "pending": true
                                    }
                          ],
                          "footing": {
                                    "label": "Collected",
                                    "value": "$1,140"
                          }
                } },{ rows: [
        "Invoices every lot on your schedule, at your amount.",
        "Takes bank transfer and card when connected.",
        "Logs a mailed cheque against the right lot.",
        "Posts a receipt when a payment clears.",
        "Applies late fees the way your documents describe them.",
        "Gives every owner a statement they can download.",
      ] }],
    },
    {
      title: "Confirm the numbers before billing starts",
      field: true,
      body: [{ rows: [
        "**One.** Parcel reads the assessment, the due date, the grace period and the late fee out of your declaration, and shows each one with the page it came from.",
        "**Two.** You confirm what it read.",
        "**Three.** You approve the schedule once. Parcel prepares each billing run from it.",
      ] }],
    },
    {
      title: "Common Parcel never holds your HOA's money",
      note: ["See collections", "/product/collections"],
      body: [{ statutory: {
        label: "Custody",
        lede: "Owners pay into the association's own account, in the association's own name. Common Parcel never holds association funds or has authority to withdraw them.",
        note: "Online card and bank payments switch on only after the association connects its own Stripe account. Invoicing, ledgers and statements do not depend on that connection.",
      } }],
    },
  ],
};
