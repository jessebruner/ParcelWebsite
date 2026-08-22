/**
 * Route manifest for the Common Parcel site.
 */

export interface Route {
  path: string;
  label: string;
  blurb?: string;
}

export const PRODUCT_NAV: Route[] = [
  { path: "/product/dues-and-payments", label: "Dues and payments", blurb: "Invoices on schedule, collects online when connected, and tracks balances." },
  { path: "/product/rules-and-enforcement", label: "Violations and notices", blurb: "Logs violations against your rules with proper cure periods." },
  { path: "/product/vendors-and-insurance", label: "Vendor contracts", blurb: "Tracks renewals, drafts quote requests for review, and checks invoices." },
  { path: "/product/meetings-and-voting", label: "Elections and meetings", blurb: "Digital voting, meeting notices, live quorum, and draft minutes." },
  { path: "/product/documents-and-answers", label: "Documents and setup", blurb: "Reads your governing documents and answers owner questions." },
  { path: "/product/resident-portal", label: "Resident portal", blurb: "Self-serve balances, request submissions, and documents." },
  { path: "/product/records-and-audit", label: "Proof for every decision", blurb: "Maintains official association records and traceable decisions." },
  { path: "/product/accounting-and-budgets", label: "Accounting and budgets", blurb: "Assisted bank reconciliation and verifiable budget tracking." },
  { path: "/product/collections", label: "Collections", blurb: "Graduated delinquency ladders following verified state notice periods." },
];

export const COMPANY_NAV: Route[] = [
  { path: "/about", label: "About", blurb: "Building software in Detroit for self-managed associations." },
  { path: "/why-common-parcel", label: "Why Common Parcel", blurb: "Why software built for a volunteer board works differently." },
  { path: "/blog", label: "Blog", blurb: "Practical guides and statutory references for self-managed associations." },
  { path: "/contact", label: "Contact", blurb: "Reach the Common Parcel team directly." },
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
  "/blog/board-transition-records-retention-checklist",
  "/blog/michigan-hoa-records-request",
  "/blog/how-to-run-a-smooth-hoa-annual-meeting",
  "/contact",
  "/privacy",
  "/terms",
  "/404",
];
