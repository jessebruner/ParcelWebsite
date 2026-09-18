import type { PageSpec } from "../content";

export const collections: PageSpec = {
  "slug": "collections",
  "title": "HOA collections and late accounts",
  "description": "Review balances, prepare notices, and keep the history together. Your board decides how to handle each account.",
  "h1": "Keep late accounts on a clear path.",
  "lede": "Review balances, prepare notices, and keep the history together. Your board decides how to handle each account.",
  "closer": "Bring your board’s work together.",
  "bands": [
    {
      "title": "See the balance and the history",
      "layout": "rail",
      "field": false,
      "body": [
        {
          "p": "Keep the account record close to the correspondence. Review what is owed, what has been paid, and what the board has already communicated."
        }
      ]
    },
    {
      "title": "Review a notice before sending it",
      "layout": "rail",
      "field": true,
      "body": [
        {
          "p": "Work from the association’s confirmed rules and review the draft before it is sent. A prepared notice is a starting point for the board’s review."
        }
      ]
    },
    {
      "title": "Know when to involve an attorney",
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
