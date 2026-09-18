import type { PageSpec } from "../content";

export const duesAndPayments: PageSpec = {
  "slug": "dues-and-payments",
  "title": "HOA dues and online payments",
  "description": "Give owners a place to pay and see their balance. Review invoices, payments, and unpaid dues for every lot in one place.",
  "h1": "Collect HOA dues online.",
  "lede": "Give owners a place to pay and see their balance. Review invoices, payments, and unpaid dues for every lot in one place.",
  "bands": [
    {
      "title": "Set up dues with the right amounts and dates",
      "layout": "rail",
      "field": false,
      "body": [
        {
          "p": "Set up dues and other assessments using your governing documents and the amounts and dates your board has reviewed. Each invoice stays linked to the right lot."
        }
      ]
    },
    {
      "title": "Let residents check their balance and pay",
      "layout": "rail",
      "field": true,
      "body": [
        {
          "p": "Residents can review their own balance and payment history. When online payments are connected, they can pay through the portal without asking the treasurer for their account details."
        }
      ]
    },
    {
      "title": "Payments go to your association’s account",
      "layout": "rail",
      "field": false,
      "body": [
        {
          "p": "Online payments use the association’s connected payment account. Common Parcel does not hold association funds. Processing fees and payment availability depend on the connected service."
        }
      ]
    }
  ],
  "faqs": [
    [
      "How do residents pay HOA dues?",
      "When the association has connected online payments, owners can pay through the resident portal. Their balance and payment records stay linked to their lot."
    ],
    [
      "Where do assessment amounts come from?",
      "The board reviews the amounts and dates used for billing against the association’s governing documents. Confirm those details before issuing invoices."
    ],
    [
      "Does Common Parcel hold our money?",
      "No. Online payments use the association’s connected payment account. Common Parcel does not hold HOA funds."
    ]
  ]
};
