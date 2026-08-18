import type { BandSpec } from "./content";

/**
 * The posts.
 *
 * Every one is signed, dated, and carries a separate "checked" date, because
 * statutory content goes stale and freshness is weighted heavily by both search
 * and the answer engines. The takeaway in each is ungated: on a domain with no
 * brand yet, an email wall trades most of the traffic for a handful of addresses.
 */

export interface PostSpec {
  slug: string;
  title: string;
  /** Shown on the index. Shorter than the title. */
  short: string;
  description: string;
  topic: "Compliance" | "Money" | "Enforcement" | "Governance" | "Getting started";
  published: string;
  checked: string;
  h1: string;
  lede: string;
  bands: BandSpec[];
  /** The one page this post should send a reader to. */
  cta: { label: string; href: string };
  /** Sits under the last band, above the footer note. */
  productNote: string;
  footnote: string;
}

export const POSTS: PostSpec[] = [
  {
    slug: "hoa-records-request-deadline",
    title: "The records request clock, and what missing it costs",
    short: "The records request clock",
    description:
      "Florida gives an association ten business days. Miss it and the statute provides $50 a day. The clock, the exemptions, and the fee rule most summaries get wrong.",
    topic: "Compliance",
    published: "2026-08-18",
    checked: "2026-08-18",
    h1: "The records request clock, and what missing it costs",
    lede: "An owner emails asking for the association's records. Usually an owner who is already unhappy. That email starts a clock, and in several states missing it has a price per day.",
    bands: [
      {
        title: "Florida, as the example",
        body: [
          { p: "A written request starts a **ten business day** window. Miss it and the statute provides **$50 a day**, counted in calendar days, beginning on the **eleventh business day**, capped at ten days." },
          { coda: "Other states differ. Texas is ten business days with one written extension. California is ten days for current year records and thirty for older ones. Your state sets its own." },
        ],
      },
      {
        title: "The part most summaries get wrong",
        field: true,
        body: [
          { p: "Law firm blogs and industry explainers routinely add \"plus prevailing party attorney's fees\" to the Florida records rule." },
          { p: "The records section does not say that." },
          { p: "There is a general prevailing party provision elsewhere in chapter 720. It is a different section and a different rule, and importing it into the records provision asserts something the records provision does not contain." },
          { coda: "We mention it because this is exactly the kind of error that spreads. It sounds right, it is repeated everywhere, and a board planning around it is planning around a rule that is not there. If your association is in a records dispute, read the statute and ask your attorney. Not a blog, including this one." },
        ],
      },
      {
        title: "What to do the day it arrives",
        body: [{ rows: [
          "**Date it.** The clock runs from receipt, and receipt is the fact you will have to prove.",
          "**Check whether your state requires it in writing.** Several do. An oral request may not start anything.",
          "**Scope it.** Which records, what period. A vague request is not a request for everything.",
          "**Work out what is exempt before you produce.** Other owners' personal information, privileged legal advice, personnel records and medical records are commonly exempt, and handing them over is its own problem.",
          "**Log what you sent and when.** The log is the defence.",
        ] }],
      },
      {
        title: "Florida's exempt categories",
        field: true,
        body: [{ rows: [
          "Attorney client privileged material.",
          "Transfer approval information.",
          "Gated community guest records.",
          "Personnel records.",
          "Medical records.",
          "Personal identifying information.",
          "Electronic security measures.",
          "Software and operating systems.",
        ] }],
      },
      {
        title: "The two ways boards lose this",
        body: [
          { p: "Counting calendar days where the statute says business days, or the reverse. In a ten day window that is the difference between compliant and paying." },
          { coda: "And not dating the request, so there is no way to show when the clock started." },
        ],
      },
    ],
    productNote:
      "Parcel starts the clock the day the request arrives, runs your state's window, searches the records it already holds, and logs what went out.",
    cta: { label: "How compliance works", href: "/compliance" },
    footnote: "Not legal advice. Statutory periods and damages vary by state.",
  },

  {
    slug: "hoa-developer-turnover",
    title: "Your developer handed over the association. A clock you cannot see is already running.",
    short: "Your developer handed over the association",
    description:
      "A construction defect claim runs from substantial completion, not from turnover. Those dates are years apart, and boards lose the claim without knowing they had one.",
    topic: "Getting started",
    published: "2026-08-18",
    checked: "2026-08-18",
    h1: "A clock you cannot see is already running",
    lede: "Control has transferred, or is about to. You are a few neighbors with a legal obligation, a box of documents, and no way to tell whether it is complete.",
    bands: [
      {
        title: "The date that matters most",
        body: [
          { p: "**A construction defect claim runs from substantial completion. Not from turnover.**" },
          { p: "Those two dates are routinely years apart. A community finished in March 2023 and turned over in November 2026 has already spent most of its claim window before the owners' board existed. Statutes of repose in this area commonly run six to ten years from completion, and they vary by state." },
          { coda: "A board that assumes the clock started at handover does the arithmetic wrong, and by the time an engineer finds the problem the window can be shut." },
        ],
      },
      {
        title: "So find two facts first",
        field: true,
        body: [
          { rows: [
            "The date of substantial completion, in writing.",
            "Your state's statute of repose for construction defect claims.",
          ] },
          { coda: "If you cannot establish the completion date, go and get it before anything else on this page." },
        ],
      },
      {
        title: "What the developer owes you",
        body: [
          { p: "The exact list varies by state. This is the common set. Count what you got." },
          { rows: [
            "Governing documents as recorded.",
            "Plat and as builts.",
            "Financial records, bank statements and tax returns.",
            "An audit of the developer control period.",
            "The reserve study.",
            "Insurance policies and claims history.",
            "Vendor contracts and warranties.",
            "Permits and certificates of occupancy.",
            "Developer period board minutes.",
            "The membership roster.",
            "Litigation disclosure.",
            "Keys, fobs and access codes.",
            "Equipment manuals.",
            "Architectural approvals already granted.",
            "The unsold lot schedule.",
            "Any developer loans or advances claimed against the association.",
          ] },
        ],
      },
      {
        title: "Three things to commission yourself",
        field: true,
        body: [
          { p: "The developer does not owe these. Boards that skip them regret it." },
          { rows: [
            "**An independent reserve study.** At turnover, reserves are typically 40 to 60 per cent underfunded against actual need. The developer's balance is not a study.",
            "**A transition engineer's inspection.** These routinely find six figures of deferred repair.",
            "**An audit of the developer control period**, if one was not delivered.",
          ] },
        ],
      },
      {
        title: "The reserve number you will be given",
        body: [
          { p: "Developers fund reserves to a budget, not to a study. The gap is the first special assessment the new board has to explain to its neighbors, and it is better found in month one than in year three." },
          { coda: "If you have the developer's balance and a study's recommendation, the comparison is the whole story. With only one of the two, you do not have a number yet. You have half of one." },
        ],
      },
      {
        title: "Do it in this order",
        field: true,
        body: [{ rows: [
          "Establish the completion date and your state's repose period.",
          "Inventory what you received against the categories above.",
          "Demand the gaps in writing, with a date.",
          "Commission the reserve study and the engineer's inspection.",
          "Request the audit if you did not get one.",
          "Get the roster into a form you can notice a meeting from.",
          "Then worry about software.",
        ] }],
      },
    ],
    productNote:
      "A new board has nothing to migrate, which makes this the cheapest moment to start properly. Upload what the developer gave you and Parcel reads the declaration, pulls out the provisions that govern everything else, and puts your deadlines on the calendar.",
    cta: { label: "See use cases", href: "/use-cases" },
    footnote: "Turnover triggers, record categories and repose periods are all state specific. Not legal advice.",
  },

  {
    slug: "why-hoa-fines-get-thrown-out",
    title: "Why HOA fines get thrown out",
    short: "Why HOA fines get thrown out",
    description:
      "Skipping due process does not weaken a fine. In most states it voids it. The sequence, the notice that fails the standard, and the question to ask before you levy anything.",
    topic: "Enforcement",
    published: "2026-08-18",
    checked: "2026-08-18",
    h1: "Why HOA fines get thrown out",
    lede: "A board follows the rule, sends the letter, levies the fine, and loses anyway. Almost always for the same reason: a step in the middle was missed.",
    bands: [
      {
        title: "The sequence",
        body: [
          { rows: [
            "Report.",
            "Verify, with a photo, a date, and the rule it breaks.",
            "Courtesy notice, where your documents call for one.",
            "Formal notice, naming the violation and citing the specific rule.",
            "Cure window, of the length your documents and your state require.",
            "Re-inspection when the window closes.",
            "Notice of hearing, on your state's required period. California requires at least ten days.",
            "The hearing, before the board, with the outcome recorded.",
            "The fine, at the amount your documents allow, inside any statutory cap.",
            "The appeal, where your documents provide one.",
          ] },
          { coda: "Miss one and the fine is usually unenforceable. Date every step." },
        ],
      },
      {
        title: "Notices that fail the standard",
        field: true,
        body: [{ rows: [
          "A notice that does not identify the violation specifically. \"Your yard is in violation\" is not a violation notice.",
          "A notice that does not cite the rule. Not \"the CC&Rs\", the provision.",
          "A notice with no cure period, or one shorter than your documents allow.",
          "A hearing notice that gives less time than the statute requires.",
        ] }],
      },
      {
        title: "The question to ask before you levy anything",
        body: [
          { p: "**How many times has this rule been enforced before, and how many open instances are sitting there right now?**" },
          { p: "Selective enforcement can void the fine and, in some states, hand the owner their legal costs. A board fining one owner for something it has ignored eleven times is going to lose, and it will lose on a record the board itself created." },
          { coda: "Most boards cannot answer that question, because the history is in three people's memories and a shared drive." },
        ],
      },
      {
        title: "If you are the owner reading this",
        field: true,
        body: [
          { rows: [
            "Ask for the provision you are alleged to have breached, in writing.",
            "Ask for the date of the hearing and the period of notice you were given.",
            "Ask how the rule has been enforced elsewhere in the community.",
          ] },
          { coda: "Boards that did it properly can answer all three. Boards that did not, cannot." },
        ],
      },
    ],
    productNote:
      "Parcel logs a violation against the rule it breaks and runs the cure window and hearing clock your state sets. It will not produce a fine without a recorded hearing notice and outcome. Before you levy, it tells you how often that rule has been enforced.",
    cta: { label: "See rules and enforcement", href: "/product/rules-and-enforcement" },
    footnote: "Due process requirements vary by state. Not legal advice.",
  },

  {
    slug: "hoa-management-company-cost",
    title: "What a management company costs, and what you actually get",
    short: "What a management company costs",
    description:
      "$15 to $25 per door per month, plus the charges that are not in the base fee. What the money buys, what it does not, and when hiring a manager is the right call.",
    topic: "Money",
    published: "2026-08-18",
    checked: "2026-08-18",
    h1: "What a management company costs, and what you actually get",
    lede: "$15 to $25 per door per month for full management. Smaller associations pay at the top of that range or above it, because below a certain size the work is not worth a manager's time.",
    bands: [
      {
        title: "The charges that are not in the base fee",
        body: [
          { table: {
            caption: "Commonly billed on top",
            head: ["Charge", "Usually billed"],
            body: [
              ["Base management", "Per door, per month"],
              ["Setup and onboarding", "Once, up front"],
              ["Statutory notice mailings", "Per notice, plus postage"],
              ["Estoppel and resale certificates", "Per request, often capped by statute"],
              ["Special assessment administration", "Per project, or a percentage"],
              ["Collections and lien filing", "Per action, sometimes a percentage of recovery"],
              ["After hours and emergency calls", "Per call"],
              ["Meetings beyond a set number", "Per meeting"],
              ["Records requests", "Per page, per hour"],
            ],
          } },
          { coda: "These are typical ranges from industry reporting, not a survey we ran. Your contract is the authority." },
        ],
      },
      {
        title: "Why it keeps going up",
        field: true,
        body: [{ p: "Management fees track payroll, and payroll has moved. Insurance is pushing every association's budget up at the same time: associations across the country reported unexpected expense increases in recent surveys, with insurance among the top drivers." }],
      },
      {
        title: "What the money buys",
        body: [
          { p: "Real work, and it is worth naming. Following the accounts that have not paid. Mailing statutory notices. Tracking the deadlines. Collecting bids. Attending the meeting. Taking the owner phone calls." },
          { p: "Most of it is recurring, procedural, and driven by dates that are already written in your own documents." },
          { coda: "What it does not buy is memory. Managers change and portfolios get reassigned, and what your manager knew about your association walks out with them. Same problem volunteer turnover creates, from the other direction." },
        ],
      },
      {
        title: "When a manager is the right call",
        field: true,
        body: [
          { p: "Software does not attend your meeting. It does not walk the property after a storm. It does not take the angry call at nine at night, and it will not stand between a board member and an owner who is shouting." },
          { coda: "If your board wants those things, hire a manager. That is a real service and this is not a substitute for it." },
        ],
      },
      {
        title: "Before you sign, or leave",
        body: [
          { p: "Check three clauses. The notice period for termination. What termination costs. What records they must return, in what format, and by when." },
          { coda: "That last one decides how hard the following month is. Ask for ledgers as data. An export loads. Four hundred pages of PDF has to be typed." },
        ],
      },
    ],
    productNote:
      "If what you are paying for is the month, invoicing, deadlines, notices, bids, minutes and the record, that is procedural work driven by your own documents. Parcel starts at $10 a month and does that part.",
    cta: { label: "Common Parcel vs a management company", href: "/vs/management-company" },
    footnote: "Fee ranges from industry reporting. Your contract governs.",
  },
];

export const TOPICS = ["Compliance", "Money", "Enforcement", "Governance", "Getting started"] as const;
