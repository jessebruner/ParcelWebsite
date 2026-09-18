/**
 * PAGE CONTENT AS DATA.
 *
 * The feature pages share one shape: an introduction,
 * then sections. Writing nine near-identical .astro files would mean nine copies
 * of the same markup and nine chances for one of them to drift, so the shape
 * lives in a template and the words live here.
 *
 * Bold lead-ins in a row are written **like this** and rendered as <b>.
 */

export type Content =
  | { p: string }
  /**
   * The page's one loud sentence. Every page carries exactly one, in a
   * different band, and it is the page's own argument rather than a quote from
   * a document nobody has -- an invented excerpt attributed to "Declaration,
   * Article IX" would be a fabricated citation on a marketing site.
   */
  | { pull: string }
  | { lede: string }
  | { coda: string }
  | { rows: string[] }
  | { table: { caption?: string; head: string[]; body: string[][] } }
  | { statutory: { label: string; lede: string; note?: string } }
  | { panel: {
        label: string;
        note?: string;
        caption?: string;
        rows: { label: string; value?: string; cite?: string; meter?: number; chip?: string; pending?: boolean }[];
        footing?: { label: string; value: string };
      } };

export interface BandSpec {
  title: string;
  field?: boolean;
  /**
   * The composition. See Band.astro. Nine pages running the identical
   * two-track band five times each was the objection; a page picks its own
   * sequence. Omitted means "rail", which is what every band used to be.
   */
  layout?: "rail" | "stack" | "wide" | "quiet";
  /** Breaks the run of equal-height sections. See tokens.css. */
  air?: "tight" | "open";
  /** [label, href] for the onward link under the section name. */
  note?: [string, string];
  body: Content[];
}

export interface PageSpec {
  slug: string;
  title: string;
  description: string;
  /** The page's own name. Nothing renders a label above it. */
  h1: string;
  lede: string;
  /** The line the closing band carries. Written per page, never generated. */
  closer?: string;
  bands: BandSpec[];
  /**
   * [question, answer], three or four per page. See Faq.astro.
   *
   * The constraint that matters is not length. An answer here may not claim
   * more than the bands above it already claim -- an FAQ is the one place on a
   * marketing site where a careful page quietly widens itself, because nobody
   * reads it as body copy. Every answer below was written against its own
   * page's bands and carries the same conditions they carry.
   */
  faqs?: [string, string][];
}

/* ── FEATURES ─────────────────────────────────────────────────────────── */

export { FEATURES } from "./features";
