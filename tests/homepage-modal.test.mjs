import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import {
  BUNDLE_OPEN_ACCESS_BINDING,
  generateBehaviorScript,
  rewriteHomepageAccessSurface,
  verifyBehaviorScript,
  verifyHomepageTemplate,
  syncHomepageContent
} from "../tools/sync-homepage-masthead.mjs";

function sourceTemplateAfterMastheadReplacement() {
  const sourceHomepage = readFileSync("public/index.html", "utf8");
  const lines = sourceHomepage.split("\n");
  const marker = lines.findIndex((line) => line.includes('<script type="__bundler/template">'));
  assert.notEqual(marker, -1, "source homepage missing template payload");
  const template = JSON.parse(lines[marker + 1]);
  return template.replace(
    /<header data-screen-label="Masthead"[\s\S]*?<\/header>/,
    '<header class="mast"><button data-open-modal="early-access">Early Access</button></header>'
  );
}

test("generated homepage behavior script passes all verification rules", () => {
  const script = generateBehaviorScript();
  assert.doesNotThrow(() => verifyBehaviorScript(script));
});

test("mutation test: deleting mailto assignment in submit handler fails verification", () => {
  const script = generateBehaviorScript();
  const mutated = script.replace(
    /window\.location\.href\s*=\s*["']mailto:jesse@commonparcel\.com\?subject=["']\s*\+\s*subject\s*\+\s*["']&body=["']\s*\+\s*mailBody;/,
    'window.location.href = "";'
  );
  assert.throws(
    () => verifyBehaviorScript(mutated),
    /Behavior script missing truthful mailto assignment in no-endpoint branch/
  );
});

test("mutation test: removing mouseenter hover sync fails verification", () => {
  const script = generateBehaviorScript();
  const mutated = script.replace('container.addEventListener("mouseenter"', 'container.addEventListener("none"');
  assert.throws(
    () => verifyBehaviorScript(mutated),
    /Behavior script missing dContainers hover event listeners and aria-expanded sync/
  );
});

test("mutation test: removing mouseleave hover sync fails verification", () => {
  const script = generateBehaviorScript();
  const mutated = script.replace('container.addEventListener("mouseleave"', 'container.addEventListener("none"');
  assert.throws(
    () => verifyBehaviorScript(mutated),
    /Behavior script missing dContainers hover event listeners and aria-expanded sync/
  );
});

test("mutation test: removing entire dContainers hover registration fails verification", () => {
  const script = generateBehaviorScript();
  const mutated = script.replace(/dContainers\.forEach\s*\(\s*function\s*\(\s*container\s*\)\s*\{[\s\S]*?\}\s*\);/, "");
  assert.throws(
    () => verifyBehaviorScript(mutated),
    /Behavior script missing dContainers hover event listeners and aria-expanded sync/
  );
});

test("mutation test: removing lot count bounds validation fails verification", () => {
  const script = generateBehaviorScript();
  const mutated = script.replace('lotsNum > 50000', 'false');
  assert.throws(
    () => verifyBehaviorScript(mutated),
    /Behavior script missing lot count 1\.\.50,000 bounds validation/
  );
});

test("mutation test: removing data-open-modal delegation fails verification", () => {
  const script = generateBehaviorScript();
  const mutated = script.replace("target.closest(\"[data-open-modal='early-access']\")", "null");
  assert.throws(
    () => verifyBehaviorScript(mutated),
    /Behavior script missing data-open-modal delegation/
  );
});

test("mutation test: injecting bare fake-success submit handler fails verification", () => {
  const script = generateBehaviorScript();
  const mutated = script + '\nform.addEventListener("submit", function(e) { e.preventDefault(); if (formView) formView.style.display = "none"; if (successView) successView.style.display = "block"; });';
  assert.throws(
    () => verifyBehaviorScript(mutated),
    /Behavior script contains stale bare fake-success submit handler/
  );
});

test("syncHomepageContent executes deterministically on clean source fixtures", () => {
  const sourceHomepage = readFileSync("public/index.html", "utf8");
  const mockBuilt = '<header class="mast"><nav><button class="burger">Menu</button><div class="has-dropdown"><button class="nav-btn">Product</button></div><button data-open-modal="early-access">Early Access</button></nav></header><dialog id="early-access-modal"></dialog>';
  const mockCss = ".mast { display: block; }";

  const { resultHtml, template } = syncHomepageContent(sourceHomepage, mockBuilt, mockCss);
  assert.ok(resultHtml.includes("/* injected: masthead and modal behaviour */"));
  assert.doesNotThrow(() => verifyBehaviorScript(template));
  assert.doesNotThrow(() => verifyHomepageTemplate(template));
});

test("homepage rewrite requires both primary CTA bindings", () => {
  const template = sourceTemplateAfterMastheadReplacement();
  const mutated = template.replace(BUNDLE_OPEN_ACCESS_BINDING, 'data-test-open-access="missing"');
  assert.throws(
    () => rewriteHomepageAccessSurface(mutated),
    /expected 2 bundle openAccess bindings, found 1/
  );
});

test("homepage rewrite fails if the structural modal tail boundary moves", () => {
  const template = sourceTemplateAfterMastheadReplacement();
  const mutated = template.replace("\n</div>\n\n</x-dc>", "\n</div>\n<!-- changed boundary -->\n</x-dc>");
  assert.throws(
    () => rewriteHomepageAccessSurface(mutated),
    /bundle early-access modal tail boundary missing/
  );
});

test("homepage template verifier rejects a restored old binding", () => {
  const sourceHomepage = readFileSync("public/index.html", "utf8");
  const mockBuilt = '<header class="mast"><button data-open-modal="early-access">Early Access</button></header><dialog id="early-access-modal"></dialog>';
  const { template } = syncHomepageContent(sourceHomepage, mockBuilt, ".mast { display:block; }");
  const mutated = template.replace('data-open-modal="early-access"', BUNDLE_OPEN_ACCESS_BINDING);
  assert.throws(
    () => verifyHomepageTemplate(mutated),
    /expected 3 unified early-access controls, found 2/
  );
});

test("homepage template verifier rejects a second dialog", () => {
  const sourceHomepage = readFileSync("public/index.html", "utf8");
  const mockBuilt = '<header class="mast"><button data-open-modal="early-access">Early Access</button></header><dialog id="early-access-modal"></dialog>';
  const { template } = syncHomepageContent(sourceHomepage, mockBuilt, ".mast { display:block; }");
  const mutated = template.replace("</body>", '<dialog id="early-access-modal"></dialog></body>');
  assert.throws(
    () => verifyHomepageTemplate(mutated),
    /expected 1 unified early-access dialog, found 2/
  );
});

test("built dist/index.html satisfies behavior verification if present", () => {
  if (!existsSync("dist/index.html")) {
    return; // Pass gracefully if run on clean checkout before build step
  }
  const distHtml = readFileSync("dist/index.html", "utf8");
  const lines = distHtml.split("\n");
  const at = {};
  lines.forEach((l, i) => {
    const m = /<script type="__bundler\/(\w+)">/.exec(l);
    if (m) at[m[1]] = i + 1;
  });

  assert.ok(at.template !== undefined, "dist/index.html missing bundler template payload");
  const template = JSON.parse(lines[at.template]);

  assert.ok(template.includes('<header class="mast">'), "Homepage template missing unified masthead");
  assert.doesNotThrow(() => verifyBehaviorScript(template));
  assert.doesNotThrow(() => verifyHomepageTemplate(template));
});
