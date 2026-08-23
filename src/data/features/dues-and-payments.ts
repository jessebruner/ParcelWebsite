/**
 * dues-and-payments
 *
 * One page, one file. See src/data/content.ts for the shared shape and
 * src/data/features/index.ts for the order they appear in.
 *
 * Two things on this page are load-bearing and were checked before they were
 * shortened. The custody band says the association's money never rests with
 * Common Parcel, which /security and /privacy also say and which the hero
 * scene draws as Owner -> Stripe -> HOA bank with no fourth node. And card and
 * bank payments are conditional on the association connecting its own Stripe
 * account, so the sentence that promises them carries the condition with it.
 */
import type { PageSpec } from "../content";

export const duesAndPayments: PageSpec = {
  slug: "dues-and-payments",
  title: "Dues and payments",
  description:
    "Bill every lot the amount your declaration sets, take payment through the association's own Stripe account, and post it against the right lot.",
  h1: "Dues and payments",
  lede: "Your declaration says what each lot owes and when. Common Parcel bills from that and posts every payment against the right lot.",
  closer: "Get paid without asking twice.",
  bands: [
    {
      title: "Dues go out on time",
      body: [
        { panel: {
            label: "Assessments",
            note: "Due March 1",
            rows: [
              { label: "Lot 12", chip: "Paid" },
              { label: "Lot 27", chip: "Paid" },
              { label: "Lot 41", chip: "Paid" },
              { label: "Lot 58", chip: "Paid" },
              { label: "Lot 63", value: "Unpaid", pending: true },
            ],
            footing: { label: "Collected", value: "$1,140" },
        } },
        { rows: [
          "Bills every lot what your declaration says it owes.",
          "Takes card and bank payments once the association connects Stripe.",
          "Books a mailed check against the right lot.",
          "Posts a receipt when the payment clears.",
          "Adds the late fee your documents set, after their grace period.",
        ] },
      ],
    },
    {
      title: "Common Parcel never holds your dues money",
      field: true,
      air: "open",
      note: ["See collections", "/product/collections"],
      body: [{ statutory: {
        label: "Where the money goes",
        lede: "Owners pay into the association's own bank account, in the association's own name. Common Parcel never holds association funds and has no authority to withdraw them.",
        note: "Card and bank payments start when the association connects its own Stripe account. Invoicing and ledgers do not wait for it.",
      } }],
    },
    {
      title: "Owners see the same balance you do",
      air: "tight",
      note: ["See the resident portal", "/product/resident-portal"],
      body: [{ p: "Every owner can open their own statement, from the ledger the treasurer reads. It shows what they owe today and every payment they have made." }],
    },
  ],
};
