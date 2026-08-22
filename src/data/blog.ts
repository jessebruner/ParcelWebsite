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
      name: "Common Parcel",
      role: "Detroit, Michigan",
    },
    category: "Board Governance",
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
    artSeed: 61,
    artScene: "dawn",
    lede:
      "Most of the risk in leaving a management company is not the notice letter. It comes afterward, when a board finds out which records it never actually held. Michigan gives some owners, members and directors ways to ask first, and the right path depends on how the community and association were created.",
    sections: [
      {
        heading: "Start with which law covers you",
        paragraphs: [
          "This guide follows two Michigan records paths that often matter to self-managed boards. They are not the only legal forms a community can take. Quoting a section that does not apply can leave the association relying on a right it does not have.",
          "**A condominium.** If your community was created by a recorded master deed and your neighbors are co-owners of units, the Michigan Condominium Act, 1978 PA 59, covers you. That act uses the terms \"association of co-owners\" and \"condominium project\". Its records sections are quoted below.",
          "**A subdivision association that is not a condominium.** Its records rights may come from the recorded declaration and bylaws and, if the association is incorporated under it, the Michigan Nonprofit Corporation Act, 1982 PA 162.",
          "One trap worth naming, because it catches boards and it nearly caught this guide. A site condominium is a condominium. Owners hold a unit that happens to be a building envelope on land rather than an apartment, the lawns look like any subdivision, and the Condominium Act applies anyway. What the street looks like decides nothing.",
          "Start with the recorded document that created the community and the association's state business filing. A recorded master deed points toward the Condominium Act. A declaration of covenants and a nonprofit filing may point toward the corporate path. Those records help identify the question; they are not a substitute for a Michigan attorney when the answer remains unclear.",
        ],
        callout: {
          type: "note",
          title: "The procedures are different",
          text: "MCL 559.157(1) says condominium records must be available at convenient times and does not state a written-demand or proper-purpose requirement. MCL 450.2487(2) requires a qualifying corporate member to make a particular written demand for a proper purpose. Neither cited section promises a completion date or says every request is free.",
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
        heading: "Check the annual audit or opt-out vote",
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
            "For any year without one, where is the association's documentation of the member vote to opt out?",
          ],
        },
      },
      {
        heading: "The vote belongs to the members",
        paragraphs: [
          "Read subsections (2) and (3) together and the shape is clear. An audit or a review is what the statute requires above $20,000.00 in annual revenue. Opting out is allowed, and it is not a board decision and not a permanent one: the statute puts the vote with the members, requires a majority of them, and requires it again every year.",
          "That distinction is the whole point of quoting the words rather than summarizing them. A board that believes it can decide to skip the audit has read a summary, and there are plenty of those. Several years with neither a report nor documentation of a member vote need review before the association makes its next annual decision.",
        ],
      },
      {
        heading: "What a subdivision member can ask for",
        paragraphs: [
          "For a corporation organized on a stock or membership basis, Section 487(2) gives a shareholder or member of record a qualified inspection right. It works differently from the condominium sections and does not apply merely because someone lives in the community.",
        ],
        callouts: [
          {
            type: "statutory",
            title: "MCL 450.2487(2), in part",
            text: "\"Any shareholder or member of record of a corporation that is organized on a stock or membership basis, in person or by attorney or other agent, may during regular business hours inspect for any proper purpose the corporation's stock ledger, a list of its shareholders or members, and its other books and records, if the shareholder or member gives the corporation written demand describing with reasonable particularity the purpose of the inspection and the records the shareholder or member desires to inspect, and the records sought are directly connected with the purpose.\"",
          },
        ],
        list: {
          title: "What that means in practice",
          items: [
            "**Proper purpose has a definition, in the same subsection.** It means \"a purpose that is reasonably related to a person's interest as a shareholder or member\".",
            "**Use one of the two locations the subsection names.** Deliver the demand to the corporation's registered office in Michigan or its principal place of business. Do not assume a manager's office qualifies; verify the corporation's filing and business address.",
            "**Date it.** Under Section 487(3), if the corporation does not permit the inspection within 5 business days of receiving the demand, or imposes unreasonable conditions on it, the member may apply to the circuit court for the county holding the principal place of business or registered office for an order compelling it.",
            "**What you asked for changes who has to prove what.** For the membership list, the corporation carries the burden of showing the purpose was improper. For the other books and records, the member carries the burden of showing the demand was in the right form, the purpose was proper, and the records asked for connect to it.",
            "**A current director has a separate path.** Section 487(4) says a director may examine corporate books and records for a purpose reasonably related to the director's position. A board taking control should identify whether it is acting through the corporation, a director, or an individual member before choosing its request.",
            "**Member access can be limited.** Under Section 487(7), corporate articles, bylaws or a board resolution may limit inspection after the required good-faith determination, including for privacy or free-association concerns. Section 487(8) then requires a reasonable way for members to communicate about director elections and other corporate affairs when the membership list is limited.",
            "**Copies may carry a reasonable charge.** Section 487(9)(b) allows the corporation to recover reasonable labor and material costs for copies. An inspection right is not a promise that every format is free.",
            "**For the member path, write one careful letter naming a real purpose**, rather than a broad request for everything. The demand is easier to evaluate when the records connect directly to the stated purpose.",
          ],
        },
      },
      {
        heading: "The handover list",
        paragraphs: [
          "Build the handover list before giving notice, then request the records and account controls through the authority the board, a director, or a qualifying member actually has. The management agreement may add turnover duties beyond the statutes discussed here.",
        ],
        list: {
          title: "What to ask for",
          items: [
            "**Recorded and governing.** The master deed or declaration and every recorded amendment, the bylaws, the articles of incorporation, current rules, and every board resolution still in force. Pull the recorded documents from the register of deeds as an independent check on what the manager identifies as current.",
            "**Financial.** The general ledger for this year and last, bank statements for every account the association holds, the reconciliation for each of those months, the budget as adopted and the meeting that adopted it, reserve account statements, filed tax returns, and every audit or review report.",
            "**Per unit or per lot.** For an authorized board handover, identify the owner roster and mailing addresses the association is entitled to hold, the balance owed and its as-of date, payment plans in force, and open violations with their notice dates. Do not treat an ordinary member's inspection right as permission to publish private owner data.",
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
          "Read the management agreement first for its termination, notice and turnover terms. Then check the governing documents and applicable law for any separate approval or notice requirement.",
          "Request the records while the agreement is still live. State whether the request comes from the association, a director, or a qualifying member; cite only a section that applies; list what you want; and name a date.",
          "Check what arrived against the list before the handover date. Missing records are easier to identify while the existing systems and contacts are still available.",
          "Then give notice, in the form the agreement requires. Certified mail, if that is what it says.",
          "Use the final handover period to move control: bank signatories, registered agent, processor, mailbox, and the vendors who need a new address for an invoice.",
        ],
        callout: {
          type: "warning",
          title: "Do not leave the records until last",
          text: "Giving notice before anyone inventories the records can turn the handover into a reconstruction. Know what the association has, what it is missing, and who controls each account before the final transfer date.",
        },
      },
      {
        heading: "Records worth checking twice",
        paragraphs: [
          "These five gaps can make a handover harder, and each is easier to close with a question than with a reconstruction.",
        ],
        list: {
          items: [
            "**Balances with no as-of date.** A list of amounts owed is worth little if nobody can say which day it was true. Ask for the date on the face of the report.",
            "**Vendor renewal dates.** Contracts arrive as scans and the renewal and cancellation dates sit in a paragraph in the middle. A board that misses one renews landscaping for a year on the old terms.",
            "**The monthly reconciliations.** Bank statements arrive and the reconciliation does not, because it lived in the manager's accounting system rather than in a file. Without it, the ledger and the bank are two numbers with nothing joining them.",
            "**Audit and review reports, and the opt-out votes.** See above. This is the gap that costs money later.",
            "**Owner mailing addresses of record.** The address an owner asked the association to use is not always the property address. Confirm the authorized address source before the next required notice.",
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
            "**Your notice and approval requirements.** Start with the management agreement, then check the governing documents and applicable law. A Michigan attorney can resolve a conflict among them.",
            "**Whether your declaration or bylaws require a member vote to change managers.** Some do. Read yours.",
            "**Which act covers you.** The recorded documents and corporate filing usually show the path. If they leave you unsure, put that focused question to a Michigan attorney.",
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

/**
 * READING TIME IS COUNTED, NOT TYPED.
 *
 * `readTime` used to be a string on each post. "9 min read" on the Michigan
 * post was my guess at the length of my own post, printed beside a real date
 * and a real author, where a guess reads as a measurement. This counts the
 * words a reader reads at 225 a minute. The rate is a stated assumption, the
 * count is not, and neither drifts when a post is edited.
 *
 * The index card and the post header both call this, so they cannot disagree.
 */
export function readingMinutes(post: BlogPost): number {
  const parts: string[] = [post.lede];
  for (const section of post.sections) {
    if (section.heading) parts.push(section.heading);
    parts.push(...section.paragraphs);
    for (const c of [section.callout, ...(section.callouts ?? [])]) {
      if (!c) continue;
      if (c.title) parts.push(c.title);
      parts.push(c.text);
    }
    if (section.list) {
      if (section.list.title) parts.push(section.list.title);
      parts.push(...section.list.items);
    }
  }
  const words = parts.join(" ").replace(/\*\*/g, "").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 225));
}
