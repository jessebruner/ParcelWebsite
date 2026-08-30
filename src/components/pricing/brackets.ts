/**
 * THE PRICE, IN ONE PLACE.
 *
 * The rate card, the worked arithmetic and the live calculator all read from
 * here, so the table on the page and the number under the input cannot disagree.
 * The old page had the bracket maths written twice, once in the template and
 * once in the inline script, and the template's default said $76.00 for sixty
 * lots when the brackets say $80.00. Nobody saw it because the script overwrote
 * it on load, which means the one reader who had scripting off got a wrong
 * price. Imported by both sides now for exactly that reason.
 */

export interface Bracket {
  /** Inclusive ceiling of the band. null is the open top band. */
  upTo: number | null;
  rate: number;
  label: string;
}

export const DEFAULT_BRACKETS: Bracket[] = [
  { upTo: 10, rate: 2.5, label: "First 10" },
  { upTo: 70, rate: 1.1, label: "11 to 70" },
  { upTo: null, rate: 0.4, label: "71 and above" },
];

export const DEFAULT_MINIMUM = 10;

export interface Band extends Bracket {
  lots: number;
  amount: number;
}

export interface Price {
  bands: Band[];
  /** What the bands add to before the floor. */
  raw: number;
  /** What is billed. */
  total: number;
  perLot: number;
  /** True when the bands add to less than the monthly minimum. */
  floored: boolean;
  lots: number;
}

/** Graduated, like a tax bracket: each band is charged only on the lots in it. */
export function price(brackets: Bracket[], lots: number, minimum: number): Price {
  let last = 0;
  let remaining = lots;

  const bands: Band[] = brackets.map((b) => {
    const ceiling = b.upTo ?? Infinity;
    const inBand = Math.max(0, Math.min(remaining, ceiling - last));
    remaining -= inBand;
    last = ceiling;
    return { ...b, lots: inBand, amount: inBand * b.rate };
  });

  const raw = bands.reduce((t, b) => t + b.amount, 0);
  const total = Math.max(minimum, raw);
  return { bands, raw, total, perLot: total / lots, floored: raw < minimum, lots };
}

/** Two decimal places for a bill, none for a round comparison figure. */
export function money(n: number, dp = 2): string {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp })}`;
}

export function clampLots(n: number): number {
  if (!Number.isFinite(n)) return 1;
  return Math.max(1, Math.min(5000, Math.floor(n)));
}

/**
 * WHAT THE ALTERNATIVES COST, IN THE SAME PLACE AS THE PRICE.
 *
 * These three bars were homepage-only markup driven by the exported bundle's
 * own state. Replacing that widget with this component would have deleted the
 * only place on the site that says what a manager costs, so the figures moved
 * in here instead of being dropped. They are the same numbers the homepage has
 * been publishing: 18 dollars per door for a local manager, and other HOA
 * software at 1.55 per door with a 49 dollar floor. They are typical published
 * rates rather than quotes, and the card says so on the page.
 */
export interface Alternatives {
  /** Per door, per month, for a local management company. */
  managerRate: number;
  /** Per door, per month, for a tiered HOA software platform. */
  softwareRate: number;
  /** The monthly floor those platforms charge a small association. */
  softwareFloor: number;
}

export const DEFAULT_ALTERNATIVES: Alternatives = {
  managerRate: 18,
  softwareRate: 1.55,
  softwareFloor: 49,
};

export interface Comparison {
  manager: number;
  software: number;
}

export function alternatives(a: Alternatives, lots: number): Comparison {
  return {
    manager: lots * a.managerRate,
    software: Math.max(a.softwareFloor, lots * a.softwareRate),
  };
}
