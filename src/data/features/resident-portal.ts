import type { PageSpec } from "../content";

export const residentPortal: PageSpec = {
  "slug": "resident-portal",
  "title": "HOA resident portal",
  "description": "A balance to check. A document to find. A request to submit. Put everyday association information within reach.",
  "h1": "Give residents a place to start.",
  "lede": "A balance to check. A document to find. A request to submit. Put everyday association information within reach.",
  "closer": "Bring your board’s work together.",
  "bands": [
    {
      "title": "Make the account easy to find",
      "layout": "rail",
      "field": false,
      "body": [
        {
          "p": "Owners can check their own account and payment history. Online payments are available when the association connects its payment service."
        }
      ]
    },
    {
      "title": "Keep common documents close",
      "layout": "rail",
      "field": true,
      "body": [
        {
          "p": "Give residents access to the association documents and meeting information shared with them. Help people find the source without asking the board to resend it."
        }
      ]
    },
    {
      "title": "Keep access tied to the right person",
      "layout": "rail",
      "field": false,
      "body": [
        {
          "p": "Owners request access to their association. Board approval and assigned roles determine what they can open, with personal account information kept separate from board work."
        }
      ]
    }
  ],
  "faqs": [
    [
      "How do owners get access?",
      "An owner requests access to their association and the board reviews the request. Access depends on the person’s approved role."
    ],
    [
      "Can residents see another owner’s balance?",
      "Residents access their own account information. Board access is handled separately according to assigned roles."
    ],
    [
      "Can residents submit architectural requests?",
      "Yes. The portal provides a place to submit a request and keep its supporting information together for review."
    ]
  ]
};
