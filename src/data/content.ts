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

export const FEATURES: PageSpec[] = [
  {
    slug: "dues-and-payments",
    title: "Dues and payments",
    description:
      "Invoice every lot from one board-approved schedule, collect online when connected, and keep payment records organized for the treasurer.",
    h1: "Dues and payments",
    lede: "Parcel bills the assessment your declaration sets, on the date it sets. It does not ask you to type the amount, and it does not need reminding when the quarter turns.",
    closer: "Get paid without asking twice.",
    bands: [
      {
        title: "Send dues without rebuilding the schedule",
        body: [
          { "panel": {
                            "label": "Assessments · March",
                            "note": "118 lots",
                            "rows": [
                                      {
                                                "label": "Lot 12 · A. Wells",
                                                "chip": "Paid"
                                      },
                                      {
                                                "label": "Lot 27 · R. Okafor",
                                                "chip": "Paid"
                                      },
                                      {
                                                "label": "Lot 41 · Delgado",
                                                "chip": "Paid"
                                      },
                                      {
                                                "label": "Lot 58 · J. Pham",
                                                "chip": "Paid"
                                      },
                                      {
                                                "label": "Lot 63 · Hargrove",
                                                "value": "Due",
                                                "pending": true
                                      }
                            ],
                            "footing": {
                                      "label": "Collected",
                                      "value": "$1,140"
                            }
                  } },{ rows: [
          "Invoices every lot on your schedule, at your amount.",
          "Takes bank transfer and card when connected.",
          "Logs a mailed cheque against the right lot.",
          "Posts a receipt when a payment clears.",
          "Applies late fees the way your documents describe them.",
          "Gives every owner a statement they can download.",
        ] }],
      },
      {
        title: "Confirm the numbers before billing starts",
        field: true,
        body: [{ rows: [
          "**One.** Parcel reads the assessment, the due date, the grace period and the late fee out of your declaration, and shows each one with the page it came from.",
          "**Two.** You confirm what it read.",
          "**Three.** You approve the schedule once. Parcel prepares each billing run from it.",
        ] }],
      },
      {
        title: "Common Parcel never holds your HOA's money",
        note: ["See collections", "/product/collections"],
        body: [{ statutory: {
          label: "Custody",
          lede: "Owners pay into the association's own account, in the association's own name. Common Parcel never holds association funds or has authority to withdraw them.",
          note: "Online card and bank payments switch on only after the association connects its own Stripe account. Invoicing, ledgers and statements do not depend on that connection.",
        } }],
      },
    ],
  },
  {
    slug: "collections",
    title: "Collections",
    description:
      "A board-controlled delinquency plan that uses verified notice periods where available, pauses on command, and records every approval.",
    h1: "Collections",
    lede: "Parcel prepares each collection step from your documents and any verified rules that apply. The board can review, send, pause, or stop the plan.",
    closer: "The hard letter, already written.",
    bands: [
      {
        title: "Control every collection step",
        body: [
          { "panel": {
                            "label": "Lot 63 · unpaid since 1 March",
                            "note": "Held",
                            "rows": [
                                      {
                                                "label": "Friendly reminder",
                                                "value": "Day 1",
                                                "cite": "Sent"
                                      },
                                      {
                                                "label": "Formal late notice",
                                                "value": "Day 30",
                                                "cite": "Sent"
                                      },
                                      {
                                                "label": "Demand and lien warning",
                                                "value": "Day 60",
                                                "cite": "Awaiting two signatures",
                                                "pending": true
                                      },
                                      {
                                                "label": "Accrual",
                                                "value": "Frozen",
                                                "cite": "Hardship recorded by the board"
                                      }
                            ],
                            "footing": {
                                      "label": "Balance",
                                      "value": "$570"
                            }
                  } },
          { rows: [
            "**Reminder.** A friendly note, on the day your grace period ends.",
            "**Formal notice.** The late notice your documents and verified state rules require.",
            "**Demand.** The letter before a lien, with the amount broken out.",
            "**Lien warning.** Prepared, cited, and waiting for signature.",
          ] },
          { coda: "Where Common Parcel has verified an applicable rule, the timing points back to that source and to your own documents." },
        ],
      },
      {
        title: "Pause collection when life happens",
        field: true,
        body: [{ p: "When a board places an account on hold for a hardship, a dispute, or a death in the family, scheduled collection actions stop until the board releases the hold." }],
      },
      {
        title: "Your board controls every collection action",
        body: [
          { p: "Nothing with legal consequences goes out on its own. Where the workflow enforces a two-officer gate, the action waits for both approvals and records who approved it, when, and on what basis." },
          { p: "Where Common Parcel has a verified rule for your state, the ladder reflects that procedure. If your state's collection procedure has not been verified yet, the ladder does not advance and the interface says which provision is missing." },
        ],
      },
      {
        title: "Certified mail is not connected yet",
        field: true,
        note: ["See rules and enforcement", "/product/rules-and-enforcement"],
        body: [{ statutory: {
          label: "Proof of mailing",
          lede: "Certified mail is not connected. Parcel can show that a notice was drafted and approved. It cannot yet show that it was served.",
          note: "Until that connection ships, the board remains responsible for service and for recording proof outside Common Parcel.",
        } }],
      },
    ],
  },
  {
    slug: "accounting-and-budgets",
    title: "Accounting and budgets",
    description:
      "Assisted bank reconciliation, budgets that carry the vote that adopted them, and a full export for your accountant any month.",
    h1: "Accounting and budgets",
    lede: "Every charge, payment, fee and credit lands in one ledger, keeping bank activity and association records organized.",
    closer: "Books your treasurer can hand over.",
    bands: [
      {
        title: "Keep the ledger tied to the bank",
        body: [
          { "panel": {
                            "label": "Reconciliation · 31 March",
                            "note": "Complete",
                            "rows": [
                                      {
                                                "label": "Transactions matched",
                                                "meter": 1
                                      },
                                      {
                                                "label": "Deposits",
                                                "value": "$14,820"
                                      },
                                      {
                                                "label": "Vendor payments",
                                                "value": "$9,404"
                                      },
                                      {
                                                "label": "Unmatched",
                                                "value": "0",
                                                "cite": "A partial reconciliation is not accepted"
                                      }
                            ],
                            "footing": {
                                      "label": "Budget against actual",
                                      "value": "+$1,206"
                            }
                  } },{ p: "Reconciliation sessions keep imported bank activity matched against ledger entries. A reconciliation that does not account for every transaction is flagged, helping the treasurer keep books clean." }],
      },
      {
        title: "Show owners how the budget was approved",
        field: true,
        body: [
          { p: "A budget moves through draft, proposed and adopted, and every version is kept. The adopted one carries the meeting that adopted it and the notice that preceded it." },
          { coda: "When an owner disputes an assessment, the board can show the date it was adopted, the notice that preceded it, and the budget attached to the vote." },
        ],
      },
      {
        title: "Bill from the approved result",
        body: [{ p: "A special assessment uses the threshold in your documents. Parcel tracks the vote against it and prepares billing after the board confirms the result." }],
      },
      {
        title: "Give the next treasurer clean books",
        field: true,
        note: ["See dues and payments", "/product/dues-and-payments"],
        body: [
          { rows: [
            "Monthly financials.",
            "Budget against actual.",
            "Delinquency by lot.",
            "Owner ledgers with every charge, payment, fee and credit.",
          ] },
          { coda: "A full export any month, with the record attached, in a form an accountant or an auditor can open." },
        ],
      },
    ],
  },
  {
    slug: "rules-and-enforcement",
    title: "Rules and enforcement",
    description:
      "Keep the rule, evidence, response window, hearing, and board decision together so enforcement stays consistent.",
    h1: "Rules and enforcement",
    lede: "Parcel keeps each enforcement step tied to the rule behind it. Where an applicable deadline or hearing rule has been verified, the workflow will not skip it.",
    closer: "The same rule for every neighbour.",
    bands: [
      {
        title: "Treat every case the same way",
        body: [
          { "panel": {
                            "label": "Lot 77 · fence height",
                            "note": "On schedule",
                            "rows": [
                                      {
                                                "label": "Notice sent",
                                                "value": "2 March",
                                                "cite": "Art. VII §3, p. 14"
                                      },
                                      {
                                                "label": "Cure window",
                                                "value": "closes 16 March",
                                                "pending": true
                                      },
                                      {
                                                "label": "Re-inspection",
                                                "value": "17 March"
                                      },
                                      {
                                                "label": "Enforced before",
                                                "value": "3 times in 4 years",
                                                "cite": "11 open instances"
                                      }
                            ],
                            "footing": {
                                      "label": "Fine available",
                                      "value": "Not yet"
                            }
                  } },
          { rows: [
            "Report, from a board member, a neighbor, or an owner through the portal.",
            "Verify, with a photo, a date, and the rule it breaks, quoted from your declaration.",
            "Courtesy notice, where your documents call for one.",
            "Formal notice, citing the specific rule.",
            "Cure window, on a real clock.",
            "Re-inspection when the window closes.",
            "Notice of hearing, using a verified period where one applies.",
            "Hearing, with the outcome recorded.",
            "Fine, at the amount your documents allow and within any verified cap that applies.",
            "Appeal, where your documents provide one.",
          ] },
          { coda: "Every step is dated in the record, so the board can explain what happened and why." },
        ],
      },
      {
        title: "How often has this rule been enforced?",
        field: true,
        body: [
          { p: "Before a fine is levied, Parcel looks at how the association has treated that rule before and says what it finds. How many times it has been enforced. How many open instances are sitting there right now." },
          { coda: "A board that treats similar cases differently will struggle to explain the decision. The history makes that pattern visible before the vote." },
        ],
      },
      {
        title: "Give committees the rule and the deadline",
        body: [{ p: "A request arrives, gets checked against your own rules with the provisions quoted, and shows a verified response deadline where one applies. The committee decides. Parcel never does." }],
      },
      {
        title: "Keep the board responsible for every fine",
        field: true,
        note: ["See meetings and voting", "/product/meetings-and-voting"],
        body: [{ statutory: {
          label: "No fine without the procedure",
          lede: "Where a verified rule requires notice and a hearing, the workflow keeps the fine unavailable until both are recorded.",
          note: "Requests tied to disability or another protected right need a separate process and qualified legal review. That process is designed and not built yet.",
        } }],
      },
    ],
  },
  {
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
  },
  {
    slug: "documents-and-answers",
    title: "Documents and answers",
    description:
      "Upload the declaration, bylaws and rules. Parcel reads them, shows each provision with the page it sits on, and answers questions from your own documents.",
    h1: "Documents and answers",
    lede: "Boards answer the same questions again and again: Can I put a shed there? When are dues late? What color can I paint the door?",
    closer: "Ask your declaration.",
    bands: [
      {
        title: "See the facts inside your governing documents",
        body: [
          { "panel": {
                            "label": "Reading your declaration",
                            "note": "Board review",
                            "rows": [
                                      {
                                                "label": "Assessment",
                                                "value": "$285",
                                                "cite": "P. 6, line 12"
                                      },
                                      {
                                                "label": "Due date",
                                                "value": "1st",
                                                "cite": "P. 6, line 18"
                                      },
                                      {
                                                "label": "Grace period",
                                                "value": "10 days",
                                                "cite": "P. 7, line 4"
                                      },
                                      {
                                                "label": "Late fee",
                                                "value": "$25",
                                                "cite": "P. 7, line 9"
                                      },
                                      {
                                                "label": "Fine cap",
                                                "value": "Unknown",
                                                "cite": "Not found in your documents",
                                                "pending": true
                                      }
                            ],
                            "footing": {
                                      "label": "Confirmed by the board",
                                      "value": "4 of 5"
                            }
                  } },
          { rows: [
            "**The documents are read.** Declaration, bylaws, rules, amendments, plat. Scans are fine.",
            "**Provisions come out as facts.** The assessment, the due date, the grace period, the late fee, the quorum threshold, the notice periods. Each carries the page and line it was read from.",
            "**You confirm what it read.** Review a short list beside the source text.",
            "**Unconfirmed facts cannot drive anything.** One gate in the code, and everything passes through it.",
            "**What it cannot find prints as unknown.** Not a default. Not a number from a similar association.",
          ] },
        ],
      },
      {
        title: "Answer routine questions with the source",
        field: true,
        body: [
          { p: "Questions come back with the section they rest on, so you can read it yourself and forward it to an owner who will argue." },
          { p: "Owners can ask too. Every question an owner answers alone is one the board never receives." },
          { p: "Notices quote your own rules by page and line, not a template with your association's name dropped into it." },
          { coda: "When the documents are amended, the reading is redone, and the record shows what the rule was before, when it changed, and what changed it." },
        ],
      },
      {
        title: "Track requests before a deadline is missed",
        body: [{ p: "Parcel dates a records request, shows a verified deadline where one applies, searches the records it already holds, and prepares the production log for board review." }],
      },
      {
        title: "Prepare closing records without guessing",
        field: true,
        body: [{ p: "Parcel prepares a resale packet from confirmed facts for board review. If a required figure is unconfirmed, the packet stays incomplete instead of carrying a guess to the closing table." }],
      },
      {
        title: "What it will not do",
        note: ["See security and audit", "/security"],
        body: [{ p: "It will not tell you what a provision means in a dispute. It will not opine on whether a rule is enforceable. It quotes your documents and shows you where the words are. The judgment is the board's and the law is your attorney's." }],
      },
    ],
  },
  {
    slug: "vendors-and-insurance",
    title: "Vendors and insurance",
    description:
      "Surface contracts before they renew, prepare quote requests for board review, and keep invoices beside the agreements behind them.",
    h1: "Vendors and insurance",
    lede: "Put each renewal date and notice period on one board calendar. Parcel counts back from both and helps prepare quote requests for board review.",
    closer: "Know before the renewal does.",
    bands: [
      {
        title: "See renewals before the deadline",
        body: [
          { "panel": {
                            "label": "Landscaping · renews 2 April",
                            "note": "3 quotes in",
                            "rows": [
                                      {
                                                "label": "Incumbent, renewing",
                                                "value": "$26,400"
                                      },
                                      {
                                                "label": "Quote two",
                                                "value": "$24,550"
                                      },
                                      {
                                                "label": "Quote three",
                                                "value": "$21,650",
                                                "chip": "Lowest"
                                      },
                                      {
                                                "label": "Board review",
                                                "value": "3 quotes",
                                                "cite": "Ready to compare"
                                      }
                            ],
                            "footing": {
                                      "label": "Decision",
                                      "value": "Board chooses"
                            }
                  } },
          { p: "Every contract has a renewal date and a notice period, and Parcel counts back from both. Before a contract renews, it alerts the board, drafts requests for fresh quotes, and lets you compare recorded vendor bids." },
          { coda: "You review and send the requests, and you pick the vendor. Parcel surfaces the renewal so the date does not pass unnoticed." },
        ],
      },
      {
        title: "Compare every quote on the same facts",
        field: true,
        body: [
          { p: "Prepare a request for several vendors from one screen, review it, and send it. Record the replies in one table so the board can compare the same facts." },
          { p: "Compare an invoice with its contract before board approval. A changed rate, an out-of-scope line, or a duplicate stays visible beside the document that answers it." },
        ],
      },
      {
        title: "Put policy renewals on the board calendar",
        body: [
          { p: "Policies are read the way governing documents are read. Coverage limits, deductibles, renewal dates, and notice periods sit beside the source page for board confirmation." },
          { coda: "The renewal belongs on the board calendar, not in one officer's memory." },
        ],
      },
      {
        title: "Plan reserves from the study you already have",
        field: true,
        note: ["See accounting and budgets", "/product/accounting-and-budgets"],
        body: [{ p: "Upload the reserve study and the numbers come out of it. Parcel tracks the funded position against what the study recommends, and says which it is missing when it only has one side." }],
      },
    ],
  },
  {
    slug: "resident-portal",
    title: "Resident portal",
    description:
      "Owners look up a balance, pay, read the rules that apply to them, submit a request and vote. Every question they answer alone is one the board never gets.",
    h1: "Resident portal",
    lede: "Owners should not need training to check a balance, find a document, or submit a request. The portal gives them one clear place to start and takes routine questions off the board.",
    closer: "Your phone stops ringing.",
    bands: [
      {
        title: "Give owners one place to start",
        body: [
          { "panel": {
                            "label": "Portal · what an owner sees",
                            "note": "Self-service",
                            "rows": [
                                      {
                                                "label": "Balance",
                                                "value": "$285"
                                      },
                                      {
                                                "label": "Last payment",
                                                "value": "$285",
                                                "cite": "1 March"
                                      },
                                      {
                                                "label": "Can I put a shed on my lot?",
                                                "value": "Answered",
                                                "cite": "Art. IX §2, p. 21"
                                      },
                                      {
                                                "label": "Architectural request",
                                                "value": "Submitted",
                                                "pending": true
                                      }
                            ],
                            "footing": {
                                      "label": "Board follow-up",
                                      "value": "Only when needed"
                            }
                  } },{ rows: [
          "See what they owe, and what it is made of.",
          "Pay online when payments are connected.",
          "Download a statement or a receipt.",
          "Look up the rule that applies to them, with the section it comes from.",
          "Submit a request or an architectural application, with photos.",
          "Vote, where your state permits it.",
        ] }],
      },
      {
        title: "Get routine questions out of your inbox",
        field: true,
        body: [
          { p: "The phone call that does not happen. The email that does not need answering. The violation that does not start because the owner read the rule first." },
          { coda: "An owner who can answer their own question does not become an item on your agenda." },
        ],
      },
      {
        title: "Let the board control portal access",
        note: ["See documents and answers", "/product/documents-and-answers"],
        body: [
          { p: "An owner finds their address and claims it. The board confirms." },
          { p: "Membership comes from a board decision, never from signing up. A duplicate claim is accepted and left for the board, because a spouse, a tenant and an heir can all be legitimate at one address." },
          { statutory: {
            label: "When connected",
            lede: "Online payments route directly to the association's bank.",
            note: "Balances, statements, requests, rules, and eligible votes stay in the portal.",
          } },
        ],
      },
    ],
  },
  {
    slug: "records-and-audit",
    title: "Records and audit",
    description:
      "Keep meeting records, board resolutions, vendor contracts, and numbered change history together across board transitions.",
    h1: "Records and audit",
    lede: "When officers rotate, institutional memory disappears. Keep minutes, resolutions, notices, and financial ledgers together so the next board inherits a usable association record.",
    closer: "The next board inherits everything.",
    bands: [
      {
        title: "Keep decisions with the records behind them",
        body: [
          {
            panel: {
              label: "Record · March",
              note: "Numbered",
              rows: [
                { label: "Resolution 2026-04 · Roofing", chip: "Passed" },
                { label: "Notice · Lot 77 Fence", chip: "Delivered" },
                { label: "Invoice · Apex Landscaping", chip: "Reconciled" },
                { label: "Annual Meeting Minutes", chip: "Signed" },
              ],
              footing: {
                label: "Export",
                value: "Included",
              },
            },
          },
          {
            rows: [
              "Meeting notices, verified attendance, and signed minutes.",
              "Board resolutions with documented voting tallies.",
              "Vendor contracts, renewals, and reconciled invoices.",
              "Notices, violation timelines, and hearing decisions.",
              "Monthly financial statements and bank reconciliation records.",
            ],
          },
        ],
      },
      {
        title: "Show who changed what",
        field: true,
        body: [
          { p: "Changes to supported accounts, rules, and records note who made them and when." },
          { coda: "The next board inherits structured association history instead of scattered email threads." },
        ],
      },
    ],
  },
];

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
            ["State statute", "Modelled rule by rule, with citations and stated gaps", "Not modelled"],
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
            ["State HOA statute", "Modelled rule by rule", "No"],
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
    lede: "TownSq is an engagement product. Its centre is a community feed, resident communication, participation. Reviews consistently note it is strong on engagement and weaker on financial management.",
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
            ["State statute modelled", "Rule by rule", "No"],
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
