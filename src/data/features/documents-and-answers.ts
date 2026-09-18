import type { PageSpec } from "../content";

export const documentsAndAnswers: PageSpec = {
  "slug": "documents-and-answers",
  "title": "HOA document management and answers",
  "description": "Ask questions about your declaration, bylaws, or rules. See the relevant passage and check the original document before making a decision.",
  "h1": "Get answers from your HOA documents.",
  "lede": "Ask questions about your declaration, bylaws, or rules. See the relevant passage and check the original document before making a decision.",
  "bands": [
    {
      "title": "Upload the documents your association already has",
      "layout": "rail",
      "field": false,
      "body": [
        {
          "p": "Add your declaration, bylaws, and rules, including readable scanned copies. Your board can find the originals in one place instead of searching personal folders and email attachments."
        }
      ]
    },
    {
      "title": "Ask a question in your own words",
      "layout": "rail",
      "field": true,
      "body": [
        {
          "p": "Ask about a topic such as dues dates or parking rules. Common Parcel finds relevant text in your documents and shows the source so you can check the answer and read the surrounding wording."
        }
      ]
    },
    {
      "title": "Check the details before acting",
      "layout": "rail",
      "field": false,
      "body": [
        {
          "p": "Document answers can be incomplete or wrong. Read the cited text, confirm dates and amounts, and ask your attorney about legal interpretation or a dispute."
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
