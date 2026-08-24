/**
 * collections
 *
 * One page, one file. See src/data/content.ts for the shared shape and
 * src/data/features/index.ts for the order they appear in.
 *
 * Two limits on this page are true and are stated rather than dressed:
 * certified mail is not connected, so service cannot be proved from here; and
 * a state rule that has not been verified stops the plan rather than letting
 * it guess. Both were shortened. Neither was softened.
 */
import type { PageSpec } from "../content";

export const collections: PageSpec = {
  slug: "collections",
  title: "Collections",
  description:
    "A delinquency plan the board controls: every notice drafted from your documents, paused on command, and held until the right people sign.",
  h1: "Collections",
  lede: "When an owner stops paying, Common Parcel drafts the next notice from your documents and holds it. Nothing goes out until the board sends it.",
  closer: "The hard letter, already written.",
  bands: [
    {
      title: "What happens when someone stops paying",
      layout: "stack",
      body: [
        { panel: {
            label: "Lot 63 · unpaid since March 1",
            rows: [
              { label: "Reminder", value: "Day 1", cite: "Sent" },
              { label: "Late notice", value: "Day 30", cite: "Sent" },
              { label: "Demand before a lien", value: "Day 60", cite: "Waiting on two signatures", pending: true },
              { label: "Late fees", value: "Stopped", cite: "Board hold, March 12" },
            ],
            footing: { label: "Balance", value: "$570" },
        } },
        { coda: "Dates come from your documents and, where Common Parcel has verified your state's rule, from that rule. Where a state rule is not verified yet, the plan stops and names what is missing." },
      ],
    },
    {
      title: "No letter leaves without the board",
      layout: "rail",
      field: true,
      body: [
        { p: "Where the workflow requires two officers, a notice waits for both approvals, and the record keeps who approved it and when." },
        /* A coda, not a second <p>: tokens.css line 224 zeroes the margin on
           every <p> in a band body, so two paragraphs in a row render with no
           gap between them. Reported, not fixed here. */
        { coda: "The board can put an account on hold for a hardship, a dispute, or a death in the family. Everything scheduled stops until the board lifts it." },
      
        { pull: "The hard letter is written before you need it, and it does not leave until you send it." },
      ],
    },
    {
      title: "Certified mail is not connected yet",
      layout: "quiet",
      air: "tight",
      note: ["See violations and notices", "/product/rules-and-enforcement"],
      body: [{ statutory: {
        label: "Proof of mailing",
        lede: "Common Parcel can show that a notice was drafted and approved. It cannot yet show that it was served.",
        note: "Until certified mail is connected, serving the notice and keeping the proof stay with the board.",
      } }],
    },
  ],
  faqs: [
    ["Can Common Parcel send a demand letter on its own?",
      "No. It drafts the next notice from your documents and holds it. Where the workflow requires a second officer, the notice waits for both approvals, and the record keeps who approved it and when."],
    ["What if an owner is on a payment plan?",
      "Put the account on hold and everything scheduled stops until the board lifts it. A hardship, a dispute and a death in the family are the same switch."],
    ["Where do the dates come from?",
      "Your own documents, and your state's rule where Common Parcel has verified it. Where a state rule is not verified yet, the plan stops and names what is missing rather than picking a number."],
    ["Can you prove we served the notice?",
      "Not yet. Common Parcel can show that a notice was drafted and approved, but certified mail is not connected, so serving it and keeping the proof stay with the board."],
  ],
};
