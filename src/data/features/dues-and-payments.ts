import type { PageSpec } from "../content";

export const duesAndPayments: PageSpec = {
  "slug": "dues-and-payments",
  "title": "HOA dues and online payments",
  "description": "Give owners a clear balance and a place to pay. Keep invoices and payment records connected to the right lot.",
  "h1": "A clearer way to collect HOA dues.",
  "lede": "Give owners a clear balance and a place to pay. Keep invoices and payment records connected to the right lot.",
  "closer": "Bring your board’s work together.",
  "bands": [
    {
      "title": "Bill from the details your board confirms",
      "layout": "rail",
      "field": false,
      "body": [
        {
          "p": "Set up assessments using your governing documents and the amounts and dates your board has reviewed. Keep the charge, the due date, and the lot together."
        }
      ]
    },
    {
      "title": "Give residents a clear account",
      "layout": "rail",
      "field": true,
      "body": [
        {
          "p": "Residents can review their own balance and payment history. When online payments are connected, they can pay through the portal."
        }
      ]
    },
    {
      "title": "Keep association funds with the association",
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
