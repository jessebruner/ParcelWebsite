/**
 * resident-portal
 *
 * One page, one file. See src/data/content.ts for the shared shape and
 * src/data/features/index.ts for the order they appear in.
 *
 * The portal does NOT say "owners pay online here". That capability belongs
 * to dues-and-payments when Stripe is connected, and saying it here would
 * double-count the feature and hide the condition.
 */
import type { PageSpec } from "../content";

export const residentPortal: PageSpec = {
  slug: "resident-portal",
  title: "Resident portal",
  description:
    "A portal where an owner checks their balance, reads the documents, and submits a request, without calling the board.",
  h1: "Resident portal",
  lede: "Give residents self-service access to account statements, community documents, and architectural requests without calling board members at home.",
  closer: "Your phone stops ringing.",
  bands: [
    {
      title: "Self-service resident portal cuts board inquiries",
      layout: "wide",
      body: [
        { panel: {
          label: "Portal · what an owner sees",
          note: "Lot 41 · Chen",
          rows: [
            { label: "Account balance", value: "$0.00", cite: "Current" },
            { label: "Annual meeting ballots", value: "Available", cite: "Voting open" },
            { label: "Governing documents", value: "3 files", cite: "Declaration, Bylaws, Rules" },
            { label: "Architectural request", value: "Submitted", cite: "Under review", pending: true },
          ],
          footing: { label: "Resident Access", value: "Verified Owner" },
        } },
        { p: "An owner logs in and sees their account standing, governing documents, meeting notices, and architectural submissions in one place." },
      ],
    },
    {
      title: "Accurate answers sourced directly from your bylaws",
      layout: "rail",
      field: true,
      air: "tight",
      note: ["See documents and answers", "/product/documents-and-answers"],
      body: [
        { p: "The portal reads directly from uploaded association documents, giving residents immediate answers without requiring board intervention." },
        { coda: "Answers quote declaration sections directly so residents get clear, undisputed information." },
      ],
    },
    {
      title: "Secure address verification protects community privacy",
      layout: "quiet",
      body: [
        { p: "An owner finds their address and asks for access. It stays shut until someone on the board approves it." },
        { coda: "Only deeded owners and approved residents receive login credentials." },
      ],
    },
  ],
  faqs: [
    ["How do owners get access?",
      "An owner finds their address and asks for access. It stays shut until someone on the board approves it."],
    ["Can tenants use the portal?",
      "Only if the board allows it for that association. By default, access is for owners on record."],
    ["Can owners pay here?",
      "If the association has connected its own Stripe account, yes. Invoicing and balance checks do not wait for that."],
    ["What can an owner see?",
      "Their own ledger, their own requests, the association's documents, and whatever notices have been published to everyone. They cannot see another owner's account."],
  ],
};
