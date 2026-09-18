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

/** Product navigation grouped by the work a board needs to do. */
export interface RouteGroup {
  name: string;
  items: Route[];
}

export const PRODUCT_GROUPS: RouteGroup[] = [
  {
    name: "Finances",
    items: [
      { path: "/product/dues-and-payments", label: "Dues and payments", blurb: "Collect dues and see who has paid.", icon: "dues" },
      { path: "/product/collections", label: "Collections", blurb: "Track unpaid dues and review notices.", icon: "collections" },
      { path: "/product/accounting-and-budgets", label: "Accounting and budgets", blurb: "Track income, expenses, and budgets.", icon: "books" },
    ],
  },
  {
    name: "Documents",
    items: [
      { path: "/product/documents-and-answers", label: "Documents and answers", blurb: "Ask questions and read the source.", icon: "documents" },
    ],
  },
  {
    name: "Property",
    items: [
      { path: "/product/vendors-and-insurance", label: "Vendors and insurance", blurb: "Track contracts and renewal dates.", icon: "vendors" },
    ],
  },
  {
    name: "Board work",
    items: [
      { path: "/product/meetings-and-voting", label: "Meetings and voting", blurb: "Plan meetings and record decisions.", icon: "meetings" },
      { path: "/product/rules-and-enforcement", label: "Violations and requests", blurb: "Review cases and home improvement requests.", icon: "rules" },
      { path: "/product/records-and-audit", label: "Association records", blurb: "Keep records available as officers change.", icon: "records" },
    ],
  },
  {
    name: "Residents",
    items: [
      { path: "/product/resident-portal", label: "Resident portal", blurb: "Let owners pay, read documents, and send requests.", icon: "resident" },
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
  { path: "/why-common-parcel", label: "Why Common Parcel", blurb: "How Common Parcel helps volunteer boards.", icon: "difference" },
  { path: "/blog", label: "Board guides", blurb: "Checklists for meetings, budgets, and board changes.", icon: "blog" },
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
  { path: "/blog", label: "Board guides" },
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
