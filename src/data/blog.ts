/**
 * Blog post schema and data store.
 *
 * Designed for authoritative, primary-sourced HOA operational and statutory guides.
 * Post bodies carry structured citations with source, section, and retrieval date.
 * Content is authored and reviewed with primary source verification.
 */

export interface Citation {
  source: string;
  section: string;
  title: string;
  retrievedAt: string; // ISO YYYY-MM-DD
  url?: string;
  note?: string;
}

export interface BlogCallout {
  type: "statutory" | "note" | "warning";
  title?: string;
  text: string;
}

export interface BlogSection {
  heading?: string;
  paragraphs: string[];
  callout?: BlogCallout;
  /**
   * More than one callout in a section. A statutory guide quotes two or three
   * subsections in a row and then reads them together, so one callout per
   * section is not enough shape for the argument. Rendered after `callout`.
   */
  callouts?: BlogCallout[];
  list?: {
    title?: string;
    items: string[];
  };
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string; // ISO YYYY-MM-DD
  author: {
    name: string;
    role: string;
  };
  category: "Statutory Guidance" | "Operations" | "Board Governance" | "Financial Controls";
  readTime: string;
  artSeed: number;
  artScene?: "dusk" | "dawn";
  lede: string;
  sections: BlogSection[];
  citations: Citation[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "board-transition-records-retention-checklist",
    title: "A Volunteer Board Transition and Records Organization Guide",
    description: "Operational principles for handing off association books, vendor contracts, architectural records, and meeting minutes between outgoing and incoming board officers.",
    publishedAt: "2026-08-22",
    author: {
      name: "Common Parcel Editorial",
      role: "Operations and Governance",
    },
    category: "Board Governance",
    readTime: "4 min read",
    artSeed: 101,
    artScene: "dusk",
    lede: "When board members rotate off an association board, institutional knowledge and administrative access often disappear with them. Here is a procedural guide to maintaining clean continuity across leadership transitions.",
    sections: [
      {
        heading: "Keep association records in one place",
        paragraphs: [
          "In many self-managed communities, records end up scattered across personal email accounts, private laptops, and physical boxes stored in past presidents' basements.",
          "Establishing a single, shared association repository ensures that incoming officers inherit complete documentation without relying on ad-hoc personal file transfers.",
        ],
        callout: {
          type: "note",
          title: "Custody Principle",
          text: "Association records belong to the non-profit entity, not to individual directors or officers. Official records should always reside in an association-owned workspace with distinct administrative roles.",
        },
      },
      {
        heading: "Essential categories for annual turnover",
        paragraphs: [
          "An orderly handover checklist organizes documents by operational function. This allows the incoming treasurer, secretary, and president to inspect their respective functional areas immediately upon election.",
          "Document repositories should preserve dated records alongside audit histories for all vendor quotes, architectural decisions, and financial reconciliations.",
        ],
        list: {
          title: "Core records turnover categories",
          items: [
            "Financial ledgers, approved annual budgets, and year-end balance sheets",
            "Executed vendor contracts, certificates of insurance, and active warranties",
            "Approved architectural review submissions, approvals, and denial notices",
            "Signed board meeting minutes, notice certificates, and annual meeting records",
          ],
        },
      },
    ],
    /*
     * Deliberately empty, and it must stay that way until this post cites
     * something that exists.
     *
     * The first draft cited "Common Parcel Governance Standards, Section 1.2".
     * There is no such document. An invented authority inside a panel headed
     * "Primary Sources and Statutory Citations" is worse than no panel: the
     * panel's whole job is to tell a reader the claim above it can be checked.
     * CitationBlock renders nothing for an empty list, which is the correct
     * output for a post that is operational advice rather than a reading of a
     * statute.
     */
    citations: [],
  },

  /*
   * MICHIGAN RECORDS RIGHTS. THE FIRST STATUTORY POST.
   *
   * Every quoted sentence below was fetched from legislature.mi.gov on
   * 2026-08-22 and is checked, verbatim, against the bytes of the page it is
   * attributed to. The snapshots are in tests/sources and the check is
   * tests/blog-citations.test.mjs. Bend one word of a quote and the test fails.
   *
   * Three things this post exists to get right, because the first attempt at a
   * statutory post got all three wrong:
   *
   *   1. Attribution. The audit rule is Section 157, not Section 168. Section
   *      168 is one sentence about keeping the condominium documents available.
   *   2. Who holds the vote. The audit opt-out belongs to the members by
   *      majority, not to the board.
   *   3. Who the act binds. MCL 559 reaches an association of co-owners of a
   *      condominium project. A subdivision association is not one. A site
   *      condominium is one, however suburban the lawns look.
   */
  {
    slug: "michigan-hoa-records-request",
    title: "How to get your association's records in Michigan",
    description:
      "A Michigan condominium co-owner and a subdivision association member have different records rights under different acts. The sections, quoted, and what to ask for before you leave a management company.",
    publishedAt: "2026-08-22",
    author: {
      name: "Common Parcel",
      role: "Detroit, Michigan",
    },
    category: "Statutory Guidance",
    readTime: "9 min read",
    artSeed: 61,
    artScene: "dawn",
    lede:
      "Most of the risk in leaving a management company is not the notice letter. It is the six weeks afterwards, when a board finds out which records it never actually held. Michigan gives you a way to ask first, and it is a different way depending on how your community was created.",
    sections: [
      {
        heading: "Start with which law covers you",
        paragraphs: [
          "Michigan associations come in two legal shapes with different records rights. Getting this wrong means quoting a statute that does not apply to your association, which is the fastest way to have a request ignored.",
          "**A condominium.** If your community was created by a recorded master deed and your neighbours are co-owners of units, the Michigan Condominium Act, 1978 PA 59, covers you. That act uses the terms \"association of co-owners\" and \"condominium project\", and the records sections quoted below are its.",
          "**A subdivision association.** If your community was created by a recorded declaration of covenants and you own a platted lot, the Condominium Act does not reach you. Your records rights come from your own recorded declaration and bylaws, and, if the association is incorporated, from the Michigan Nonprofit Corporation Act, 1982 PA 162.",
          "One trap worth naming, because it catches boards and it nearly caught this guide. A site condominium is a condominium. Owners hold a unit that happens to be a building envelope on land rather than an apartment, the lawns look like any subdivision, and the Condominium Act applies anyway. What the street looks like decides nothing.",
          "You can settle which shape you are in an afternoon. Pull the recorded document that created the community from your county register of deeds, and look up the association by name in the state business entity search. A recorded master deed points at the Condominium Act. A declaration of covenants with a nonprofit filing points at the other path. If the document does not make it obvious, that is a question for a Michigan attorney rather than a guess.",
        ],
        callout: {
          type: "note",
          title: "Why it is worth the afternoon",
          text: "The condominium records right is broader, faster and free to exercise. The corporate one has a written demand, a purpose to satisfy, and a courthouse at the end of it.",
        },
      },
      {
        heading: "What a condominium co-owner can ask for",
        paragraphs: [
          "The Condominium Act splits the records into two sections that reach two different audiences. Knowing which is which is the difference between a manager who produces the file and a manager who asks what you mean.",
        ],
        callouts: [
          {
            type: "statutory",
            title: "MCL 559.157(1)",
            text: "\"The books, records, contracts, and financial statements concerning the administration and operation of the condominium project shall be available for examination by any of the co-owners and their mortgagees at convenient times.\"",
          },
          {
            type: "statutory",
            title: "MCL 559.168",
            text: "\"An association of co-owners shall keep current copies of the master deed, all amendments to the master deed, and other condominium documents for the condominium project available at reasonable hours to co-owners, prospective purchasers, and prospective mortgagees of condominium units in the condominium projects.\"",
          },
        ],
        list: {
          title: "Reading those two together",
          items: [
            "**Books, contracts and financial statements** rest on Section 157. Any co-owner may examine them, and so may their mortgage holder.",
            "**The master deed, its amendments and the other condominium documents** rest on Section 168, and that section reaches further: a prospective buyer and their lender can ask, not only an existing co-owner.",
            "**Neither sentence sets a deadline.** Section 157 says \"at convenient times\" and Section 168 says \"at reasonable hours\". Neither puts a number on it, so name your own date in the letter and say what you will do if it passes.",
            "**Subsection 157(1) is one sentence, and it names no written demand, no purpose to satisfy and no fee.** Other parts of the act may bear on how a request is handled. This guide has read the sections listed at the foot of the page and no others.",
          ],
        },
      },
      {
        heading: "The audit rule most boards never voted on",
        paragraphs: [
          "This is the part of the Condominium Act that surprises boards, and it is much better found while the manager is still under contract than after.",
        ],
        callouts: [
          {
            type: "statutory",
            title: "MCL 559.157(2)",
            text: "\"Except as provided in subsection (3), an association of co-owners with annual revenues greater than $20,000.00 shall on an annual basis have its books, records, and financial statements independently audited or reviewed by a certified public accountant, as defined in section 720 of the occupational code, 1980 PA 299, MCL 339.720.\"",
          },
          {
            type: "statutory",
            title: "MCL 559.157(3)",
            text: "\"An association of co-owners may opt out of the requirements of subsection (2) on an annual basis by an affirmative vote of a majority of its members by any means permitted under the association's bylaws.\"",
          },
        ],
        list: {
          title: "Three questions for your manager, in writing",
          items: [
            "Did the association's annual revenue exceed $20,000.00 in each of the last several years?",
            "For each of those years, was there an audit or a review, and where is the report?",
            "For any year without one, where is the recorded member vote to opt out?",
          ],
        },
      },
      {
        heading: "The vote belongs to the members",
        paragraphs: [
          "Read subsections (2) and (3) together and the shape is clear. An audit or a review is what the statute requires above $20,000.00 in annual revenue. Opting out is allowed, and it is not a board decision and not a permanent one: the statute puts the vote with the members, requires a majority of them, and requires it again every year.",
          "That distinction is the whole point of quoting the words rather than summarising them. A board that believes it can decide to skip the audit has read a summary, and there are plenty of those. A board that inherits several years of books with neither a report nor a recorded vote has inherited a problem, and the problem does not get cheaper with time.",
        ],
      },
      {
        heading: "What a subdivision member can ask for",
        paragraphs: [
          "If the association is a Michigan nonprofit corporation, a member's inspection right comes from the Nonprofit Corporation Act, and it works differently. Section 487(2) allows inspection during regular business hours, and it asks the member to earn it.",
        ],
        callouts: [
          {
            type: "statutory",
            title: "MCL 450.2487(2), in part",
            text: "\"... may during regular business hours inspect for any proper purpose the corporation's stock ledger, a list of its shareholders or members, and its other books and records, if the shareholder or member gives the corporation written demand describing with reasonable particularity the purpose of the inspection and the records the shareholder or member desires to inspect, and the records sought are directly connected with the purpose.\"",
          },
        ],
        list: {
          title: "What that means in practice",
          items: [
            "**Proper purpose has a definition, in the same subsection.** It means \"a purpose that is reasonably related to a person's interest as a shareholder or member\".",
            "**Send it to the corporation, not the manager.** The subsection requires delivery to the registered office in this state or the principal place of business. The manager's office is neither.",
            "**Date it.** Under Section 487(3), if the corporation does not permit the inspection within 5 business days of receiving the demand, or imposes unreasonable conditions on it, the member may apply to the circuit court for the county holding the principal place of business or registered office for an order compelling it.",
            "**What you asked for changes who has to prove what.** For the membership list, the corporation carries the burden of showing the purpose was improper. For the other books and records, the member carries the burden of showing the demand was in the right form, the purpose was proper, and the records asked for connect to it.",
            "**So write one careful letter naming a real purpose**, rather than a broad request for everything. The narrow request is the one that is easier to enforce.",
          ],
        },
      },
      {
        heading: "The handover list",
        paragraphs: [
          "Ask for all of it in one letter, in writing, before you give notice. A manager under contract answers a records request. A manager who has been terminated answers slowly.",
        ],
        list: {
          title: "What to ask for",
          items: [
            "**Recorded and governing.** The master deed or declaration and every recorded amendment, the bylaws, the articles of incorporation, current rules, and every board resolution still in force. The recorded ones you can pull yourself from the register of deeds for a few dollars, so ask mainly to learn what the manager believes is current.",
            "**Financial.** The general ledger for this year and last, bank statements for every account the association holds, the reconciliation for each of those months, the budget as adopted and the meeting that adopted it, reserve account statements, filed tax returns, and every audit or review report.",
            "**Per unit or per lot.** The roster with each owner's mailing address of record, the balance owed and the date each balance was struck, every payment plan in force and its terms, and every open violation with the date it was noticed.",
            "**Contracts.** Every vendor agreement with its renewal date and its cancellation notice window, certificates of insurance for each vendor, and the association's own policies with declarations pages.",
            "**The meeting record.** Minutes and resolutions as far back as they exist, election results, and retained ballots or proxies.",
            "**Anything holding a clock.** Recorded liens and their dates, pending legal matters, open insurance claims, and any notice period already running against an owner.",
            "**Control, which is not records and takes the longest.** Bank signatories, the registered agent on file with the state, the association's domain and email, the payment processor account, and the physical mailbox.",
          ],
        },
      },
      {
        heading: "Do it in this order",
        paragraphs: [
          "Read the management agreement first, for one thing only: the notice window. Thirty and sixty days are both common, and some agreements set a date each year rather than a rolling window. Every other date in your plan hangs off that one.",
          "Send the records request while the agreement is still live. Cite the section that covers your association, list what you want, and name a date.",
          "Check what arrived against the list before you give notice. This is the step boards skip, and it is the only one that cannot be done later.",
          "Then give notice, in the form the agreement requires. Certified mail, if that is what it says.",
          "Move control in the last two weeks: bank signatories, registered agent, processor, mailbox, and the vendors who need a new address for an invoice.",
        ],
        callout: {
          type: "warning",
          title: "The one that goes wrong",
          text: "Handovers that go badly almost always reversed the middle two steps. The notice went out first, the records request second, and by then the manager had no reason left to hurry.",
        },
      },
      {
        heading: "What usually goes missing",
        paragraphs: [
          "Five gaps show up again and again, and each one is easier to close with a question than with a reconstruction.",
        ],
        list: {
          items: [
            "**Balances with no as-of date.** A list of amounts owed is worth little if nobody can say which day it was true. Ask for the date on the face of the report.",
            "**Vendor renewal dates.** Contracts arrive as scans and the renewal and cancellation dates sit in a paragraph in the middle. A board that misses one renews landscaping for a year on the old terms.",
            "**The monthly reconciliations.** Bank statements arrive and the reconciliation does not, because it lived in the manager's accounting system rather than in a file. Without it, the ledger and the bank are two numbers with nothing joining them.",
            "**Audit and review reports, and the opt-out votes.** See above. This is the gap that costs money later.",
            "**Owner mailing addresses of record.** The address an owner asked to be reached at is not always the property address, and a notice sent to the wrong one may not count as sent.",
          ],
        },
      },
      {
        heading: "What this guide cannot tell you",
        paragraphs: [
          "This is a records checklist and a reading of three sections. It is not legal advice, and there are four things it cannot answer for your association.",
        ],
        list: {
          items: [
            "**Your notice period.** It is in your management agreement and nowhere else.",
            "**Whether your declaration or bylaws require a member vote to change managers.** Some do. Read yours.",
            "**Which act covers you.** The recorded document that created your community settles it. If reading it leaves you unsure, that is a cheap question to put to a Michigan attorney.",
            "**Whether this text still reads the same way.** Michigan amends both acts. The retrieval dates below are the dates these sections were read.",
          ],
        },
        callout: {
          type: "note",
          title: "Where Common Parcel comes in, and where it does not",
          text: "Common Parcel is software for boards that have already decided to self-manage. It does not answer any of the four questions above, and a board that has not answered them is not ready to leave yet.",
        },
      },
    ],
    citations: [
      {
        source: "Michigan Condominium Act, 1978 PA 59",
        section: "MCL 559.157",
        title: "Books, records, contracts, and financial statements; examination; audit or review; opt-out of the requirements of subsection (2)",
        retrievedAt: "2026-08-22",
        url: "https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-559-157",
        note: "Quoted in full above at subsections (1), (2) and (3).",
      },
      {
        source: "Michigan Condominium Act, 1978 PA 59",
        section: "MCL 559.168",
        title: "Availability of condominium documents",
        retrievedAt: "2026-08-22",
        url: "https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-559-168",
        note: "The section is a single sentence, quoted in full above.",
      },
      {
        source: "Michigan Nonprofit Corporation Act, 1982 PA 162",
        section: "MCL 450.2487",
        title: "Inspection of books and records by a shareholder or member; written demand; proper purpose; order compelling inspection",
        retrievedAt: "2026-08-22",
        url: "https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-450-2487",
        note: "Subsection (2) quoted in part above. Subsection (3) is described rather than quoted.",
      },
    ],
  },
];

export function getAllPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort((a, b) => (b.publishedAt > a.publishedAt ? 1 : -1));
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
