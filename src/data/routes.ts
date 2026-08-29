/**
 * EVERY ROUTE ON THE SITE, IN ONE PLACE.
 *
 * The masthead, the footer and the sitemap are all generated from this, and
 * `tools/check-links.mjs` fails the build if any internal link points at a path
 * that is not here, or if any path here has no page.
 *
 * The reason is a specific failure: an earlier attempt shipped a menu with
 * links to /hoa-laws and /pricing before those pages existed, so the navigation
 * 404'd. A menu item and its page now cannot get out of step, because the menu
 * is not written by hand.
 */

export interface Route {
  path: string;
  /** Nav label. Shorter than the page title. */
  label: string;
  /** One line, shown under the label in the product dropdown. */
  blurb?: string;
}

export const PRODUCT: Route[] = [
  { path: "/product/dues-and-payments", label: "Dues and payments", blurb: "Invoiced at the amount your declaration sets" },
  { path: "/product/collections", label: "Collections", blurb: "A ladder that runs on your state's periods" },
  { path: "/product/accounting-and-budgets", label: "Accounting and budgets", blurb: "Reconciled overnight, adopted on the record" },
  { path: "/product/rules-and-enforcement", label: "Rules and enforcement", blurb: "Cure windows, hearings, and what came before" },
  { path: "/product/meetings-and-voting", label: "Meetings and voting", blurb: "Notice, quorum, minutes, elections" },
  { path: "/product/documents-and-answers", label: "Documents and answers", blurb: "Ask your declaration a question" },
  { path: "/product/vendors-and-insurance", label: "Vendors and insurance", blurb: "Re-bid before the renewal passes" },
  { path: "/product/resident-portal", label: "Resident portal", blurb: "So owners stop calling you" },
];

export const COMPARE: Route[] = [
  { path: "/vs/payhoa", label: "vs PayHOA" },
  { path: "/vs/buildium", label: "vs Buildium" },
  { path: "/vs/townsq", label: "vs TownSq" },
  { path: "/vs/management-company", label: "vs a management company" },
];

export const BLOG_POSTS: Route[] = [
  { path: "/blog/hoa-records-request-deadline", label: "The records request clock, and what missing it costs" },
  { path: "/blog/hoa-developer-turnover", label: "Your developer handed over the association" },
  { path: "/blog/why-hoa-fines-get-thrown-out", label: "Why HOA fines get thrown out" },
  { path: "/blog/hoa-management-company-cost", label: "What a management company costs" },
];

export const COMPANY: Route[] = [
  { path: "/about", label: "About" },
  { path: "/security", label: "Security" },
  { path: "/contact", label: "Contact" },
  { path: "/demo", label: "See it running" },
  { path: "/changelog", label: "Changelog" },
];

export const LEGAL: Route[] = [
  { path: "/privacy", label: "Privacy" },
  { path: "/terms", label: "Terms" },
];

/** The top bar, left to right. */
export const TOP_NAV = [
  { label: "Product", panel: "product" as const },
  { label: "Compliance", path: "/compliance" },
  { label: "Use cases", path: "/use-cases" },
  { label: "Price", path: "/pricing" },
  { label: "Compare", panel: "compare" as const },
  { label: "Blog", path: "/blog" },
];

/** Highlights in the right rail of the product panel. */
export const PRODUCT_RAIL: Route[] = [
  { path: "/compliance", label: "How compliance works", blurb: "It reads the law, then watches it change" },
  { path: "/demo", label: "See it running", blurb: "Fifteen minutes, with your own documents" },
];

/** Everything, for the link checker and the sitemap. */
export const ALL_ROUTES: string[] = [
  "/",
  "/pricing",
  "/compliance",
  "/use-cases",
  "/blog",
  "/404",
  ...PRODUCT.map((r) => r.path),
  ...COMPARE.map((r) => r.path),
  ...BLOG_POSTS.map((r) => r.path),
  ...COMPANY.map((r) => r.path),
  ...LEGAL.map((r) => r.path),
];
