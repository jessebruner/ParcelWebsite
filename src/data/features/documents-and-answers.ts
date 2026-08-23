/**
 * documents-and-answers
 *
 * One page, one file. See src/data/content.ts for the shared shape and
 * src/data/features/index.ts for the order they appear in.
 */
import type { PageSpec } from "../content";

export const documentsAndAnswers: PageSpec = {
  slug: "documents-and-answers",
  title: "Documents and answers",
  description:
    "Upload the declaration, bylaws and rules. Parcel reads them, shows each provision with the page it sits on, and answers questions from your own documents.",
  h1: "Documents and answers",
  lede: "Boards answer the same questions again and again: Can I put a shed there? When are dues late? What color can I paint the door?",
  closer: "Ask your declaration.",
  bands: [
    {
      title: "See the facts inside your governing documents",
      body: [
        { "panel": {
                          "label": "Reading your declaration",
                          "note": "Board review",
                          "rows": [
                                    {
                                              "label": "Assessment",
                                              "value": "$285",
                                              "cite": "P. 6, line 12"
                                    },
                                    {
                                              "label": "Due date",
                                              "value": "1st",
                                              "cite": "P. 6, line 18"
                                    },
                                    {
                                              "label": "Grace period",
                                              "value": "10 days",
                                              "cite": "P. 7, line 4"
                                    },
                                    {
                                              "label": "Late fee",
                                              "value": "$25",
                                              "cite": "P. 7, line 9"
                                    },
                                    {
                                              "label": "Fine cap",
                                              "value": "Unknown",
                                              "cite": "Not found in your documents",
                                              "pending": true
                                    }
                          ],
                          "footing": {
                                    "label": "Confirmed by the board",
                                    "value": "4 of 5"
                          }
                } },
        { rows: [
          "**The documents are read.** Declaration, bylaws, rules, amendments, plat. Scans are fine.",
          "**Provisions come out as facts.** The assessment, the due date, the grace period, the late fee, the quorum threshold, the notice periods. Each carries the page and line it was read from.",
          "**You confirm what it read.** Review a short list beside the source text.",
          "**Unconfirmed facts cannot drive anything.** One gate in the code, and everything passes through it.",
          "**What it cannot find prints as unknown.** Not a default. Not a number from a similar association.",
        ] },
      ],
    },
    {
      title: "Answer routine questions with the source",
      field: true,
      body: [
        { p: "Questions come back with the section they rest on, so you can read it yourself and forward it to an owner who will argue." },
        { p: "Owners can ask too. Every question an owner answers alone is one the board never receives." },
        { p: "Notices quote your own rules by page and line, not a template with your association's name dropped into it." },
        { coda: "When the documents are amended, the reading is redone, and the record shows what the rule was before, when it changed, and what changed it." },
      ],
    },
    {
      title: "Track requests before a deadline is missed",
      body: [{ p: "Parcel dates a records request, shows a verified deadline where one applies, searches the records it already holds, and prepares the production log for board review." }],
    },
    {
      title: "Prepare closing records without guessing",
      field: true,
      body: [{ p: "Parcel prepares a resale packet from confirmed facts for board review. If a required figure is unconfirmed, the packet stays incomplete instead of carrying a guess to the closing table." }],
    },
    {
      title: "What it will not do",
      note: ["See security and audit", "/security"],
      body: [{ p: "It will not tell you what a provision means in a dispute. It will not opine on whether a rule is enforceable. It quotes your documents and shows you where the words are. The judgment is the board's and the law is your attorney's." }],
    },
  ],
};
