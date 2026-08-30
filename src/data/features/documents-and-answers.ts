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
    "Upload the declaration, the bylaws and the rules. Common Parcel reads them, shows each rule with the page it sits on, and answers questions from your own documents.",
  h1: "Documents and answers",
  lede: "Boards answer the same questions over and over. Can I put a shed there? When are dues late? The answer is in the documents, if someone can find it.",
  closer: "Ask your declaration.",
  bands: [
    {
      title: "Find exact rule citations in seconds",
      layout: "wide",
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
      title: "Back every notice with direct declaration quotes",
      layout: "rail",
      field: true,
      body: [
        { panel: {
          label: "Document Citation Engine",
          note: "Declaration & Bylaws",
          rows: [
            { label: "Resident inquiry", value: "Fence replacement", cite: "Lot 14" },
            { label: "Bylaw citation", value: "Art. VII §3", cite: "Declaration, p. 18" },
            { label: "Standard clause", value: "6 ft maximum height", cite: "Matched" },
            { label: "Application required", value: "ARC Form B", cite: "Attached" },
          ],
          footing: { label: "Verification Source", value: "Direct Quote" },
        } },
        { p: "Every answer comes back with the exact page and section from your recorded documents. You can review the citation yourself and forward it directly to the resident." },
        { coda: "Notices quote your own rules word for word, eliminating misunderstandings." },
      ],
    },
    {
      title: "Track statutory deadlines automatically",
      layout: "rail",
      body: [
        { p: "A records request is dated the day it arrives. Where your state sets a deadline, Common Parcel counts it down and gathers what it already holds for the board to review." },
        { coda: "The response clock gives volunteers clear milestones before statutory windows close." },
      ],
    },
    {
      title: "Speed up real estate closings with instant disclosures",
      layout: "stack",
      field: true,
      body: [
        { p: "When a home sells, the closing needs figures from the association. Common Parcel gathers the ones the board has confirmed and leaves the rest blank rather than guess at them." },
        { coda: "Title companies receive verified ledgers and document packets without last-minute panic." },
      ],
    },
    {
      title: "Clear boundaries between software and legal counsel",
      layout: "quiet",
      air: "tight",
      note: ["See security", "/security"],
      body: [
        { p: "It shows you what your documents say and where the words are. What they mean in a dispute is a question for your attorney." },
      ],
    },
  ],
  faqs: [
    ["What do we need to upload?",
      "The declaration, the bylaws and the rules. Scans are fine."],
    ["What if it reads something wrong?",
      "You correct it during the board review, and the correction is what everything else reads. Each figure comes back with the page it was read from precisely so it can be checked."],
    ["What if our documents do not say?",
      "It prints unknown and names what it could not find. It will not fill the gap with a figure from another association."],
    ["Can it tell us what a rule means?",
      "It shows you what your documents say and where the words are. What they mean in a dispute is a question for your attorney."],
  ],
};
