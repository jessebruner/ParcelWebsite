/**
 * Route manifest for the Common Parcel site.
 */

export interface Route {
  path: string;
  label: string;
  blurb?: string;
}

export const PRODUCT_NAV: Route[] = [
  { path: "/product", label: "Product Overview", blurb: "See the complete operating system for self-managed HOAs." },
  { path: "/product/dues-accounting", label: "Dues & Financials", blurb: "Automated billing, direct bank settlement, and instant reconciliation." },
  { path: "/product/resident-portal", label: "Resident Portal", blurb: "Self-serve payments, maintenance requests, and announcements." },
  { path: "/product/architectural-reviews", label: "Architectural Reviews", blurb: "Structured ARC submissions, committee reviews, and notice logs." },
  { path: "/product/governance-records", label: "Governance & Records", blurb: "Digital voting, meeting minutes, and permanent document archives." },
];

export const COMPARE_NAV: Route[] = [
  { path: "/compare/management-companies", label: "vs. Management Companies", blurb: "Save thousands each year while keeping full board oversight." },
  { path: "/compare/legacy-software", label: "vs. Legacy HOA Software", blurb: "Modern software with transparent pricing and zero hidden fees." },
];

export const COMPANY_NAV: Route[] = [
  { path: "/about", label: "About", blurb: "Our mission to help HOAs save time, save money, and build community." },
  { path: "/why-common-parcel", label: "Why Common Parcel", blurb: "The principles and architecture behind our platform." },
  { path: "/blog", label: "Blog", blurb: "Practical guides and operational insights for board officers." },
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
  "/product/dues-accounting",
  "/product/resident-portal",
  "/product/architectural-reviews",
  "/product/governance-records",
  "/compare/management-companies",
  "/compare/legacy-software",
  "/pricing",
  "/security",
  "/about",
  "/why-common-parcel",
  "/blog",
  "/contact",
  "/privacy",
  "/terms",
  "/404",
];
