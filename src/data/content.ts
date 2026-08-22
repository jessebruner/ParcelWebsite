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
  /** [label, href] for the onward link under the section name. */
  note?: [string, string];
  body: Content[];
}

export interface PageSpec {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  lede: string;
  bands: BandSpec[];
}

/* ── FEATURES ─────────────────────────────────────────────────────────── */

export const FEATURES: PageSpec[] = [
  {
    slug: "dues-and-payments",
    title: "Dues and payments",
    description:
      "Invoiced at the amount your declaration sets, on the date it sets. Receipts post the same day and the ledger reconciles overnight.",
    eyebrow: "Dues and payments",
    h1: "Dues go out on time, every period",
    lede: "Parcel bills the assessment your declaration sets, on the date it sets. It does not ask you to type the amount, and it does not need reminding when the quarter turns.",
    bands: [
      {
        title: "What it does",
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
          "Takes autopay, bank transfer and card.",
          "Logs a mailed cheque against the right lot.",
          "Posts receipts the same day.",
          "Applies late fees the way your documents describe them.",
          "Gives every owner a statement they can download.",
        ] }],
      },
      {
        title: "How it works",
        field: true,
        body: [{ rows: [
          "**One.** Parcel reads the assessment, the due date, the grace period and the late fee out of your declaration, and shows each one with the page it came from.",
          "**Two.** You confirm what it read.",
          "**Three.** The billing run goes out on the date your documents set, every period, without being started.",
        ] }],
      },
      {
        title: "Where it stops",
        note: ["See collections", "/product/collections"],
        body: [{ statutory: {
          label: "Custody",
          lede: "Owners pay into the association's own account, in the association's own name. Parcel is not in that path and cannot move a dollar out of it.",
          note: "Live card and bank payments are not switched on yet. Invoicing, ledgers and statements run today. Paying through Parcel arrives at launch.",
        } }],
      },
    ],
  },
  {
    slug: "collections",
    title: "Collections",
    description:
      "A graduated delinquency ladder that runs on your state's periods, holds when a board says hold, and waits for two officers before anything statutory leaves.",
    eyebrow: "Collections",
    h1: "What happens when someone stops paying",
    lede: "Parcel sends the reminder, then the late notice, then the demand, on the dates your documents and your state require. Moving faster than that is how a board loses the argument later.",
    bands: [
      {
        title: "The order notices go out in",
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
            "**Formal notice.** The late notice your documents and your state require.",
            "**Demand.** The letter before a lien, with the amount broken out.",
            "**Lien warning.** Prepared, cited, and waiting for signature.",
          ] },
          { coda: "Each step's timing comes from your state's statute and your own documents. Not from a setting somebody picked." },
        ],
      },
      {
        title: "Putting an account on hold",
        field: true,
        body: [{ p: "When a board freezes an account for a hardship, a dispute, or a death in the family, accrual stops and the ladder stops. Not mostly stops." }],
      },
      {
        title: "Where it stops",
        body: [
          { p: "Nothing with legal weight goes out on its own. A demand, a lien warning or a statutory notice needs two officers to sign, and the record shows who signed, when, and on what basis." },
          { p: "If your state's collection procedure has not been read yet, the ladder does not advance and the interface says which provision is missing." },
        ],
      },
      {
        title: "What Parcel cannot do yet",
        field: true,
        note: ["See rules and enforcement", "/product/rules-and-enforcement"],
        body: [{ statutory: {
          label: "Proof of mailing",
          lede: "Certified mail is not connected. Parcel can show that a notice was drafted and approved. It cannot yet show that it was served.",
          note: "Until that ships, mail the notice yourself and record it. A screen that implied otherwise would be lying about whether an owner was served.",
        } }],
      },
    ],
  },
  {
    slug: "accounting-and-budgets",
    title: "Accounting and budgets",
    description:
      "Nightly bank reconciliation, budgets that carry the vote that adopted them, and a full export for your accountant any month.",
    eyebrow: "Accounting and budgets",
    h1: "Ledgers that reconcile, budgets that show their vote",
    lede: "Every charge, payment, fee and credit lands in one ledger, and the bank reconciles against it overnight.",
    bands: [
      {
        title: "Reconciliation",
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
                  } },{ p: "The bank reconciles overnight. A reconciliation that does not cover every transaction is not accepted as complete, so reconciled means reconciled." }],
      },
      {
        title: "Budgets",
        field: true,
        body: [
          { p: "A budget moves through draft, proposed and adopted, and every version is kept. The adopted one carries the meeting that adopted it and the notice that preceded it." },
          { coda: "That matters in an argument. When an owner disputes an assessment, the answer is the date it was adopted, the notice period it ran on, and the budget attached to it. Most software records the number and nothing about how the board got there." },
        ],
      },
      {
        title: "Special assessments",
        body: [{ p: "The same machinery with a different vote threshold. Parcel reads the threshold your documents require, tracks the vote against it, and bills from the result." }],
      },
      {
        title: "Reports and the handoff",
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
      "Violations logged against the rule they break, with the cure window, the hearing notice your state requires, and a check on how often that rule has been enforced before.",
    eyebrow: "Rules and enforcement",
    h1: "Violations, hearings, and fines that hold up",
    lede: "A fine only sticks if the steps before it were done properly. Parcel runs each one on the clock your state sets, and will not produce the fine until the hearing is on the record.",
    bands: [
      {
        title: "The sequence",
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
            "Notice of hearing, on your state's required period.",
            "Hearing, with the outcome recorded.",
            "Fine, at the amount your documents allow, inside any statutory cap.",
            "Appeal, where your documents provide one.",
          ] },
          { coda: "Every step is dated in the record. The record is the defence." },
        ],
      },
      {
        title: "How often has this rule been enforced?",
        field: true,
        body: [
          { p: "Before a fine is levied, Parcel looks at how the association has treated that rule before and says what it finds. How many times it has been enforced. How many open instances are sitting there right now." },
          { coda: "A board fining one owner for something it has ignored eleven times is about to lose. Until now there was no way to see that from the inside." },
        ],
      },
      {
        title: "Architectural review",
        body: [{ p: "A request arrives, gets pre-screened against your own rules with the provisions quoted, and carries the response clock your state sets. The committee decides. Parcel never does." }],
      },
      {
        title: "Where it stops",
        field: true,
        note: ["See meetings and voting", "/product/meetings-and-voting"],
        body: [{ statutory: {
          label: "No fine without the procedure",
          lede: "A fine cannot be produced without a recorded hearing notice that satisfies your state's period and a recorded outcome. Not a warning. The action is unavailable.",
          note: "Requests for an exception on disability grounds run on different law and a different timeline. Treating one as a violation appeal is its own liability. That process is designed and not built yet.",
        } }],
      },
    ],
  },
  {
    slug: "meetings-and-voting",
    title: "Meetings and voting",
    description:
      "Notice on the statutory schedule, an agenda from open business, quorum against the live roster, and minutes drafted when the vote closes.",
    eyebrow: "Meetings and voting",
    h1: "Notice, quorum, vote, minutes",
    lede: "An association runs on that cycle. Nearly everything with legal weight passes through it, and skipping a step usually makes the result void rather than untidy.",
    bands: [
      {
        title: "The meeting",
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
            "**Notice** goes out on the period your state and your bylaws set, counted back from the date.",
            "**The agenda** assembles itself from business that is actually open: the motions waiting, the approvals pending, the deadlines landing.",
            "**Quorum** is counted against the roster you have today, not the one from last year.",
            "**Motions** carry into votes and the votes carry into the record.",
            "**Minutes** are drafted when the vote closes and adopted at the next meeting.",
          ] },
          { coda: "Video conferencing is built in, and the calendar publishes a feed your board can subscribe to." },
        ],
      },
      {
        title: "Elections",
        field: true,
        body: [{ p: "Electronic ballots and proxies where your state permits them, with paper ballots logged alongside. Eligibility comes from the roster. Quorum is live. A contested result has a record behind every number." }],
      },
      {
        title: "Committees",
        body: [{ p: "Architectural review, landscaping, whatever your bylaws create. Each committee gets the queue it is responsible for and nothing else." }],
      },
      {
        title: "Signing",
        field: true,
        note: ["See documents and answers", "/product/documents-and-answers"],
        body: [{ p: "Anything statutory needs two officers. The signatures go into the record with the time and the reason." }],
      },
    ],
  },
  {
    slug: "documents-and-answers",
    title: "Documents and answers",
    description:
      "Upload the declaration, bylaws and rules. Parcel reads them, shows each provision with the page it sits on, and answers questions from your own documents.",
    eyebrow: "Documents and answers",
    h1: "Ask your declaration a question",
    lede: "The most common drain on a board's time is answering the same question again. Can I put a shed there. When are dues late. What color can I paint the door.",
    bands: [
      {
        title: "What happens when you upload",
        body: [
          { "panel": {
                            "label": "Reading your declaration",
                            "note": "About 30 min",
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
            "**You confirm what it read.** A short list beside the source text. About thirty minutes for a typical set.",
            "**Unconfirmed facts cannot drive anything.** One gate in the code, and everything passes through it.",
            "**What it cannot find prints as unknown.** Not a default. Not a number from a similar association.",
          ] },
        ],
      },
      {
        title: "Then the documents do the work",
        field: true,
        body: [
          { p: "Questions come back with the section they rest on, so you can read it yourself and forward it to an owner who will argue." },
          { p: "Owners can ask too. Every question an owner answers alone is one the board never receives." },
          { p: "Notices quote your own rules by page and line, not a template with your association's name dropped into it." },
          { coda: "When the documents are amended, the reading is redone, and the record shows what the rule was before, when it changed, and what changed it." },
        ],
      },
      {
        title: "Records requests",
        body: [{ p: "An owner's request starts a clock with a dollar figure attached in several states. Parcel dates the request, runs the statutory window for your jurisdiction, searches the records it already holds, and logs what was produced." }],
      },
      {
        title: "Resale and estoppel",
        field: true,
        body: [{ p: "A buyer's agent asks, and the packet assembles from confirmed facts. Where a required figure is unconfirmed, Parcel refuses to assemble rather than shipping a guess to a closing table." }],
      },
      {
        title: "What it will not do",
        note: ["See compliance", "/compliance"],
        body: [{ p: "It will not tell you what a provision means in a dispute. It will not opine on whether a rule is enforceable. It quotes your documents and shows you where the words are. The judgment is the board's and the law is your attorney's." }],
      },
    ],
  },
  {
    slug: "vendors-and-insurance",
    title: "Vendors and insurance",
    description:
      "Contracts get re-bid before they renew, with the going rate beside each quote. Policies are read, renewals land on the calendar, and invoices are checked against the contract.",
    eyebrow: "Vendors and insurance",
    h1: "Contracts get re-bid before they renew",
    lede: "Parcel watches every renewal date and goes out for fresh quotes before it arrives, with the going rate for that work beside them. You still choose the vendor.",
    bands: [
      {
        title: "Contracts",
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
                                                "label": "Going rate, your area",
                                                "value": "$22,100",
                                                "cite": "Benchmark"
                                      }
                            ],
                            "footing": {
                                      "label": "If you switch",
                                      "value": "$4,750"
                            }
                  } },
          { p: "Every contract has a renewal date and a notice period, and Parcel counts back from both. Before a contract renews it goes and gets fresh quotes, and puts the going rate for that work in your area beside them." },
          { coda: "You pick the vendor. Parcel refuses to let the date pass unnoticed." },
        ],
      },
      {
        title: "Quotes and invoices",
        field: true,
        body: [
          { p: "Send a request for quotes to several vendors from one screen. Replies arrive by email and the numbers come out of them into a table you can compare." },
          { p: "An invoice gets checked against the contract it belongs to before it reaches you. A rate that does not match, a line that was not in the scope, a duplicate of last month: those surface before payment, not after." },
        ],
      },
      {
        title: "Insurance",
        body: [
          { p: "Policies are read the way governing documents are read. Coverage limits, deductibles and the renewal date come out as facts. The renewal lands on the calendar counted back from the notice date, and the certificate requests that eat a manager's week get answered from what Parcel already holds." },
          { coda: "Insurance is the fastest rising line on most budgets right now. It is also the one most often handled by whoever remembers." },
        ],
      },
      {
        title: "Reserves",
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
    eyebrow: "Resident portal",
    h1: "Built so owners stop calling you",
    lede: "Most owners sign in twice a year. So the portal has to work for somebody who has never seen it and will not come back. Its job is to take work off the board, not to build a community.",
    bands: [
      {
        title: "What an owner can do",
        body: [
          { "panel": {
                            "label": "Portal · what an owner sees",
                            "note": "0 to your inbox",
                            "rows": [
                                      {
                                                "label": "Balance",
                                                "value": "$285"
                                      },
                                      {
                                                "label": "Autopay",
                                                "value": "On",
                                                "cite": "Next 1 April"
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
                                      "label": "Calls to the board",
                                      "value": "None"
                            }
                  } },{ rows: [
          "See what they owe, and what it is made of.",
          "Pay, or set up autopay.",
          "Download a statement or a receipt.",
          "Look up the rule that applies to them, with the section it comes from.",
          "Submit a request or an architectural application, with photos.",
          "Vote, where your state permits it.",
        ] }],
      },
      {
        title: "What the board gets back",
        field: true,
        body: [
          { p: "The phone call that does not happen. The email that does not need answering. The violation that does not start because the owner read the rule first." },
          { coda: "An owner who can answer their own question does not become an item on your agenda." },
        ],
      },
      {
        title: "Claiming a lot",
        note: ["See documents and answers", "/product/documents-and-answers"],
        body: [
          { p: "An owner finds their address and claims it. The board confirms." },
          { p: "Membership comes from a board decision, never from signing up. A duplicate claim is accepted and left for the board, because a spouse, a tenant and an heir can all be legitimate at one address." },
          { statutory: {
            label: "At launch",
            lede: "Paying through the portal is built and not yet switched on.",
            note: "Balances, statements, requests, rules and votes run today.",
          } },
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
        note: ["Leaving a management company", "/vs/management-company"],
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
        note: ["See use cases", "/use-cases"],
        body: [{ p: "Yes, and some associations should. They solve different problems and neither is a system of record for the other. If your board already pays for TownSq and likes it, the question is whether the governance and the money are handled, not whether to replace the feed." }],
      },
    ],
  },
  {
    slug: "management-company",
    title: "Common Parcel vs a management company",
    description:
      "A manager costs $15 to $25 per door per month and bills extra for the rest. What that buys, what it does not, and where software is the wrong answer.",
    eyebrow: "Compare",
    h1: "Common Parcel vs hiring a management company",
    lede: "This is the real decision most boards are making. The other comparisons are between tools. This one is between a tool and a person.",
    bands: [
      {
        title: "What a manager costs",
        body: [
          { p: "$15 to $25 per door per month for full management. The smaller the association, the higher the rate, because below a certain size the work is not worth a manager's time." },
          { p: "That is the base fee. Setup, statutory mailings, estoppel letters, special assessment administration, collections and lien filing, after hours calls, meeting attendance beyond a set number, records requests: all commonly billed on top." },
          { coda: "Costs are rising because payroll is rising, and because insurance is pushing every association's budget up." },
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
