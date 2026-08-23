/**
 * meetings-and-voting
 *
 * One page, one file. See src/data/content.ts for the shared shape and
 * src/data/features/index.ts for the order they appear in.
 *
 * The band that used to be called "Keep approvals with the decision" is now
 * "Nobody acts alone", because the old name was an abstract noun and its own
 * paragraph then said it again. "Motions carry into votes and the votes carry
 * into the record" is gone; it was a circle.
 */
import type { PageSpec } from "../content";

export const meetingsAndVoting: PageSpec = {
  slug: "meetings-and-voting",
  title: "Meetings and voting",
  description:
    "Notice dates counted back from the meeting, ballots checked against the list of owners on record, and minutes drafted from the meeting itself.",
  h1: "Meetings and voting",
  lede: "A vote taken without proper notice can be challenged. Common Parcel works the notice date back from the meeting date, on the period your bylaws set.",
  closer: "A meeting that holds up.",
  bands: [
    {
      title: "Quorum you can prove",
      layout: "wide",
      air: "open",
      body: [
        { panel: {
          label: "Annual meeting",
          note: "March 12",
          rows: [
            { label: "Notice mailed", value: "February 19", cite: "Bylaws, page 9" },
            { label: "Ballots returned", value: "73 of 118" },
            { label: "Owners present", meter: 0.62 },
            { label: "Minutes", value: "Draft ready", pending: true },
          ],
          footing: { label: "Quorum", value: "Met" },
        } },
      ],
    },
    {
      title: "Ballots that hold up",
      layout: "stack",
      field: true,
      body: [
        { p: "Where your documents allow electronic ballots or proxies, Common Parcel counts them beside the paper ones and checks every voter against the list of owners on record." },
      
        { pull: "Proving quorum should not depend on who remembered to count." },
      ],
    },
    {
      title: "Committees see their own work",
      layout: "quiet",
      air: "tight",
      body: [
        { p: "Architectural review, landscaping, whatever your bylaws create. Each committee opens to its own requests and sees nothing else." },
      ],
    },
    {
      title: "Nobody acts alone",
      layout: "rail",
      field: true,
      note: ["Records and audit", "/product/records-and-audit"],
      body: [
        { p: "Where Common Parcel requires a second officer to approve, both approvals go into the record with the time and the reason." },
      ],
    },
  ],
};
