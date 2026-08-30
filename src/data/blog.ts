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
  /**
   * Optional, because a section may be a checklist and nothing else.
   *
   * This was required, and a post whose first section was a bare run sheet
   * did not just fail its own page: astro build errored and left dist
   * incomplete, so npm run verify could not run at all. A schema that takes
   * the whole build down when a writer omits an optional-looking field is a
   * schema problem, not a writer problem.
   */
  paragraphs?: string[];
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
  artSubject: "meeting" | "handoff" | "records" | "budget" | "renewal" | "payments";
  lede: string;
  sections: BlogSection[];
  citations: Citation[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "review-hoa-budget-before-board-vote",
    title: "How to review an HOA budget before the vote",
    description: "A plain-language review of income, recurring bills, reserves, and assumptions before the board votes.",
    publishedAt: "2026-08-24",
    author: {
      name: "Common Parcel",
      role: "Detroit, Michigan",
    },
    category: "Financial Controls",
    artSubject: "budget",
    lede: "A budget can balance on paper and still leave the board short in July. Before the vote, trace each major line to a contract, an actual expense, or a decision the board can explain.",
    sections: [
      {
        heading: "Start with what the association actually spent",
        paragraphs: [
          "Put the current budget beside year-to-date actuals and the prior full year. The differences tell you where the old plan was wrong, where a one-time event distorted the total, and which bills changed without anyone noticing.",
          "Do not copy every actual expense into the new budget. First ask why it moved. A snow season, insurance claim, emergency repair, or vacant contract can make one year a poor forecast for the next.",
        ],
      },
      {
        heading: "Check the income assumption",
        paragraphs: [
          "Calculate assessment income: multiply the number of lots or units by the rate the association plans to charge. Keep unpaid balances from prior years separate from current-year income so the same dollar is not counted twice.",
          "If the plan assumes every owner pays on time, say so. If recent collections have been lower, show what happens when that pattern continues. An assumption the board can see is easier to change than a shortfall hidden inside one total.",
        ],
      },
      {
        heading: "Put each recurring bill on the calendar",
        list: {
          title: "For every contract and recurring bill",
          items: [
            "Record the current price and how often it is billed",
            "Mark the renewal date and the last day to cancel or renegotiate",
            "Check for a scheduled increase, minimum charge, or fuel adjustment",
            "Separate planned projects from ordinary service",
            "Name the document or quote behind the number",
          ],
        },
      },
      {
        heading: "Decide what the reserve contribution is for",
        paragraphs: [
          "A reserve contribution should not be whatever remains after operating expenses. Tie it to the association's known long-term work, its current reserve information, and the board's plan for updating that information.",
          "If the board cannot explain the number, pause before the vote. A reserve professional, accountant, or local adviser can help where the association's records leave a real gap.",
        ],
      },
      {
        heading: "Make the vote easy to explain",
        paragraphs: [
          "Give directors the proposed budget, the important assumptions, and the largest year-over-year changes before the meeting. During the vote, record the version adopted and any amendment made in the room.",
          "Afterward, keep the adopted budget with the minutes and the supporting contracts or worksheets. The next board should be able to see not only the number, but why this board chose it.",
        ],
        callout: {
          type: "note",
          title: "Your documents set the process",
          text: "The declaration, bylaws, adopted policies, and applicable law may set approval, notice, or owner-ratification steps. This checklist helps review the numbers; it does not decide which procedure applies to your association.",
        },
      },
    ],
    citations: [],
  },
  {
    slug: "hoa-vendor-contract-renewal-checklist",
    title: "Before an HOA vendor contract renews: a board checklist",
    description: "What to read, compare, decide, and save before a landscaping, snow, insurance, or maintenance contract rolls over.",
    publishedAt: "2026-08-24",
    author: {
      name: "Common Parcel",
      role: "Detroit, Michigan",
    },
    category: "Operations",
    artSubject: "renewal",
    lede: "Auto-renewal is quiet. By the time someone remembers the contract, the cancellation window may already be closed. Put the dates, performance notes, and board decision in one place before that happens.",
    sections: [
      {
        heading: "Read the renewal paragraph first",
        paragraphs: [
          "Find the current term, what happens at the end of it, and the exact deadline for giving notice. Then read how notice must be delivered and where it must go. A date in a spreadsheet is useful only if it matches the signed contract.",
          "Look for price increases, minimum terms, service-level changes, and language that makes a new term different from the old one. Put those details beside the deadline instead of leaving them buried in the PDF.",
        ],
      },
      {
        heading: "Review the work before you review the price",
        list: {
          title: "Questions for the board and site contact",
          items: [
            "Was the promised work completed on schedule?",
            "Which complaints repeated, and how were they resolved?",
            "Did the scope change informally during the year?",
            "Are current insurance records and licenses on file where required?",
            "Would the board buy the same scope again at today's price?",
          ],
        },
      },
      {
        heading: "Compare the same scope",
        paragraphs: [
          "If the board seeks another proposal, give each vendor the same property facts, service schedule, exclusions, and response expectations. A lower total can hide fewer visits, a smaller area, or work billed separately.",
          "Write the differences down before choosing. The useful comparison is not three prices. It is three scopes the board can place side by side.",
        ],
      },
      {
        heading: "Decide early enough to act",
        paragraphs: [
          "Put the renewal on a board agenda before the notice deadline. Record whether the board is renewing, renegotiating, rebidding, or ending the agreement, and who is responsible for the next step.",
          "If the board sends notice, keep the signed notice and proof of delivery with the contract. If it renews, store the new term, price, and next deadline in the same record. The job is not finished when the vote ends.",
        ],
        callout: {
          type: "warning",
          title: "Use the signed contract",
          text: "This checklist does not interpret your agreement. If the renewal or cancellation language is unclear, get advice before relying on a date or delivery method.",
        },
      },
    ],
    citations: [],
  },
  {
    slug: "hoa-invoice-approval-checklist",
    title: "What to check before your HOA pays an invoice",
    description: "A short approval check for the vendor, work, contract, budget, and payment instructions behind an HOA bill.",
    publishedAt: "2026-08-24",
    author: {
      name: "Common Parcel",
      role: "Detroit, Michigan",
    },
    category: "Financial Controls",
    artSubject: "payments",
    lede: "The invoice may look familiar. That is not enough. Match it to the vendor, the work, the contract, the budget, and the payment instructions before anyone approves it.",
    sections: [
      {
        heading: "Confirm that the bill belongs to the association",
        paragraphs: [
          "Check the legal or trade name against the vendor record. Read the invoice number, service address, service dates, and description of work. A familiar logo does not prove the association ordered or received what appears on the page.",
          "For a new vendor or an unusual bill, ask the board member or site contact who requested the work to confirm it. Keep that confirmation with the invoice rather than in a private text thread nobody else can find.",
        ],
      },
      {
        heading: "Match the charge to the contract and the work",
        list: {
          title: "Before approval",
          items: [
            "Compare the rate, quantity, and extra charges with the signed agreement or approved quote",
            "Confirm the work was completed or the milestone was reached",
            "Check the correct budget line and the amount still available",
            "Resolve a duplicate invoice number or unexplained balance before paying",
            "Attach the contract, quote, receipt, or completion note that supports the charge",
          ],
        },
      },
      {
        heading: "Keep preparation and approval separate",
        paragraphs: [
          "One person can assemble the invoice and its supporting record. Another authorized officer should review what will be paid before the bank instruction is released. The association's own policy and bank permissions decide the exact approval path.",
          "That second look should be visible in the record: who reviewed it, what they approved, and when. An approval that exists only in someone's memory will not help the next treasurer reconstruct the payment.",
        ],
      },
      {
        heading: "Treat changed payment instructions as a new request",
        paragraphs: [
          "A message that changes a vendor's bank account or payment procedure deserves an independent check. Call a known contact using a number already on file or found separately, not the phone number inside the message asking for the change.",
          "The FBI gives the same advice for business email compromise: verify payment requests and any change in account number or payment procedure with the person making the request. Urgency is a reason to slow down, not skip the check.",
        ],
        callout: {
          type: "warning",
          title: "If money went to the wrong account",
          text: "Contact the association's financial institution immediately. The FBI also directs victims of business email compromise to report it through the Internet Crime Complaint Center at ic3.gov.",
        },
      },
      {
        heading: "Leave a record the next treasurer can follow",
        paragraphs: [
          "Store the invoice, supporting document, approval, payment confirmation, and any corrected instructions together. The ledger entry should point back to that packet.",
          "A clean payment record answers five questions without a phone call: who was paid, for what, under which agreement, who approved it, and when the money left the association's account.",
        ],
      },
    ],
    citations: [
      {
        source: "Federal Bureau of Investigation",
        section: "Protect yourself",
        title: "Business Email Compromise",
        retrievedAt: "2026-08-24",
        url: "https://www.fbi.gov/how-we-can-help-you/common-frauds-and-scams/business-email-compromise",
        note: "Guidance on independently verifying payment requests and changes to account numbers or payment procedures.",
      },
    ],
  },
  {
    slug: "how-to-run-a-smooth-hoa-annual-meeting",
    title: "How to run a smooth HOA annual meeting",
    description: "A practical run sheet for the notice, agenda, quorum count, election, and minutes.",
    publishedAt: "2026-08-22",
    author: {
      name: "Common Parcel",
      role: "Detroit, Michigan",
    },
    category: "Board Governance",
    artSubject: "meeting",
    lede: "A missed notice or one short quorum count can force a do-over. Use this run sheet to prepare the notice, room, ballot count, and minutes.",
    sections: [
      {
        heading: "The annual meeting run sheet",
        list: {
          title: "Run sheet checklist",
          items: [
            "Calendar the meeting date and book the venue early",
            "Send the required notice to everyone entitled to receive it and archive proof of notice",
            "Prepare an agenda and the ballot materials your rules require",
            "Confirm quorum requirements in advance",
            "Start on time and explain the meeting's speaking rules",
            "Follow the required ballot-counting process and record the result in the minutes",
            "Draft formal minutes directly from the meeting record",
          ],
        },
        callout: {
          type: "note",
          title: "Your documents come first",
          text: "Notice windows, quorum thresholds, voting rules, speaking rights, and minute approval can vary. Read the recorded declaration, articles, bylaws, and any state law that applies before setting the meeting rules. If two sources seem to conflict, get local advice rather than guessing.",
        },
      },
      {
        heading: "Set the date early and send notice",
        paragraphs: [
          "Put the date on the calendar the day after the last annual meeting. Good venues book out. So do the officers you need in the room.",
          "Send the required notice to everyone entitled to receive it, using the address or delivery method your records support. Use the notice window that applies to your association. If two sources appear to set different periods, resolve that conflict before sending.",
          "A useful notice clearly names the date, time, place, matters members will vote on, and remote-participation instructions where applicable. Keep a copy of what you sent and when. If someone contests the meeting later, that record helps show what notice the board sent and when.",
        ],
      },
      {
        heading: "Build the agenda and run the election",
        paragraphs: [
          "Prepare an agenda that matches the business in the meeting notice. Give it to attendees and follow it so owners can see where the meeting is going.",
          "If directors are elected at this meeting, follow the nomination, ballot, proxy, secrecy, and counting rules that apply to your association. Record the result in the minutes without exposing a ballot that must remain private.",
        ],
      },
      {
        heading: "Plan for the short count and run the room",
        paragraphs: [
          "Quorum is the minimum participation required before the meeting can conduct business. Know the threshold before the meeting so nobody is guessing in the room. If the count falls short, pause before taking business and follow the adjournment or reconvening rule that applies.",
          "Start on time. Keep each item to its block. Explain the speaking rules at the start and apply them consistently. One person speaks at a time.",
          "Minutes record what was decided and who was elected, not a transcript. Draft them from the meeting record, then route them through the approval process your association uses.",
        ],
      },
      {
        heading: "The year's quiet work behind the meeting",
        paragraphs: [
          "The annual meeting sits on the year's quiet work: the dues billed and collected, the books kept current, the notices sent and filed, and the election run. Common Parcel keeps that record for self-managed associations so volunteer directors get their evenings back.",
        ],
      },
    ],
    citations: [],
  },
  {
    slug: "board-transition-records-retention-checklist",
    title: "HOA board transition checklist: records every new board needs",
    description: "The accounts, contracts, owner requests, and meeting records an incoming HOA board needs on day one.",
    publishedAt: "2026-08-22",
    author: {
      name: "Common Parcel",
      role: "Detroit, Michigan",
    },
    category: "Board Governance",
    artSubject: "handoff",
    lede: "Board turnover goes badly when the incoming officers inherit passwords they cannot reset, contracts they cannot find, and bank records no one can explain. Use this checklist before outgoing officers lose access.",
    sections: [
      {
        heading: "Build the handover before the term ends",
        paragraphs: [
          "Start while the outgoing officers can still open every account and explain every folder. A zip file handed over on election night is not a transition plan.",
          "Use one checklist with an owner and a transfer status for every account, record set, key, and unfinished decision. The new board should be able to see what arrived and what is still missing.",
        ],
        list: {
          title: "Start with these handover items",
          items: [
            "Association email accounts and shared file storage",
            "Bank, accounting, payment, insurance, and vendor portals",
            "Website, domain, mailing address, locks, keys, and access codes",
            "Current officer roster, vendor contacts, and emergency contacts",
          ],
        },
      },
      {
        heading: "Move access out of personal accounts",
        paragraphs: [
          "A new treasurer should not need the former treasurer's personal email to reset the bank password. Move each service to an association-controlled address, then add the incoming officers with their own accounts.",
          "Test the new access before removing the old officer. Record who can administer each service, who can only view it, and who can approve a payment or change.",
        ],
      },
      {
        heading: "Reconcile the money before access changes",
        paragraphs: [
          "The incoming treasurer needs a starting point they can prove. Match the bank balance to the ledger, list every unpaid invoice, and explain every item that is still unreconciled.",
        ],
        list: {
          title: "Financial handover",
          items: [
            "Bank statements, current ledger, and the latest reconciliation",
            "Approved budget, reserve records, and current assessment schedule",
            "Open invoices, reimbursements, deposits, and delinquent balances",
            "Signed contracts with renewal, cancellation, and payment dates",
          ],
        },
      },
      {
        heading: "Name every open decision",
        paragraphs: [
          "Do not make the next board reconstruct unfinished work from an inbox. List each open item, the last action taken, the next deadline, and the person waiting for an answer.",
        ],
        list: {
          title: "Open work to carry forward",
          items: [
            "Owner requests and architectural applications awaiting a decision",
            "Rule or collection matters and the stage each one has reached",
            "Vendor work orders, insurance claims, and promised follow-ups",
            "Upcoming meetings, notice dates, elections, filings, and renewals",
          ],
        },
        callout: {
          type: "warning",
          title: "Do not delete yet",
          text: "Your governing documents, state law, contracts, insurer, and tax advisers may set retention requirements. Confirm what applies before anyone deletes or destroys a record.",
        },
      },
      {
        heading: "Close the handover at a board meeting",
        paragraphs: [
          "Put the handover on the agenda. Record what the board received, which access was tested, what is still missing, and who will close each gap.",
          "Remove former officers only after the new access works. Keep the completed checklist with the meeting record so the next transition starts from a known point.",
        ],
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
      "Michigan condominium co-owners and subdivision members may use different records laws. Read the quoted sections, then build the handover list.",
    publishedAt: "2026-08-22",
    author: {
      name: "Common Parcel",
      role: "Detroit, Michigan",
    },
    category: "Statutory Guidance",
    artSubject: "records",
    lede:
      "Leaving a management company gets risky when the board discovers it never held its own records. Michigan gives some co-owners, members, and directors ways to ask first, but the right route depends on how the community and association were created.",
    sections: [
      {
        heading: "Start with which law covers you",
        paragraphs: [
          "This guide follows two Michigan records paths that often matter to self-managed boards. They are not the only legal forms a community can take. Quoting a section that does not apply can leave the association relying on a right it does not have.",
          "**A condominium.** If your community was created by a recorded master deed and your neighbors are co-owners of units, the Michigan Condominium Act, 1978 PA 59, covers you. That act uses the terms \"association of co-owners\" and \"condominium project\". Its records sections are quoted below.",
          "**A subdivision association that is not a condominium.** Its records rights may come from the recorded declaration and bylaws and, if the association is incorporated under it, the Michigan Nonprofit Corporation Act, 1982 PA 162.",
          "One trap worth naming, because it catches boards and it nearly caught this guide. A site condominium is a condominium. Owners hold a unit that happens to be a building envelope on land rather than an apartment, the lawns look like any subdivision, and the Condominium Act applies anyway. What the street looks like decides nothing.",
          "Start with the recorded document that created the community and the association's state business filing. A recorded master deed points toward the Condominium Act. A declaration of covenants and a nonprofit filing may point toward the corporate path. Those records tell you which question you are asking. If they still leave it unclear, that is a cheap question to put to a Michigan attorney.",
        ],
        callout: {
          type: "note",
          title: "The procedures are different",
          text: "MCL 559.157(1) says condominium records must be available at convenient times and does not state a written-demand or proper-purpose requirement. MCL 450.2487(2) requires a qualifying corporate member to make a particular written demand for a proper purpose. Neither section names a deadline, and neither says a request costs nothing.",
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
        heading: "Check the audit rule before the handover",
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
          "That distinction is the whole point of quoting the words rather than summarizing them. A board that believes it can decide to skip the audit has read a summary, and there are plenty of those. Several years with neither a report nor documentation of a member vote is a gap the next board inherits. Find it while the manager is still under contract, not after.",
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
          "Check what arrived against the list before the handover date. This is the step boards skip, and it is the one the old systems and the people who know them are still around for.",
          "Then give notice, in the form the agreement requires. Certified mail, if that is what it says.",
          "Use the final handover period to move control: bank signatories, registered agent, processor, mailbox, and the vendors who need a new address for an invoice.",
        ],
        callout: {
          type: "warning",
          title: "Do not leave the records until last",
          text: "The handover that turns into a reconstruction is the one where notice went out before anyone inventoried the records. Know what the association has, what is missing, and who controls each account before the final transfer date.",
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
  return [...BLOG_POSTS].sort(
    (a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.title.localeCompare(b.title)
  );
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
    parts.push(...(section.paragraphs ?? []));
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
