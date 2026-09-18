import type { PageSpec } from "../content";

export const residentPortal: PageSpec = {
  "slug": "resident-portal",
  "title": "HOA resident portal",
  "description": "Give owners their own account to check dues, read shared documents, and send requests. Put everyday HOA information within reach without another email to the board.",
  "h1": "Give residents their own HOA account.",
  "lede": "Give owners their own account to check dues, read shared documents, and send requests. Put everyday HOA information within reach without another email to the board.",
  "bands": [
    {
      "title": "Let owners check their own account",
      "layout": "rail",
      "field": false,
      "body": [
        {
          "p": "Owners can see their balance and payment history without asking the treasurer. Online payments are available when the association connects its payment service."
        }
      ]
    },
    {
      "title": "Share documents and meeting information",
      "layout": "rail",
      "field": true,
      "body": [
        {
          "p": "Give residents access to the documents and meeting information your association shares. They can find a copy themselves instead of asking the board to resend it."
        }
      ]
    },
    {
      "title": "Approve access for the right owners",
      "layout": "rail",
      "field": false,
      "body": [
        {
          "p": "Owners request access to their association, and the board reviews the request. Approved roles determine what each person can open. Residents see their own account information separately from the board’s work."
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
