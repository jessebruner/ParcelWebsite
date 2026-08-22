import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("built homepage contains unified masthead and honest modal behavior", () => {
  const distHtml = readFileSync("dist/index.html", "utf8");
  const lines = distHtml.split("\n");
  const at = {};
  lines.forEach((l, i) => {
    const m = /<script type="__bundler\/(\w+)">/.exec(l);
    if (m) at[m[1]] = i + 1;
  });

  assert.ok(at.template !== undefined, "dist/index.html missing bundler template payload");
  const template = JSON.parse(lines[at.template]);

  // 1. Unified masthead markup
  assert.ok(template.includes('<header class="mast">'), "Homepage template missing unified masthead");

  // 2. Behavioral script injected
  assert.ok(
    template.includes("/* injected: masthead and modal behaviour */"),
    "Homepage template missing injected behavior script"
  );

  // 3. Desktop dropdown hover syncs aria-expanded
  assert.ok(
    template.includes('btn.setAttribute("aria-expanded", "true")'),
    "Homepage missing hover aria-expanded true sync"
  );
  assert.ok(
    template.includes('btn.setAttribute("aria-expanded", "false")'),
    "Homepage missing hover aria-expanded false sync"
  );

  // 4. Honest mailto inquiry path in no-endpoint mode
  assert.ok(
    template.includes("mailto:jesse@commonparcel.com"),
    "Homepage missing mailto:jesse@commonparcel.com fallback"
  );
  assert.ok(
    template.includes("Check your email app"),
    "Homepage missing truthful 'Check your email app' success title"
  );

  // 5. Lots integer validation
  assert.ok(
    template.includes("parseInt(lots, 10)"),
    "Homepage missing lot count integer parse/validation"
  );

  // 6. No bare fake-success submit handler
  const bareHandler = /form\.addEventListener\("submit",\s*function\(e\)\s*\{\s*e\.preventDefault\(\);\s*if\s*\(formView\)\s*formView\.style\.display\s*=\s*"none";\s*if\s*\(successView\)\s*successView\.style\.display\s*=\s*"block";\s*\}\)/;
  assert.ok(!bareHandler.test(template), "Homepage must not contain bare fake-success submit handler");
});
