/**
 * PAGE CONTENT AS DATA.
 *
 * The feature pages, the comparisons and the posts all share one shape: a hero,
 * then bands. Writing eight near-identical .astro files would mean eight copies
 * of the same markup and eight chances for one of them to drift, so the shape
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
}

/* ── FEATURES ─────────────────────────────────────────────────────────── */

export { FEATURES } from "./features";


/* ── COMPARISONS ──────────────────────────────────────────────────────── */

export const COMPARISONS: PageSpec[] = [
  {
    slug: "payhoa",
    title: "Common Parcel vs PayHOA",
    description:
      "PayHOA collects dues well and is cheaper for a small association. Parcel does the governance work around the money, and reads your documents to do it.",
    eyebrow: "Compare",
    h1: "Common Parcel vs PayHOA",
    lede: "PayHOA is a good dues tool and the closest thing to a direct competitor for a self-managed board. If collecting dues online is the whole problem, PayHOA solves it.",
    bands: [
      {
        title: "The short version",
        body: [
          { p: "PayHOA is free for a small association and inexpensive above that. Parcel aims at the work around the money: the statutory deadlines, the ladder, the hearing, the meeting notice, the records request. And it does that from your own governing documents rather than from a screen you fill in." },
          { coda: "Want a payment portal, PayHOA is cheaper and simpler. Want the association to run, keep reading." },
        ],
      },
      {
        title: "Where they differ",
        field: true,
        body: [{ table: {
          caption: "Common Parcel against PayHOA",
          head: ["", "Common Parcel", "PayHOA"],
          body: [
            ["Reads your CC&Rs and bylaws", "Provisions come out with the page they sit on", "You configure the rules"],
            ["State statute", "Modeled rule by rule, with citations and stated gaps", "Not modeled"],
            ["Legislative change", "Watched, and you are told what moved", "No"],
            ["Collections", "Graduated ladder on your state's periods", "Reminders you schedule"],
            ["Hearings", "Cure windows, hearing periods, enforcement history", "Violation tracking"],
            ["Meetings", "Notice, agenda, quorum, motions, minutes", "Not a meeting system"],
            ["Elections", "Electronic ballots, proxies, live quorum", "Basic voting"],
            ["Vendors", "Renewal watch, automatic re-bidding, rate benchmarks", "Vendor records"],
            ["Records requests", "Statutory clock from the day it arrives", "No"],
            ["Insurance", "Policies read, renewals on the calendar", "No"],
            ["Budgets", "Draft, proposed, adopted, with the vote", "Basic budgeting"],
            ["Two officers for statutory acts", "Required", "Not a concept"],
            ["Free tier", "No", "Yes, for small associations"],
          ],
        } }],
      },
      {
        title: "Where PayHOA is the better choice",
        body: [
          { p: "Being straight about this, because a board that picks the wrong tool churns and tells its neighbors." },
          { rows: [
            "You have a handful of homes and only need payments. PayHOA's free tier is genuinely free and Parcel has a minimum.",
            "You want it running this afternoon. PayHOA asks less of your documents, so it starts faster.",
            "Your board does not want software near legal matters at all. Parcel's whole design is to prepare statutory work, and that machinery is overhead if a person is going to do all of it.",
          ] },
        ],
      },
      {
        title: "Where Parcel is the better choice",
        field: true,
        note: ["Self-management with Common Parcel", "/why-common-parcel"],
        body: [
          { rows: [
            "You worry about doing something void. Fines get voided for skipped hearings, notices for wrong periods.",
            "Nobody on the board knows what the documents say.",
            "Violations, elections or vendor contracts are real work for you, not just dues.",
            "You are replacing a management company, not a spreadsheet.",
          ] },
          { coda: "A PayHOA export of units, owners and balances imports. Format specific mapping is being built, so no promise on how long it takes yet." },
        ],
      },
    ],
  },
  {
    slug: "buildium",
    title: "Common Parcel vs Buildium",
    description:
      "Buildium has the more mature accounting and also does rentals. Parcel does one thing, which is why it can read your declaration and know your state's notice periods.",
    eyebrow: "Compare",
    h1: "Common Parcel vs Buildium",
    lede: "Buildium is a property management platform with the most mature accounting in the category, and HOAs are one of several things it serves. If you manage rentals as well as an association, Buildium is a serious answer.",
    bands: [
      {
        title: "The difference underneath",
        body: [
          { p: "Buildium was built for a professional operator managing property. Its model is units, leases, owners and a general ledger, and it assumes a competent administrator sitting in front of it." },
          { p: "Parcel was built for a few volunteers with day jobs and a legal obligation. Its model is lots, provisions, statutory clocks and signatures, and it assumes nobody using it has read the bylaws recently." },
          { coda: "Those assumptions produce different software all the way down. It is not a feature count." },
        ],
      },
      {
        title: "Where they differ",
        field: true,
        body: [{ table: {
          caption: "Common Parcel against Buildium",
          head: ["", "Common Parcel", "Buildium"],
          body: [
            ["Built for", "Self-managed community associations", "Property managers, HOA is one module"],
            ["Also does rentals", "No", "Yes"],
            ["Reads your CC&Rs and bylaws", "Yes, with the page", "Document storage"],
            ["State HOA statute", "Modeled rule by rule", "No"],
            ["Legislative change", "Watched", "No"],
            ["Accounting depth", "Ledgers, reconciliation, budgets, exports", "More mature, full ledger"],
            ["Collections on statutory periods", "Yes", "Configurable reminders"],
            ["Hearings", "Cure windows, hearing periods, enforcement history", "Violation tracking"],
            ["Meetings and minutes", "Yes", "Limited"],
            ["Vendor re-bidding with benchmarks", "Yes", "Vendor and work order records"],
            ["Two officers for statutory acts", "Required", "Not a concept"],
            ["Priced on", "Lots, graduated", "Seats, plus units"],
            ["Operated by", "A volunteer", "An administrator"],
          ],
        } }],
      },
      {
        title: "Where Buildium wins",
        body: [{ rows: [
          "You manage rental property too. Parcel has no lease product.",
          "You have a bookkeeper who wants a full general ledger and will use it.",
          "You are a management company with a portfolio. Parcel serves the board directly.",
        ] }],
      },
      {
        title: "Where Parcel wins",
        field: true,
        note: ["See the price", "/pricing"],
        body: [{ rows: [
          "No staff. If the treasurer is a volunteer, per seat pricing and an administrator shaped interface both work against you.",
          "The documents are the problem. Buildium will store your declaration. It will not tell you what it says.",
          "Statutory exposure is the fear. Hearings, notice periods, records clocks, lien prerequisites.",
        ] }],
      },
    ],
  },
  {
    slug: "townsq",
    title: "Common Parcel vs TownSq",
    description:
      "TownSq is built for participation. Parcel is built for governance and money. Which one fits depends on what goes wrong in your association.",
    eyebrow: "Compare",
    h1: "Common Parcel vs TownSq",
    lede: "TownSq is an engagement product. Its center is a community feed, resident communication, participation. Reviews consistently note it is strong on engagement and weaker on financial management.",
    bands: [
      {
        title: "The question that decides it",
        body: [
          { p: "Ask what goes wrong in your association when nobody does anything." },
          { p: "If the answer is that nothing happens, nobody participates and you cannot reach quorum, that is TownSq's problem to solve." },
          { coda: "If the answer is that a deadline gets missed, a fine gets challenged, the dues do not come in and nobody can find the rule, that is this one." },
        ],
      },
      {
        title: "Where they differ",
        field: true,
        body: [{ table: {
          caption: "Common Parcel against TownSq",
          head: ["", "Common Parcel", "TownSq"],
          body: [
            ["Community feed", "No", "Yes, the core of the product"],
            ["Reads your governing documents", "Yes, with the page", "Document storage"],
            ["State statute modeled", "Rule by rule", "No"],
            ["Legislative change", "Watched", "No"],
            ["Financial depth", "Ledgers, reconciliation, budgets, assessments", "Frequently cited as the weak area"],
            ["Collections on statutory periods", "Yes", "Basic"],
            ["Hearings and cure windows", "Yes, with enforcement history", "Violation tracking"],
            ["Meetings", "Notice, agenda, quorum, motions, minutes", "Meeting tools"],
            ["Vendor re-bidding", "Yes", "No"],
            ["Two officers for statutory acts", "Required", "Not a concept"],
            ["Typical buyer", "Self-managed board", "Association wanting participation"],
          ],
        } }],
      },
      {
        title: "Can you run both",
        note: ["See all product features", "/product"],
        body: [{ p: "Yes, and some associations should. They solve different problems and neither is a system of record for the other. If your board already pays for TownSq and likes it, the question is whether the governance and the money are handled, not whether to replace the feed." }],
      },
    ],
  },
  {
    slug: "management-company",
    title: "Common Parcel vs a management company",
    description:
      "What a management company provides, what it does not, and where software is the right or wrong answer for your board.",
    eyebrow: "Compare",
    h1: "Common Parcel vs hiring a management company",
    lede: "This is the real decision most boards are making. The other comparisons are between tools. This one is between software and a property manager.",
    bands: [
      {
        title: "What a manager costs",
        body: [
          { p: "Management companies charge a monthly base fee per lot, with additional charges for administrative tasks." },
          { p: "Setup, statutory mailings, estoppel letters, special assessment administration, collections and lien filing, after hours calls, meeting attendance beyond a set number, and records requests are commonly billed on top." },
          { coda: "Costs rise with payroll, and as portfolio workloads increase." },
        ],
      },
      {
        title: "What the money buys",
        field: true,
        body: [
          { p: "Real work. Following the late accounts, mailing the notices, tracking the deadlines, collecting bids, attending the meeting, taking the owner calls." },
          { p: "Most of it recurring, procedural, and driven by dates already written in your own documents." },
          { coda: "What it does not buy is memory. Managers change and portfolios get reassigned, and what your manager knew about your association walks out with them. Same problem volunteer turnover creates, from the other direction." },
        ],
      },
      {
        title: "Where a manager is the right answer",
        body: [
          { p: "Software does not attend your meeting. It does not walk the property after a storm. It does not take the angry call at night, and it will not stand between a board member and an owner who is shouting." },
          { coda: "If your board wants those things, hire a manager. This page is not for you." },
        ],
      },
      {
        title: "What software does instead",
        field: true,
        note: ["See the price", "/pricing"],
        body: [
          { p: "The month. Invoicing, deadlines, notices, bids, minutes, the record. That is procedural work driven by your own documents. It is also most of the hours and nearly all of the risk." },
          { p: "Parcel starts at $10 a month." },
        ],
      },
      {
        title: "If you are already leaving one",
        body: [
          { p: "Read your contract first for three things: the notice period, what termination costs, and what records they must return and by when. That last clause decides how painful the next month is." },
          { coda: "Ask for ledgers as data, not as a PDF. An export loads. Four hundred pages of the same ledger has to be typed." },
        ],
      },
    ],
  },
];
