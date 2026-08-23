/**
 * resident-portal
 *
 * One page, one file. See src/data/content.ts for the shared shape and
 * src/data/features/index.ts for the order they appear in.
 */
import type { PageSpec } from "../content";

export const residentPortal: PageSpec = {
  slug: "resident-portal",
  title: "Resident portal",
  description:
    "Owners look up a balance, pay, read the rules that apply to them, submit a request and vote. Every question they answer alone is one the board never gets.",
  h1: "Resident portal",
  lede: "Owners should not need training to check a balance, find a document, or submit a request. The portal gives them one clear place to start and takes routine questions off the board.",
  closer: "Your phone stops ringing.",
  bands: [
    {
      title: "Give owners one place to start",
      body: [
        { "panel": {
                          "label": "Portal · what an owner sees",
                          "note": "Self-service",
                          "rows": [
                                    {
                                              "label": "Balance",
                                              "value": "$285"
                                    },
                                    {
                                              "label": "Last payment",
                                              "value": "$285",
                                              "cite": "1 March"
                                    },
                                    {
                                              "label": "Can I put a shed on my lot?",
                                              "value": "Answered",
                                              "cite": "Art. IX §2, p. 21"
                                    },
                                    {
                                              "label": "Architectural request",
                                              "value": "Submitted",
                                              "pending": true
                                    }
                          ],
                          "footing": {
                                    "label": "Board follow-up",
                                    "value": "Only when needed"
                          }
                } },{ rows: [
        "See what they owe, and what it is made of.",
        "Pay online when payments are connected.",
        "Download a statement or a receipt.",
        "Look up the rule that applies to them, with the section it comes from.",
        "Submit a request or an architectural application, with photos.",
        "Vote, where your state permits it.",
      ] }],
    },
    {
      title: "Get routine questions out of your inbox",
      field: true,
      body: [
        { p: "The phone call that does not happen. The email that does not need answering. The violation that does not start because the owner read the rule first." },
        { coda: "An owner who can answer their own question does not become an item on your agenda." },
      ],
    },
    {
      title: "Let the board control portal access",
      note: ["See documents and answers", "/product/documents-and-answers"],
      body: [
        { p: "An owner finds their address and claims it. The board confirms." },
        { p: "Membership comes from a board decision, never from signing up. A duplicate claim is accepted and left for the board, because a spouse, a tenant and an heir can all be legitimate at one address." },
        { statutory: {
          label: "When connected",
          lede: "Online payments route directly to the association's bank.",
          note: "Balances, statements, requests, rules, and eligible votes stay in the portal.",
        } },
      ],
    },
  ],
};
