/**
 * rules-and-enforcement
 *
 * One page, one file. See src/data/content.ts for the shared shape and
 * src/data/features/index.ts for the order they appear in.
 *
 * The slug stays `rules-and-enforcement` because the URL is linked from
 * routes.ts, product.astro and the sitemap. The page's NAME is "Violations and
 * notices", which is what the nav has always called it, and the heading is the
 * name. The old headline, "Enforce community rules fairly and consistently",
 * moved into the second band, where it argues for something.
 *
 * The ten-step ladder that used to sit here is now the hero scene. A sequence
 * is a picture, not a list.
 */
import type { PageSpec } from "../content";

export const rulesAndEnforcement: PageSpec = {
  slug: "rules-and-enforcement",
  title: "Violations and notices",
  description:
    "Log a violation against the rule it breaks, and keep the notice, the time to fix it, and the hearing on one clock.",
  h1: "Violations and notices",
  lede: "A complaint comes in. Common Parcel finds the rule it breaks, dates the notice, and runs the clock to the hearing.",
  closer: "The same rule for every neighbor.",
  bands: [
    {
      title: "Documented violation timeline from notice to hearing",
      layout: "wide",
      air: "open",
      body: [
        { panel: {
          label: "Violation case",
          note: "Open",
          rows: [
            { label: "Rule it breaks", value: "Fence height", cite: "Declaration, page 14" },
            { label: "Notice mailed", value: "March 2" },
            { label: "Owner has until", value: "March 16", pending: true },
            { label: "Hearing set", value: "March 24" },
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
        { p: "The fine that gets challenged is the one for something the board let slide last year. Common Parcel shows every earlier case on that rule before the vote, so the board can enforce community rules fairly and consistently." },
        { rows: [
          "Historical precedent lookup on every rule.",
          "Uniform notice templates with exact bylaw citations.",
          "Complete photo and correspondence logs attached to each lot.",
        ] },
        { pull: "Every earlier case on that rule, in front of the board before the vote." },
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
      body: [
        { statutory: {
          label: "No fine without the procedure",
          lede: "Where Common Parcel has confirmed that your documents or your state require notice and a hearing, the fine stays unavailable until both are recorded.",
          note: "Requests tied to disability or another protected right use a separate process and still need qualified legal review.",
        } },
      ],
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
