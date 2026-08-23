/**
 * documents-and-answers
 *
 * One page, one file. See src/data/content.ts for the shared shape and
 * src/data/features/index.ts for the order they appear in.
 *
 * Rewritten 2026-08-23 against the owner's recorded feedback. Three things
 * came off this page and are not coming back:
 *
 *   - the 44-word refusal paragraph. The boundary it drew is real and is still
 *     here in 24 words: we quote the documents, the attorney reads them.
 *   - "One gate in the code, and everything passes through it." That is how it
 *     is built, not why anyone would buy it.
 *   - "See security and audit" pointing at /security, where no page by that
 *     name exists. The label is now the nav's own word for that page.
 */
import type { PageSpec } from "../content";

export const documentsAndAnswers: PageSpec = {
  slug: "documents-and-answers",
  title: "Documents and answers",
  description:
    "Upload the declaration, the bylaws and the rules. Common Parcel reads them, shows each rule with the page it sits on, and answers questions out of your own documents.",
  h1: "Documents and answers",
  lede: "Boards answer the same questions over and over. Can I put a shed there? When are dues late? The answer is in the documents, if someone can find it.",
  closer: "Ask your declaration.",
  bands: [
    {
      title: "Stop hunting for the rule",
      body: [
        { panel: {
          label: "Read from your declaration",
          note: "Board review",
          rows: [
            { label: "Assessment", value: "$285", cite: "P. 6, line 12" },
            { label: "Due date", value: "1st", cite: "P. 6, line 18" },
            { label: "Grace period", value: "10 days", cite: "P. 7, line 4" },
            { label: "Late fee", value: "$25", cite: "P. 7, line 9" },
            { label: "Fine cap", value: "Unknown", cite: "Not found in your documents", pending: true },
          ],
          footing: { label: "Confirmed by the board", value: "4 of 5" },
        } },
        { p: "Upload the declaration, the bylaws and the rules; scans are fine. Due dates, dollar figures and deadlines come back with the page they sit on, and the board confirms each one before anything uses it." },
        { coda: "What your documents do not say prints as unknown, never as a number borrowed from another association." },
      ],
    },
    {
      title: "End the argument before it starts",
      field: true,
      body: [
        { p: "Every answer arrives with the page it was read from. You can read it yourself, and you can forward it." },
        { coda: "Notices quote your own rules, word for word." },
      ],
    },
    {
      title: "A records request starts a clock",
      body: [
        { p: "A records request is dated the day it arrives. Where your state sets a deadline, Common Parcel counts it down and gathers what it already holds for the board to review." },
      ],
    },
    {
      title: "Do not hold up a closing",
      field: true,
      body: [
        { p: "When a home sells, the closing needs figures from the association. Common Parcel gathers the ones the board has confirmed and leaves the rest blank rather than guess at them." },
      ],
    },
    {
      title: "What it will not do",
      air: "tight",
      note: ["See security", "/security"],
      body: [
        { p: "It shows you what your documents say and where the words are. What they mean in a dispute is a question for your attorney." },
      ],
    },
  ],
};
