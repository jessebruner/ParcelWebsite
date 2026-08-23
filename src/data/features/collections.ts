/**
 * collections
 *
 * One page, one file. See src/data/content.ts for the shared shape and
 * src/data/features/index.ts for the order they appear in.
 */
import type { PageSpec } from "../content";

export const collections: PageSpec = {
  slug: "collections",
  title: "Collections",
  description:
    "A board-controlled delinquency plan that uses verified notice periods where available, pauses on command, and records every approval.",
  h1: "Collections",
  lede: "Parcel prepares each collection step from your documents and any verified rules that apply. The board can review, send, pause, or stop the plan.",
  closer: "The hard letter, already written.",
  bands: [
    {
      title: "Control every collection step",
      body: [
        { "panel": {
                          "label": "Lot 63 · unpaid since 1 March",
                          "note": "Held",
                          "rows": [
                                    {
                                              "label": "Friendly reminder",
                                              "value": "Day 1",
                                              "cite": "Sent"
                                    },
                                    {
                                              "label": "Formal late notice",
                                              "value": "Day 30",
                                              "cite": "Sent"
                                    },
                                    {
                                              "label": "Demand and lien warning",
                                              "value": "Day 60",
                                              "cite": "Awaiting two signatures",
                                              "pending": true
                                    },
                                    {
                                              "label": "Accrual",
                                              "value": "Frozen",
                                              "cite": "Hardship recorded by the board"
                                    }
                          ],
                          "footing": {
                                    "label": "Balance",
                                    "value": "$570"
                          }
                } },
        { rows: [
          "**Reminder.** A friendly note, on the day your grace period ends.",
          "**Formal notice.** The late notice your documents and verified state rules require.",
          "**Demand.** The letter before a lien, with the amount broken out.",
          "**Lien warning.** Prepared, cited, and waiting for signature.",
        ] },
        { coda: "Where Common Parcel has verified an applicable rule, the timing points back to that source and to your own documents." },
      ],
    },
    {
      title: "Pause collection when life happens",
      field: true,
      body: [{ p: "When a board places an account on hold for a hardship, a dispute, or a death in the family, scheduled collection actions stop until the board releases the hold." }],
    },
    {
      title: "Your board controls every collection action",
      body: [
        { p: "Nothing with legal consequences goes out on its own. Where the workflow enforces a two-officer gate, the action waits for both approvals and records who approved it, when, and on what basis." },
        { p: "Where Common Parcel has a verified rule for your state, the ladder reflects that procedure. If your state's collection procedure has not been verified yet, the ladder does not advance and the interface says which provision is missing." },
      ],
    },
    {
      title: "Certified mail is not connected yet",
      field: true,
      note: ["See rules and enforcement", "/product/rules-and-enforcement"],
      body: [{ statutory: {
        label: "Proof of mailing",
        lede: "Certified mail is not connected. Parcel can show that a notice was drafted and approved. It cannot yet show that it was served.",
        note: "Until that connection ships, the board remains responsible for service and for recording proof outside Common Parcel.",
      } }],
    },
  ],
};
