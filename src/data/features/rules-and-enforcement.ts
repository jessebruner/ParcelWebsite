import type { PageSpec } from "../content";

export const rulesAndEnforcement: PageSpec = {
  "slug": "rules-and-enforcement",
  "title": "HOA violations and architectural requests",
  "description": "Review each request or violation with the documents, photos, notices, and correspondence together. Keep a record of the board’s decision and follow-up.",
  "h1": "Manage violations and home improvement requests.",
  "lede": "Review each request or violation with the documents, photos, notices, and correspondence together. Keep a record of the board’s decision and follow-up.",
  "bands": [
    {
      "title": "Review the facts behind a violation",
      "layout": "rail",
      "field": false,
      "body": [
        {
          "p": "Keep the relevant rule, observations, photos, and correspondence with the case. Read the history before deciding whether a notice or another step is appropriate."
        }
      ]
    },
    {
      "title": "Track notices and hearings",
      "layout": "rail",
      "field": true,
      "body": [
        {
          "p": "Keep notice dates and hearing records with the case. Record the steps required by your association’s confirmed rules before moving forward."
        }
      ]
    },
    {
      "title": "Review requests for home improvements",
      "layout": "rail",
      "field": false,
      "body": [
        {
          "p": "Keep an owner’s proposal, supporting documents, and committee decision in one place. The board or architectural committee reviews the request under the association’s rules."
        }
      ]
    }
  ],
  "faqs": [
    [
      "Does Common Parcel decide whether to fine an owner?",
      "No. Authorized people make enforcement decisions. The software helps organize the record and the review process."
    ],
    [
      "Can we manage architectural requests?",
      "Yes. Owners can submit requests through the resident portal, and the board or committee can keep the review and decision with the submission."
    ],
    [
      "Does the software guarantee legal compliance?",
      "No. Requirements depend on your documents, jurisdiction, and facts. Ask your attorney about disputed rules, accommodations, or formal enforcement."
    ]
  ]
};
