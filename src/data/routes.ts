/**
 * Route manifest for the Common Parcel site.
 */

export interface Route {
  path: string;
  label: string;
  blurb?: string;
}

export const PRODUCT_NAV: Route[] = [
  { path: "/product/dues-and-payments", label: "Dues and payments", blurb: "Invoices on schedule, collects online, and reconciles your bank." },
  { path: "/product/rules-and-enforcement", label: "Violations and notices", blurb: "Logs violations against your rules with proper cure periods." },
  { path: "/product/vendors-and-insurance", label: "Vendor contracts", blurb: "Tracks renewals, gets competitive quotes, and checks invoices." },
  { path: "/product/meetings-and-voting", label: "Elections and meetings", blurb: "Digital voting, meeting notices, live quorum, and minutes." },
  { path: "/product/documents-and-answers", label: "Documents and setup", blurb: "Reads your governing documents and answers owner questions." },
  { path: "/product/resident-portal", label: "Resident portal", blurb: "Self-serve balances, online payments, and request submissions." },
  { path: "/product/records-and-audit", label: "Proof for every decision", blurb: "Maintains official association records and traceable decisions." },
  { path: "/product/accounting-and-budgets", label: "Accounting and budgets", blurb: "Nightly bank reconciliation and verifiable budget tracking." },
  { path: "/product/collections", label: "Collections", blurb: "Graduated delinquency ladders following state notice periods." },
];

export const COMPARE_NAV: Route[] = [
  { path: "/compare/management-company", label: "vs. Management Companies", blurb: "Compare self-management with Common Parcel to traditional management." },
  { path: "/compare/payhoa", label: "vs. PayHOA", blurb: "Compare dues collection against complete governance workflows." },
  { path: "/compare/buildium", label: "vs. Buildium", blurb: "Built for self-managed HOAs without per-seat complexity." },
  { path: "/compare/townsq", label: "vs. TownSq", blurb: "Focus on procedural governance and finances over social feeds." },
];

export const COMPANY_NAV: Route[] = [
  { path: "/about", label: "About", blurb: "Our mission to help associations save time and money." },
  { path: "/why-common-parcel", label: "Why Common Parcel", blurb: "The principles and architecture behind our platform." },
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
  "/compare/management-company",
  "/compare/payhoa",
  "/compare/buildium",
  "/compare/townsq",
  "/pricing",
  "/security",
  "/about",
  "/why-common-parcel",
  "/contact",
  "/privacy",
  "/terms",
  "/404",
];
