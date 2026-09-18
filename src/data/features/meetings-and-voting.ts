import type { PageSpec } from "../content";

export const meetingsAndVoting: PageSpec = {
  "slug": "meetings-and-voting",
  "title": "HOA meeting and voting software",
  "description": "Keep meeting plans, notices, attendance, votes, and minutes together. Make it easier to see what was decided and where to find it.",
  "h1": "Give every HOA meeting a clear record.",
  "lede": "Keep meeting plans, notices, attendance, votes, and minutes together. Make it easier to see what was decided and where to find it.",
  "closer": "Bring your board’s work together.",
  "bands": [
    {
      "title": "Plan around your association’s rules",
      "layout": "rail",
      "field": false,
      "body": [
        {
          "p": "Review the notice period and meeting requirements in your governing documents. Keep the scheduled meeting and notice records together."
        }
      ]
    },
    {
      "title": "Keep voting records with the meeting",
      "layout": "rail",
      "field": true,
      "body": [
        {
          "p": "Record attendance and voting information so the board can review quorum and results. Use electronic voting only where it is permitted for your association."
        }
      ]
    },
    {
      "title": "Leave useful minutes for the next board",
      "layout": "rail",
      "field": false,
      "body": [
        {
          "p": "Keep the decision, supporting documents, and meeting minutes together. Future officers can find the record without reconstructing an old email thread."
        }
      ]
    }
  ],
  "faqs": [
    [
      "Can our HOA vote electronically?",
      "That depends on your governing documents and applicable law. Confirm the association’s requirements before using electronic voting."
    ],
    [
      "How much notice does a meeting need?",
      "Use the requirements that apply to your association. Review the notice period in your governing documents and confirm any legal requirements with counsel."
    ],
    [
      "Who approves the minutes?",
      "Your association’s board follows its own approval process. Common Parcel provides a place to keep the minutes and the related meeting records."
    ]
  ]
};
