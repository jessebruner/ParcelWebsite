/**
 * records-and-audit
 *
 * One page, one file. See src/data/content.ts for the shared shape and
 * src/data/features/index.ts for the order they appear in.
 *
 * This was the thinnest page on the site: two bands, no onward link, and a
 * band whose paragraph repeated its own heading word for word. It now argues
 * the two things that actually make an association keep records: an owner can
 * demand them, and the board that has them will not be here next year.
 */
import type { PageSpec } from "../content";

export const recordsAndAudit: PageSpec = {
  slug: "records-and-audit",
  title: "Records and audit",
  description:
    "Minutes, resolutions, notices, and ledgers kept in one place, with a name and a time on every change.",
  h1: "Records and audit",
  lede: "Officers change every year or two and what they knew leaves with them. Common Parcel keeps minutes, resolutions, notices, and ledgers where the next board will find them.",
  closer: "Nothing leaves with the treasurer.",
  bands: [
    {
      title: "The file the next board opens",
      air: "open",
      body: [
        { panel: {
          label: "Association record",
          note: "2026",
          rows: [
            { label: "Annual meeting minutes", chip: "Signed" },
            { label: "Board resolution", chip: "Passed" },
            { label: "Violation notice", chip: "Delivered" },
            { label: "Landscaping invoice", chip: "Paid" },
          ],
          footing: { label: "Export", value: "Included" },
        } },
      ],
    },
    {
      title: "Changes carry a name",
      field: true,
      body: [
        { p: "An edit to a rule or a record carries the name of whoever made it and the time." },
      ],
    },
    {
      title: "An owner asks for the books",
      air: "tight",
      note: ["Michigan records requests", "/blog/michigan-hoa-records-request"],
      body: [
        { p: "A Michigan owner with a proper purpose can demand the books, and five business days later can ask a court to compel it. The records are already in one place." },
      ],
    },
    {
      title: "When the treasurer resigns",
      field: true,
      body: [
        { p: "The officer who knew where everything was is gone. The next one opens association records that outlast any board." },
      ],
    },
  ],
};
