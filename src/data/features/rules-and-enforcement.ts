import type { PageSpec } from "../content";

export const rulesAndEnforcement: PageSpec = {
  "slug": "rules-and-enforcement",
  "title": "HOA violations and architectural requests",
  "description": "Organize the rule, the notice, the response, and the decision. Give your board the context to review each case fairly.",
  "h1": "Keep each HOA case together.",
  "lede": "Organize the rule, the notice, the response, and the decision. Give your board the context to review each case fairly.",
  "closer": "Bring your board’s work together.",
  "bands": [
    {
      "title": "Start with the rule and the record",
      "layout": "rail",
      "field": false,
      "body": [
        {
          "p": "Keep the governing rule, observations, and correspondence with the case. Review the record before deciding the next step."
        }
      ]
    },
    {
      "title": "Track notices and hearings",
      "layout": "rail",
      "field": true,
      "body": [
        {
          "p": "Keep notice dates and hearing records together. Where a verified rule requires procedural steps, record those steps before moving the case forward."
        }
      ]
    },
    {
      "title": "Give architectural requests a home",
      "layout": "rail",
      "field": false,
      "body": [
        {
          "p": "Keep an owner’s proposal, supporting documents, and committee decision in one place. The board or committee reviews the request under the association’s rules."
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
