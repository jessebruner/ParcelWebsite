/**
 * rules-and-enforcement
 *
 * One page, one file. See src/data/content.ts for the shared shape and
 * src/data/features/index.ts for the order they appear in.
 */
import type { PageSpec } from "../content";

export const rulesAndEnforcement: PageSpec = {
  slug: "rules-and-enforcement",
  title: "Rules and enforcement",
  description:
    "Keep the rule, evidence, response window, hearing, and board decision together so enforcement stays consistent.",
  h1: "Rules and enforcement",
  lede: "Parcel keeps each enforcement step tied to the rule behind it. Where an applicable deadline or hearing rule has been verified, the workflow will not skip it.",
  closer: "The same rule for every neighbour.",
  bands: [
    {
      title: "Treat every case the same way",
      body: [
        { "panel": {
                          "label": "Lot 77 · fence height",
                          "note": "On schedule",
                          "rows": [
                                    {
                                              "label": "Notice sent",
                                              "value": "2 March",
                                              "cite": "Art. VII §3, p. 14"
                                    },
                                    {
                                              "label": "Cure window",
                                              "value": "closes 16 March",
                                              "pending": true
                                    },
                                    {
                                              "label": "Re-inspection",
                                              "value": "17 March"
                                    },
                                    {
                                              "label": "Enforced before",
                                              "value": "3 times in 4 years",
                                              "cite": "11 open instances"
                                    }
                          ],
                          "footing": {
                                    "label": "Fine available",
                                    "value": "Not yet"
                          }
                } },
        { rows: [
          "Report, from a board member, a neighbor, or an owner through the portal.",
          "Verify, with a photo, a date, and the rule it breaks, quoted from your declaration.",
          "Courtesy notice, where your documents call for one.",
          "Formal notice, citing the specific rule.",
          "Cure window, on a real clock.",
          "Re-inspection when the window closes.",
          "Notice of hearing, using a verified period where one applies.",
          "Hearing, with the outcome recorded.",
          "Fine, at the amount your documents allow and within any verified cap that applies.",
          "Appeal, where your documents provide one.",
        ] },
        { coda: "Every step is dated in the record, so the board can explain what happened and why." },
      ],
    },
    {
      title: "How often has this rule been enforced?",
      field: true,
      body: [
        { p: "Before a fine is levied, Parcel looks at how the association has treated that rule before and says what it finds. How many times it has been enforced. How many open instances are sitting there right now." },
        { coda: "A board that treats similar cases differently will struggle to explain the decision. The history makes that pattern visible before the vote." },
      ],
    },
    {
      title: "Give committees the rule and the deadline",
      body: [{ p: "A request arrives, gets checked against your own rules with the provisions quoted, and shows a verified response deadline where one applies. The committee decides. Parcel never does." }],
    },
    {
      title: "Keep the board responsible for every fine",
      field: true,
      note: ["See meetings and voting", "/product/meetings-and-voting"],
      body: [{ statutory: {
        label: "No fine without the procedure",
        lede: "Where a verified rule requires notice and a hearing, the workflow keeps the fine unavailable until both are recorded.",
        note: "Requests tied to disability or another protected right need a separate process and qualified legal review. That process is designed and not built yet.",
      } }],
    },
  ],
};
