/**
 * resident-portal
 *
 * One page, one file. See src/data/content.ts for the shared shape and
 * src/data/features/index.ts for the order they appear in.
 *
 * Rewritten 2026-08-23. Two sentences left this page and should not be
 * rewritten in another shape:
 *
 *   - "The phone call that does not happen. The email that does not need
 *     answering. The violation that does not start because the owner read the
 *     rule first." Three verbless noun phrases, each a negation, each longer
 *     than the last. Nothing on this site is allowed to sound like that.
 *   - "A duplicate claim is accepted and left for the board, because a spouse,
 *     a tenant and an heir can all be legitimate at one address." True, and an
 *     engineering note. The board still approves every claim; that is the part
 *     a reader is buying, and it is all that is left.
 *
 * The old h1, "Built so owners stop calling you", opens the lede.
 */
import type { PageSpec } from "../content";

export const residentPortal: PageSpec = {
  slug: "resident-portal",
  title: "Resident portal",
  description:
    "Owners look up a balance, pay it, read the rule that applies to their lot, send in a request and vote. Every question they answer alone is one the board never gets.",
  h1: "Resident portal",
  lede: "Built so owners stop calling you. An owner can find a balance, a receipt or the rule about sheds without a board member's phone number.",
  closer: "Your phone stops ringing.",
  bands: [
    {
      title: "Self-service resident portal cuts board inquiries",
      layout: "wide",
      body: [
        { panel: {
          label: "Portal · what an owner sees",
          note: "Self-service",
          rows: [
            { label: "Balance", value: "$285" },
            { label: "Last payment", value: "$285", cite: "March 1" },
            { label: "Can I put a shed on my lot?", value: "Answered", cite: "Art. IX §2, p. 21" },
            { label: "Architectural request", value: "Submitted", pending: true },
          ],
          footing: { label: "Calls to the board", value: "None" },
        } },
        { rows: [
          "See a balance and what it is made of.",
          "Pay it online, once the association has connected a bank account.",
          "Look up the rule that applies to their lot, and the section it comes from.",
          "Send in a request or an architectural application, with photos.",
          "Vote in an election, where the state allows it.",
        ] },
      ],
    },
    {
      title: "Accurate answers sourced directly from your bylaws",
      layout: "rail",
      field: true,
      air: "tight",
      note: ["See documents and answers", "/product/documents-and-answers"],
      body: [
        { p: "The portal reads from the documents you uploaded, so an owner is never told something the board then has to walk back." },
        { coda: "Answers quote declaration sections directly so residents get clear, undisputed information." },
        { pull: "The best question is the one an owner answers without asking you." },
      ],
    },
    {
      title: "Secure address verification protects community privacy",
      layout: "quiet",
      body: [
        { p: "An owner finds their address and asks for access. It stays shut until someone on the board approves it." },
        { statutory: {
          label: "When payments are connected",
          lede: "Money goes from the owner to the association's own bank account. Common Parcel never holds it.",
        } },
      ],
    },
  ],
  faqs: [
    ["Do owners sign themselves up?",
      "An owner finds their address and asks for access. It stays shut until a board member approves it."],
    ["What can an owner see?",
      "Their own balance and what it is made of, their payments, the documents that govern the association, and the answer to a rule question with the section it came from. Nothing about a neighbor's account."],
    ["Can they pay from the portal?",
      "Once the association has connected a bank account, yes. The money goes to the association's own account, and Common Parcel never holds it."],
    ["What do owners send in?",
      "A maintenance request or an architectural application, with photos, attached to their own lot."],
  ],
};
