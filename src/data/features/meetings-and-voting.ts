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
      title: "Track quorum in real time with verifiable tallies",
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
        { p: "Common Parcel works notice dates back from the scheduled meeting so required owner mailings land strictly within bylaw requirements." },
      ],
    },
    {
      title: "Count every ballot with verified eligibility",
      layout: "rail",
      field: true,
      body: [
        { panel: {
          label: "Ballot & Proxy Roster",
          note: "March 12 Annual Meeting",
          rows: [
            { label: "Digital ballot · Lot 14", value: "Verified", cite: "Owner of record" },
            { label: "Proxy assignment · Lot 22", value: "Assigned", cite: "Board chair" },
            { label: "Mailed ballot · Lot 35", value: "Logged", cite: "Received March 10" },
            { label: "Duplicate submission · Lot 41", value: "Flagged", cite: "First ballot held", pending: true },
          ],
          footing: { label: "Verified Ballots", value: "73 of 118" },
        } },
        { p: "Where your documents allow electronic ballots or proxies, Common Parcel counts them beside paper ballots and verifies every voter against deeded ownership records." },
        { rows: [
          "Cross-checks every ballot against deeded owner records.",
          "Combines electronic votes, assigned proxies, and mailed paper tallies.",
          "Prevents duplicate voting and logs submission timestamps.",
        ] },
        { coda: "Proving quorum is backed by a verifiable tally rather than relying on memory." },
      ],
    },
    {
      title: "Keep committee workflows focused and confidential",
      layout: "quiet",
      air: "tight",
      body: [
        { p: "Architectural review, landscaping, whatever your bylaws create. Each committee opens to its own requests and sees nothing else." },
      ],
    },
    {
      title: "Safeguard board decisions with multi-officer approval",
      layout: "rail",
      field: true,
      note: ["Records and audit", "/product/records-and-audit"],
      body: [
        { p: "Where Common Parcel requires a second officer to approve, both approvals go into the record with the time and the reason." },
        { coda: "A single officer can pause an action, but pushing a consequential notice or fine through requires verified sign-off." },
      ],
    },
  ],
  faqs: [
    ["How much notice does our meeting need?",
      "Whatever period your bylaws set. Common Parcel works the notice date back from the meeting date so the mailing lands inside it."],
    ["Can owners vote electronically?",
      "Where your documents allow electronic ballots or proxies, Common Parcel counts them beside the paper ones."],
    ["How is quorum counted?",
      "Every voter is checked against the list of owners on record, so the number that goes into the minutes is one you can show later."],
    ["Who writes the minutes?",
      "Common Parcel drafts them from the meeting and the board adopts the draft. A volunteer is editing rather than starting from nothing."],
  ],
};
