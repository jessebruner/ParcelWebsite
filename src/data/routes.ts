/**
 * Route manifest for the Common Parcel site.
 */

export interface Route {
  path: string;
  label: string;
  blurb?: string;
}

export const TOP_NAV: Route[] = [
  { path: "/pricing", label: "Pricing" },
  { path: "/security", label: "Security" },
  { path: "/about", label: "About" },
  { path: "/contact", label: "Contact" },
];

export const COMPANY: Route[] = [
  { path: "/pricing", label: "Pricing" },
  { path: "/security", label: "Security" },
  { path: "/about", label: "About" },
  { path: "/contact", label: "Contact" },
];

export const LEGAL: Route[] = [
  { path: "/privacy", label: "Privacy" },
  { path: "/terms", label: "Terms" },
];

export const ALL_ROUTES: string[] = [
  "/",
  "/pricing",
  "/security",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/404",
];
