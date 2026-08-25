/**
 * rules-and-enforcement
 *
 * One page, one file. See src/data/content.ts for the shared shape and
 * src/data/features/index.ts for the order they appear in.
 *
 * The limit on this page is true and is stated directly: certified mail is not
 * connected, so service cannot be proved from here. Shortened, not softened.
 */
import type { PageSpec } from "../content";

export const rulesAndEnforcement: PageSpec = {
  slug: "rules-and-enforcement",
  title: "Rules and enforcement",
  description:
    "A violation timeline that follows your bylaws: cure periods counted from the notice, past cases on that rule shown before the vote, and a hold for disputes.",
  h1: "Rules and enforcement",
  lede: "Enforcing a rule without the record to back it up is how a fine gets overturned. Common Parcel dates every notice, tracks the cure period, and keeps the case together.",
  closer: "The same rule for every neighbor.",
  bands: [
    {
      title: "Documented violation timeline from notice to hearing",
      layout: "wide",
      air: "open",
      body: [
        { panel: {
          label: "Violation · Trailer parked in driveway",
          note: "Lot 18 · second notice",
          rows: [
            { label: "Rule", value: "Bylaws §4.2", cite: "Trailers & RVs" },
            { label: "Notice mailed", value: "March 3", cite: "14-day cure period" },
            { label: "Cure deadline", value: "March 17", cite: "In grace period", pending: true },
            { label: "Hearing requested", value: "March 10", cite: "Scheduled for March 24" },
          ],
          footing: { label: "Fine", value: "Not yet" },
        } },
        { p: "Common Parcel dates every notice, tracks cure periods, and schedules hearings automatically according to bylaw provisions." },
      ],
    },
    {
      title: "Eliminate selective enforcement with complete case history",
      layout: "rail",
      field: true,
      body: [
        { p: "The fine that gets challenged is the one for something the board let slide last year. Common Parcel displays prior precedents on each rule before the vote so enforcement remains consistent." },
        { rows: [
          "Historical precedent lookup on every rule.",
          "Uniform notice templates with exact bylaw citations.",
          "Complete photo and correspondence logs attached to each lot.",
        ] },
        { coda: "Every earlier case on that rule is available to the board before deciding a violation." },
      ],
    },
    {
      title: "Manage architectural reviews and committee approvals",
      layout: "rail",
      air: "tight",
      body: [
        { panel: {
          label: "Architectural Review (ARC)",
          note: "Lot 41 · Chen",
          rows: [
            { label: "Project type", value: "Roof & Solar installation" },
            { label: "Bylaw standard", value: "Guidelines §4.2", cite: "Compliant" },
            { label: "Committee sign-off", value: "Approved", cite: "ARC Chair & Member" },
          ],
          footing: { label: "Application Decision", value: "Permit Issued" },
        } },
        { p: "A request to paint the house or put up a fence arrives with the rule that governs it and any deadline your documents set. The committee decides." },
      ],
    },
    {
      title: "Strict procedural safeguards protect against disputed fines",
      layout: "quiet",
      field: true,
      note: ["Elections and meetings", "/product/meetings-and-voting"],
      body: [{ statutory: {
        label: "No fine without the procedure",
        lede: "Where Common Parcel has confirmed that your documents or your state require notice and a hearing, the fine stays unavailable until both are recorded.",
        note: "Requests tied to disability or another protected right use a separate process and still need qualified legal review.",
      } }],
    },
  ],
  faqs: [
    ["Can Common Parcel issue a fine?",
      "No. Where it has confirmed that your documents or your state require notice and a hearing, the fine stays unavailable until both are recorded. The vote is the board's."],
    ["How does it know which rule was broken?",
      "From the rules you uploaded. The case carries the rule it breaks and the page that rule sits on, so an owner reading the notice can check it."],
    ["What stops one neighbor being treated differently?",
      "Every earlier case on the same rule is in front of the board before the vote. The fine that gets challenged is the one for something the board let slide last year."],
    ["What about a request tied to a disability?",
      "It uses a separate process with its own record. The board still needs qualified legal review before deciding."],
  ],
};
