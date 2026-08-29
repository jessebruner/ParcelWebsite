/**
 * Route manifest for the Common Parcel site.
 */

export interface Route {
  path: string;
  label: string;
  blurb?: string;
  icon?:
    | "dues"
    | "collections"
    | "books"
    | "documents"
    | "vendors"
    | "meetings"
    | "rules"
    | "records"
    | "resident"
    | "about"
    | "difference"
    | "blog"
    | "contact";
}

/**
 * THE NINE PAGES, GROUPED BY THE QUESTION A BOARD IS ASKING.
 *
 * Nine labels in one flat column is a list you have to read all of before you
 * can choose from it, and it was the same list in the dropdown and on
 * /product. The group names are Jesse's own, from the prototype
 * ("Product Pages.dc.html"), and they are kept verbatim so the three pages
 * that prototype has and this site does not -- Legal Compliance, Procurement,
 * Voting split from Meetings -- drop into an existing column rather than
 * forcing the grouping to be redrawn.
 *
 * The columns are uneven, three down to one, and the ORDER is the prototype's
 * too: Money in, Compliance, Property and spend, Governance, People. It was
 * briefly not. I led with the two three-item columns, which is the
 * length-driven ordering the sentence above rejects, and Codex caught that the
 * note and the array disagreed. Evening the columns out, or sorting them by
 * how full they are, would both mean grouping by column length instead of by
 * the question -- which is the thing the grouping is for.
 *
 * Records and audit sits under Governance rather than Compliance. The
 * prototype files records REQUESTS under Legal Compliance because they are a
 * statutory clock; our page is about keeping the file so the next board can
 * open it, which is a governance job.
 */
export interface RouteGroup {
  name: string;
  items: Route[];
}

export const PRODUCT_GROUPS: RouteGroup[] = [
  {
    name: "Money in",
    items: [
      { path: "/product/dues-and-payments", label: "Dues and payments", blurb: "Bills every lot what your declaration says it owes.", icon: "dues" },
      { path: "/product/collections", label: "Collections", blurb: "Late accounts move on a plan the board controls.", icon: "collections" },
      { path: "/product/accounting-and-budgets", label: "Accounting and budgets", blurb: "Books that match the bank, month by month.", icon: "books" },
    ],
  },
  {
    name: "Compliance",
    items: [
      { path: "/product/documents-and-answers", label: "Documents and answers", blurb: "Your declaration, read, with the page every figure came from.", icon: "documents" },
    ],
  },
  {
    name: "Property and spend",
    items: [
      { path: "/product/vendors-and-insurance", label: "Vendors and insurance", blurb: "Fresh prices before a contract renews on its own.", icon: "vendors" },
    ],
  },
  {
    name: "Governance",
    items: [
      { path: "/product/meetings-and-voting", label: "Meetings and voting", blurb: "Notice on your bylaws' clock, and quorum you can prove.", icon: "meetings" },
      { path: "/product/rules-and-enforcement", label: "Violations and notices", blurb: "The same rule enforced the same way for every lot.", icon: "rules" },
      { path: "/product/records-and-audit", label: "Records and audit", blurb: "Minutes, resolutions and ledgers the next board can find.", icon: "records" },
    ],
  },
  {
    name: "People",
    items: [
      { path: "/product/resident-portal", label: "Resident portal", blurb: "Owners pay and look up their own rules.", icon: "resident" },
    ],
  },
];

/** The two destinations that are not one of the nine features. */
export const PRODUCT_WIDE: Route[] = [
  { path: "/product", label: "Everything Common Parcel does" },
  { path: "/security", label: "Security" },
];


/* PRODUCT_NAV was a second, differently-worded copy of the same nine pages.
   PRODUCT_GROUPS above replaced its last caller when the panel was grouped,
   and two lists of one set of pages is how a blurb ends up saying two things.
*/
export const COMPANY_NAV: Route[] = [
  { path: "/about", label: "About", blurb: "Building software in Detroit for self-managed associations.", icon: "about" },
  { path: "/why-common-parcel", label: "Why Common Parcel", blurb: "Why software built for a volunteer board works differently.", icon: "difference" },
  { path: "/blog", label: "Blog", blurb: "Practical guides and statutory references for self-managed associations.", icon: "blog" },
  { path: "/contact", label: "Contact", blurb: "Reach the Common Parcel team directly.", icon: "contact" },
];

export const TOP_NAV: Route[] = [
  { path: "/product", label: "Product" },
  { path: "/pricing", label: "Pricing" },
  { path: "/about", label: "Company" },
  { path: "/contact", label: "Contact" },
];

export const COMPANY: Route[] = [
  { path: "/about", label: "About" },
  { path: "/why-common-parcel", label: "Why Common Parcel" },
  { path: "/blog", label: "Blog" },
  { path: "/pricing", label: "Pricing" },
  { path: "/security", label: "Security" },
  { path: "/contact", label: "Contact" },
];

export const LEGAL: Route[] = [
  { path: "/privacy", label: "Privacy" },
  { path: "/terms", label: "Terms" },
];

export const ALL_ROUTES: string[] = [
  "/",
  "/product",
  "/product/dues-and-payments",
  "/product/collections",
  "/product/accounting-and-budgets",
  "/product/rules-and-enforcement",
  "/product/meetings-and-voting",
  "/product/documents-and-answers",
  "/product/vendors-and-insurance",
  "/product/resident-portal",
  "/product/records-and-audit",
  "/pricing",
  "/security",
  "/about",
  "/why-common-parcel",
  "/blog",
  "/blog/review-hoa-budget-before-board-vote",
  "/blog/hoa-vendor-contract-renewal-checklist",
  "/blog/hoa-invoice-approval-checklist",
  "/blog/board-transition-records-retention-checklist",
  "/blog/michigan-hoa-records-request",
  "/blog/how-to-run-a-smooth-hoa-annual-meeting",
  "/contact",
  "/privacy",
  "/terms",
  "/404",
];
