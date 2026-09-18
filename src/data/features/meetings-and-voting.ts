import type { PageSpec } from "../content";

export const meetingsAndVoting: PageSpec = {
  "slug": "meetings-and-voting",
  "title": "HOA meeting and voting software",
  "description": "Keep meeting notices, attendance, votes, and minutes together. Prepare for the meeting and leave a useful record of what the board decided.",
  "h1": "Plan HOA meetings and record the decisions.",
  "lede": "Keep meeting notices, attendance, votes, and minutes together. Prepare for the meeting and leave a useful record of what the board decided.",
  "bands": [
    {
      "title": "Prepare the meeting and notice",
      "layout": "rail",
      "field": false,
      "body": [
        {
          "p": "Check the notice period and meeting requirements in your governing documents. Keep the meeting date and notice records together so your board can review what is ready."
        }
      ]
    },
    {
      "title": "Record attendance and voting results",
      "layout": "rail",
      "field": true,
      "body": [
        {
          "p": "Record attendance and votes so the board can check quorum (the minimum participation needed to conduct business) and review the results. Use electronic voting only where your association’s rules and applicable law permit it."
        }
      ]
    },
    {
      "title": "Find the decision after the meeting",
      "layout": "rail",
      "field": false,
      "body": [
        {
          "p": "Save minutes with the decisions and supporting documents. When a question comes up later, board members can open the meeting record instead of reconstructing an email thread."
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
