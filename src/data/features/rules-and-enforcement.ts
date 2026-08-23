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
      title: "How one case runs",
      layout: "stack",
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
      ],
    },
    {
      title: "Where fines get overturned",
      layout: "rail",
      field: true,
      body: [
        { p: "The fine that gets challenged is the one for something the board let slide last year. Common Parcel shows every earlier case on that rule before the vote, so the board can enforce community rules fairly and consistently." },
      ],
    },
    {
      title: "When an owner asks to build",
      layout: "wide",
      air: "tight",
      body: [
        { p: "A request to paint the house or put up a fence arrives with the rule that governs it and any deadline your documents set. The committee decides." },
      
        { pull: "Every earlier case on that rule, in front of the board before the vote." },
      ],
    },
    {
      title: "The fine stays locked",
      layout: "quiet",
      field: true,
      note: ["Elections and meetings", "/product/meetings-and-voting"],
      body: [
        { statutory: {
          label: "No fine without the procedure",
          lede: "Where Common Parcel has confirmed that your documents or your state require notice and a hearing, the fine stays unavailable until both are recorded.",
          note: "Requests tied to disability or another protected right need a separate process and qualified legal review. That process is designed and not built yet.",
        } },
      ],
    },
  ],
};
