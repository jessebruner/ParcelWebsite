import test from "node:test";
import assert from "node:assert/strict";
import { price, DEFAULT_BRACKETS, DEFAULT_MINIMUM } from "../src/components/pricing/brackets.ts";

test("pricing boundary cases", () => {
  // 1 lot: floored to $10 minimum
  const p1 = price(DEFAULT_BRACKETS, 1, DEFAULT_MINIMUM);
  assert.equal(p1.total, 10);
  assert.equal(p1.floored, true);

  // 4 lots: 4 * $2.50 = $10 (exactly minimum)
  const p4 = price(DEFAULT_BRACKETS, 4, DEFAULT_MINIMUM);
  assert.equal(p4.total, 10);
  assert.equal(p4.floored, false);

  // 5 lots: 5 * $2.50 = $12.50
  const p5 = price(DEFAULT_BRACKETS, 5, DEFAULT_MINIMUM);
  assert.equal(p5.total, 12.5);
  assert.equal(p5.floored, false);

  // 10 lots: 10 * $2.50 = $25
  const p10 = price(DEFAULT_BRACKETS, 10, DEFAULT_MINIMUM);
  assert.equal(p10.total, 25);

  // 11 lots: $25 + 1 * $1.10 = $26.10
  const p11 = price(DEFAULT_BRACKETS, 11, DEFAULT_MINIMUM);
  assert.equal(p11.total, 26.1);

  // 70 lots: $25 + 60 * $1.10 = $91
  const p70 = price(DEFAULT_BRACKETS, 70, DEFAULT_MINIMUM);
  assert.equal(p70.total, 91);

  // 71 lots: $91 + 1 * $0.40 = $91.40
  const p71 = price(DEFAULT_BRACKETS, 71, DEFAULT_MINIMUM);
  assert.equal(Math.round(p71.total * 100) / 100, 91.4);

  // 100 lots: $91 + 30 * $0.40 = $103
  const p100 = price(DEFAULT_BRACKETS, 100, DEFAULT_MINIMUM);
  assert.equal(p100.total, 103);

  // 319 lots: $91 + 249 * $0.40 = $190.60
  const p319 = price(DEFAULT_BRACKETS, 319, DEFAULT_MINIMUM);
  assert.equal(Math.round(p319.total * 100) / 100, 190.6);

  // 1000 lots: $91 + 930 * $0.40 = $463
  const p1000 = price(DEFAULT_BRACKETS, 1000, DEFAULT_MINIMUM);
  assert.equal(p1000.total, 463);
});

test("monotonic properties (1 to 1200 lots)", () => {
  let prevTotal = 0;
  let prevPerLot = Infinity;

  for (let lots = 1; lots <= 1200; lots++) {
    const res = price(DEFAULT_BRACKETS, lots, DEFAULT_MINIMUM);
    
    // Total price is non-decreasing
    assert.ok(res.total >= prevTotal, `Total price should not decrease at lot ${lots}`);

    // Marginal rate never increases
    if (lots > 1) {
      const marginal = res.raw - price(DEFAULT_BRACKETS, lots - 1, DEFAULT_MINIMUM).raw;
      assert.ok(marginal <= 2.5 + 1e-9, `Marginal rate at lot ${lots} exceeded top tier`);
      if (lots > 10) assert.ok(marginal <= 1.1 + 1e-9, `Marginal rate at lot ${lots} exceeded tier 2`);
      if (lots > 70) assert.ok(marginal <= 0.4 + 1e-9, `Marginal rate at lot ${lots} exceeded tier 3`);
    }

    // Average per lot is non-increasing (after the minimum floor region of 4 lots)
    if (lots >= 4) {
      assert.ok(
        res.perLot <= prevPerLot + 1e-9,
        `Average per lot should be non-increasing at lot ${lots}: ${res.perLot} vs ${prevPerLot}`
      );
    }

    prevTotal = res.total;
    prevPerLot = res.perLot;
  }
});

/*
 * A panel row can carry both a figure and a chip, and both have to render.
 *
 * They used to be two branches of one ternary, so a row with both drew the chip
 * and dropped the number in silence. On /product/vendors-and-insurance that
 * meant the row said LOWEST and hid the $21,650 that made it the lowest, while
 * the panel's footing claimed a $4,750 saving the reader could not check.
 *
 * This is written against the built page rather than the component, and the
 * data carries a row with both so the test has something to fail on. Delete the
 * chip from that row and this goes red rather than quietly passing.
 */
test("a panel row with a figure and a chip renders both", async () => {
  const { readFileSync, existsSync } = await import("node:fs");
  const page = "dist/product/vendors-and-insurance.html";
  if (!existsSync(page)) return assert.fail("build dist before running: " + page + " is missing");
  const html = readFileSync(page, "utf8");

  const { vendorsAndInsurance } = await import("../src/data/features/vendors-and-insurance.ts");
  const rows = vendorsAndInsurance.bands
    .flatMap((b) => b.body)
    .flatMap((block) => (block.panel ? block.panel.rows : []));
  const both = rows.filter((r) => r.value && r.chip);

  assert.ok(both.length > 0, "no row carries both a value and a chip, so this test proves nothing");
  for (const r of both) {
    assert.ok(html.includes(r.value), `row "${r.label}" lost its value ${r.value}`);
    assert.ok(html.includes(r.chip), `row "${r.label}" lost its chip ${r.chip}`);
  }
});
