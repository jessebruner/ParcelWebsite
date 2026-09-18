import type { PageSpec } from "../content";

export const documentsAndAnswers: PageSpec = {
  "slug": "documents-and-answers",
  "title": "HOA document management and answers",
  "description": "Keep your declaration, bylaws, and rules in one place. Ask questions about them and check the supporting passage before acting.",
  "h1": "Find the rule and see the source.",
  "lede": "Keep your declaration, bylaws, and rules in one place. Ask questions about them and check the supporting passage before acting.",
  "closer": "Bring your board’s work together.",
  "bands": [
    {
      "title": "Start with your own governing documents",
      "layout": "rail",
      "field": false,
      "body": [
        {
          "p": "Upload the association’s declaration, bylaws, and rules, including scanned copies. Keep the originals available for the people who need to read them."
        }
      ]
    },
    {
      "title": "Review answers beside the source",
      "layout": "rail",
      "field": true,
      "body": [
        {
          "p": "Use document answers to locate relevant passages. Check the cited text and the surrounding context, especially when dates, amounts, or obligations matter."
        }
      ]
    },
    {
      "title": "Leave room for a careful review",
      "layout": "rail",
      "field": false,
      "body": [
        {
          "p": "Document answers can be incomplete or wrong. Confirm setup information before using it, and ask your attorney about legal interpretation or a dispute."
        }
      ]
    }
  ],
  "faqs": [
    [
      "What HOA documents can we upload?",
      "Start with your declaration, bylaws, and association rules. Scanned copies can be uploaded too; readable documents make review easier."
    ],
    [
      "Are document answers legal advice?",
      "No. They help you find information in your documents. Read the cited passage and consult your attorney about legal interpretation."
    ],
    [
      "What if an answer is missing or wrong?",
      "Check the original document and correct the information used by the board. Do not treat an unsupported answer as an association rule."
    ]
  ]
};
