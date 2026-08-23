/**
 * meetings-and-voting
 *
 * One page, one file. See src/data/content.ts for the shared shape and
 * src/data/features/index.ts for the order they appear in.
 */
import type { PageSpec } from "../content";

export const meetingsAndVoting: PageSpec = {
  slug: "meetings-and-voting",
  title: "Meetings and voting",
  description:
    "Plan notice dates, build the agenda, track attendance, certify quorum against the current roster, and draft minutes from the meeting record.",
  h1: "Meetings and voting",
  lede: "Meetings turn open questions into recorded board decisions. Parcel keeps the notice, agenda, attendance, vote, and minutes in one workflow.",
  closer: "Every vote, already in the record.",
  bands: [
    {
      title: "Run the meeting from one record",
      body: [
        { "panel": {
                          "label": "Annual meeting · 14 November",
                          "note": "Live tally",
                          "rows": [
                                    {
                                              "label": "Notice sent",
                                              "value": "21 days prior",
                                              "cite": "Bylaws Art. IV §2, p. 9"
                                    },
                                    {
                                              "label": "Quorum",
                                              "meter": 0.62
                                    },
                                    {
                                              "label": "Ballots in",
                                              "value": "73 of 118"
                                    },
                                    {
                                              "label": "Minutes",
                                              "value": "Drafting",
                                              "pending": true
                                    }
                          ],
                          "footing": {
                                    "label": "Quorum threshold",
                                    "value": "Met"
                          }
                } },
        { rows: [
          "**Notice** uses the period in your bylaws and any verified rule that applies, counted back from the meeting date.",
          "**The agenda** brings together the motions, approvals, and deadlines the board still needs to handle.",
          "**Quorum** is calculated against the current roster and certified by an officer.",
          "**Motions** carry into votes and the votes carry into the record.",
          "**Minutes** can be drafted from the meeting record. The board reviews and adopts them.",
        ] },
        { coda: "Add your existing meeting link, then publish a calendar feed your board can subscribe to." },
      ],
    },
    {
      title: "Count votes against the current roster",
      field: true,
      body: [{ p: "Where electronic ballots or proxies are permitted, Parcel keeps them with paper ballots and checks eligibility against the current roster. Every tally carries the records behind the number." }],
    },
    {
      title: "Give each committee only its work",
      body: [{ p: "Architectural review, landscaping, whatever your bylaws create. Each committee gets the queue it is responsible for and nothing else." }],
    },
    {
      title: "Keep approvals with the decision",
      field: true,
      note: ["See documents and answers", "/product/documents-and-answers"],
      body: [{ p: "Where Common Parcel enforces a two-officer gate, both approvals go into the record with the time and the reason." }],
    },
  ],
};
