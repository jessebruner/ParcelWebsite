import type { PageSpec } from "../content";

export const collections: PageSpec = {
  "slug": "collections",
  "title": "HOA collections and late accounts",
  "description": "Review what is owed, see previous notices, and prepare the next follow-up. Keep the payment history and correspondence together for each account.",
  "h1": "Follow up on unpaid HOA dues.",
  "lede": "Review what is owed, see previous notices, and prepare the next follow-up. Keep the payment history and correspondence together for each account.",
  "bands": [
    {
      "title": "See what is owed and what was sent",
      "layout": "rail",
      "field": false,
      "body": [
        {
          "p": "Review the unpaid balance, past payments, and previous correspondence in the same account record. Board members can see what has already been discussed before contacting an owner."
        }
      ]
    },
    {
      "title": "Review a notice before sending it",
      "layout": "rail",
      "field": true,
      "body": [
        {
          "p": "Prepare a notice using the association’s confirmed rules. Check the amount, dates, and wording before the board authorizes it."
        }
      ]
    },
    {
      "title": "Get legal help with formal collection actions",
      "layout": "rail",
      "field": false,
      "body": [
        {
          "p": "Demand letters, liens, and other formal collection actions need the appropriate legal review. Certified-mail service is not connected, so a draft or approval is not proof of service."
        }
      ]
    }
  ],
  "faqs": [
    [
      "Can Common Parcel send a demand letter on its own?",
      "No. Collection notices need board review and authorization. Formal legal action may also need an attorney."
    ],
    [
      "Can we keep track of payment plans?",
      "Keep the agreed plan and the account’s payment history with the collection record so the board can review them together."
    ],
    [
      "Does a recorded notice prove it was served?",
      "No. A record that a notice was drafted or approved does not prove service. Certified-mail service is not connected."
    ]
  ]
};
