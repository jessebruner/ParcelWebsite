/**
 * COVERAGE, MEASURED RATHER THAN CLAIMED.
 *
 * Every number here was counted out of ParcelHOA's `src/lib/statute/data` by
 * walking `JURISDICTIONS` with `collectFacts` and `coverageOf`, the same two
 * functions the product's own dashboard counts with. It is a snapshot, and the
 * date it was taken is published beside it, because a coverage figure with no
 * date is the one kind of number on this page that could quietly become false.
 *
 * **Why `JURISDICTIONS` and not `ALL_JURISDICTIONS`.** The state files hold what
 * a reader wrote; the store the application reads is that plus what checking it
 * established. Twenty-four values two independent readers disagreed about are
 * demoted to unread there, so the raw files count 182 verified where the store
 * answers 165. The store is what a board is actually served, so the store is
 * what this page reports.
 *
 * This should be generated from that data rather than transcribed, and cannot be
 * yet: the site and the product are separate repositories with separate builds.
 * Until they share one, `MEASURED_ON` is the honest guard.
 */

/** When these counts were taken out of the statute store. */
export const MEASURED_ON = "18 August 2026";

/** Jurisdiction code, provisions read, provisions held. */
export type Row = readonly [code: string, read: number, held: number];

export const NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "District of Columbia",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois",
  IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana",
  ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan",
  MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana",
  NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota",
  OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania",
  PR: "Puerto Rico", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
  VA: "Virginia", VI: "US Virgin Islands", WA: "Washington",
  WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};

/** Alphabetical by code, so a reader can find their state without hunting. */
export const COVERAGE: Row[] = [
  ["AK", 4, 14], ["AL", 12, 14], ["AR", 0, 14], ["AZ", 12, 14], ["CA", 9, 14],
  ["CO", 11, 14], ["CT", 12, 14], ["DC", 6, 14], ["DE", 11, 14], ["FL", 12, 15],
  ["GA", 0, 14], ["HI", 10, 14], ["IA", 11, 14], ["ID", 10, 14], ["IL", 10, 14],
  ["IN", 5, 14], ["KS", 13, 14], ["KY", 11, 14], ["LA", 9, 14], ["MA", 8, 14],
  ["MD", 11, 14], ["ME", 13, 14], ["MI", 2, 14], ["MN", 11, 14], ["MO", 11, 14],
  ["MS", 0, 14], ["MT", 3, 14], ["NC", 5, 14], ["ND", 3, 14], ["NE", 11, 14],
  ["NH", 14, 14], ["NJ", 3, 14], ["NM", 14, 14], ["NV", 13, 14], ["NY", 2, 14],
  ["OH", 8, 14], ["OK", 6, 14], ["OR", 8, 14], ["PA", 9, 14], ["PR", 11, 14],
  ["RI", 14, 14], ["SC", 7, 14], ["SD", 0, 14], ["TN", 1, 14], ["TX", 9, 14],
  ["UT", 10, 14], ["VA", 9, 14], ["VI", 0, 14], ["VT", 13, 14], ["WA", 6, 14],
  ["WI", 3, 14], ["WV", 10, 14], ["WY", 0, 14],
];

/**
 * The totals, kept as constants rather than summed here.
 *
 * `read` and `held` do sum from `COVERAGE`, and `verified` / `silent` cannot:
 * a finding of silence and a value are both read, and the split between them is
 * only visible inside the fact. Both are stated so the page can say what the
 * 416 is made of.
 */
export const TOTALS = {
  jurisdictions: 53,
  held: 743,
  read: 416,
  unread: 327,
  /** Read, and the statute sets a rule. */
  verified: 165,
  /** Read, and the statute imposes nothing. */
  silent: 251,
  /** Values two independent readers disagreed about, of 490 compared. */
  contested: 24,
  compared: 490,
} as const;

export const NOTHING_READ = ["AR", "GA", "MS", "SD", "VI", "WY"];
export const READ_IN_FULL = ["NH", "NM", "RI"];
