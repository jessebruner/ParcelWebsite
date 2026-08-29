import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import {
  BUNDLE_OPEN_ACCESS_BINDING,
  generateBehaviorScript,
  rewriteHomepageAccessSurface,
  verifyBehaviorScript,
  verifyHomepageTemplate,
  syncHomepageContent,
  extractRootTokens,
  assertTokensResolve,
  referencedTokens,
  definedTokens
} from "../tools/sync-homepage-masthead.mjs";

/** The real token block, read fresh, so a token deleted from tokens.css fails here. */
function tokens() {
  return extractRootTokens(readFileSync("src/styles/tokens.css", "utf8"));
}

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

function replaceOccurrence(source, target, replacement, occurrence) {
  let at = -1;
  let from = 0;
  for (let index = 0; index <= occurrence; index += 1) {
    at = source.indexOf(target, from);
    assert.notEqual(at, -1, `missing occurrence ${occurrence} of ${target}`);
    from = at + target.length;
  }
  return source.slice(0, at) + replacement + source.slice(at + target.length);
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

test("mutation test: removing only the mouseenter width guard fails verification", () => {
  const script = generateBehaviorScript();
  const mutated = replaceOccurrence(script, "if (window.innerWidth > 860)", "if (true)", 0);
  assert.throws(
    () => verifyBehaviorScript(mutated),
    /mouseenter hover sync must use the 860px viewport guard/
  );
});

test("mutation test: removing only the mouseleave width guard fails verification", () => {
  const script = generateBehaviorScript();
  const mutated = replaceOccurrence(script, "if (window.innerWidth > 860)", "if (true)", 1);
  assert.throws(
    () => verifyBehaviorScript(mutated),
    /mouseleave hover sync must use the 860px viewport guard/
  );
});

test("mutation test: drifting the hover breakpoint fails verification", () => {
  const script = generateBehaviorScript();
  const mutated = script.replaceAll("if (window.innerWidth > 860)", "if (window.innerWidth > 1)");
  assert.throws(
    () => verifyBehaviorScript(mutated),
    /mouseenter hover sync must use the 860px viewport guard/
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

  const { resultHtml, template } = syncHomepageContent(sourceHomepage, mockBuilt, mockCss, tokens());
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
  const { template } = syncHomepageContent(sourceHomepage, mockBuilt, ".mast { display:block; }", tokens());
  const mutated = template.replace('data-open-modal="early-access"', BUNDLE_OPEN_ACCESS_BINDING);
  assert.throws(
    () => verifyHomepageTemplate(mutated),
    /expected 3 unified early-access controls, found 2/
  );
});

test("homepage template verifier rejects a second dialog", () => {
  const sourceHomepage = readFileSync("public/index.html", "utf8");
  const mockBuilt = '<header class="mast"><button data-open-modal="early-access">Early Access</button></header><dialog id="early-access-modal"></dialog>';
  const { template } = syncHomepageContent(sourceHomepage, mockBuilt, ".mast { display:block; }", tokens());
  const mutated = template.replace("</body>", '<dialog id="early-access-modal"></dialog></body>');
  assert.throws(
    () => verifyHomepageTemplate(mutated),
    /expected 1 unified early-access dialog, found 2/
  );
});

test("homepage content sync against source assets satisfies all template and behavior rules", () => {
  const sourceHomepage = readFileSync("public/index.html", "utf8");
  const mastheadCss = readFileSync("src/styles/masthead.css", "utf8");
  const mockBuiltMasthead = '<header class=\"mast\"><nav><button class=\"burger\">Menu</button><button data-open-modal=\"early-access\">Early Access</button></nav></header><dialog id=\"early-access-modal\"></dialog>';
  const { template } = syncHomepageContent(sourceHomepage, mockBuiltMasthead, mastheadCss, tokens());

  assert.ok(template.includes('<header class=\"mast\">'), "Homepage template missing unified masthead");
  assert.doesNotThrow(() => verifyBehaviorScript(template));
  assert.doesNotThrow(() => verifyHomepageTemplate(template));
});

/*
 * ── TOKEN RESOLUTION ──────────────────────────────────────────────
 *
 * masthead.css is written in design tokens. The Astro pages load tokens.css;
 * the homepage bundle loads no stylesheet of ours, so for as long as only
 * masthead.css was injected, every var() in it was undefined on the homepage.
 * An undefined custom property throws nothing and logs nothing: the
 * declaration becomes invalid at computed-value time, so an inherited property
 * takes its parent's value and a non-inherited one takes its initial value.
 * The markup stayed byte-identical to the component's output, which was the
 * only thing the sync tool compared, and the whole suite stayed green while the
 * homepage masthead had no background, no border, no inset and no button fill.
 *
 * Every test below is written so that deleting the thing it guards makes it
 * fail. That is the only property that matters here, and the reason it is
 * asserted one token at a time rather than on a count.
 */

test("every token masthead.css reads is defined by tokens.css", () => {
  const mastheadCss = readFileSync("src/styles/masthead.css", "utf8");
  const stats = assertTokensResolve(mastheadCss, tokens());
  assert.ok(stats.needed > 10, `expected masthead.css to read more than 10 tokens, read ${stats.needed}`);
});

test("mutation test: a token masthead.css reads, removed from the block, fails", () => {
  const mastheadCss = readFileSync("src/styles/masthead.css", "utf8");
  assert.ok(mastheadCss.includes("var(--pad-x)"), "probe is stale: masthead.css no longer reads --pad-x");
  const mutated = tokens().replace("--pad-x:", "--pad-x-renamed:");
  assert.throws(() => assertTokensResolve(mastheadCss, mutated), /--pad-x/);
});

test("mutation test: the font token whose loss made the nav serif fails", () => {
  const mastheadCss = readFileSync("src/styles/masthead.css", "utf8");
  assert.ok(mastheadCss.includes("var(--font-mono)"), "probe is stale: masthead.css no longer reads --font-mono");
  const mutated = tokens().replace("--font-mono:", "--font-mono-renamed:");
  assert.throws(() => assertTokensResolve(mastheadCss, mutated), /--font-mono/);
});

test("mutation test: a token read only by another token is still required", () => {
  // --stroke-hairline is `1px solid var(--c-hairline)`. masthead.css never
  // names --c-hairline itself, so a check that only walked masthead.css would
  // pass while the border silently vanished.
  const block = tokens();
  assert.ok(block.includes("var(--c-hairline)"), "probe is stale: --stroke-hairline no longer reads --c-hairline");
  const mutated = block.replace("--c-hairline:", "--c-hairline-renamed:");
  assert.throws(() => assertTokensResolve(".x { border: var(--stroke-hairline); }", mutated), /--c-hairline/);
});

test("mutation test: injecting no tokens at all fails", () => {
  const mastheadCss = readFileSync("src/styles/masthead.css", "utf8");
  assert.throws(() => assertTokensResolve(mastheadCss, ":root { }"), /token\(s\) the homepage does not define/);
});

test("definedTokens does not count a var() reference as a definition", () => {
  assert.deepEqual([...definedTokens(":root { --a: var(--b); }")], ["--a"]);
  assert.deepEqual([...referencedTokens(":root { --a: var(--b); }")], ["--b"]);
});

test("the token definitions actually reach the homepage template", () => {
  const sourceHomepage = readFileSync("public/index.html", "utf8");
  const mastheadCss = readFileSync("src/styles/masthead.css", "utf8");
  const mockBuilt = '<header class="mast"><nav><button class="burger">Menu</button><button data-open-modal="early-access">Early Access</button></nav></header><dialog id="early-access-modal"></dialog>';
  const { template } = syncHomepageContent(sourceHomepage, mockBuilt, mastheadCss, tokens());

  // Not "a :root block is present" — the specific declarations whose absence
  // was measured on the built page.
  for (const decl of ["--pad-x:", "--font-mono:", "--font-serif:", "--paper:", "--terracotta:", "--c-edge:", "--t-mono-label:"]) {
    assert.ok(template.includes(decl), `homepage template is missing ${decl}`);
  }
  // And they must sit inside the injected block, not somewhere incidental.
  const start = template.indexOf("/* injected: masthead.css */");
  const end = template.indexOf("/* end masthead */", start);
  assert.ok(start !== -1 && end > start, "injected masthead block missing or unclosed");
  assert.ok(template.slice(start, end).includes("--pad-x:"), "tokens landed outside the injected block");
});

test("mutation test: syncing with an empty token block fails instead of shipping", () => {
  const sourceHomepage = readFileSync("public/index.html", "utf8");
  const mastheadCss = readFileSync("src/styles/masthead.css", "utf8");
  const mockBuilt = '<header class="mast"><nav><button class="burger">Menu</button><button data-open-modal="early-access">Early Access</button></nav></header><dialog id="early-access-modal"></dialog>';
  assert.throws(
    () => syncHomepageContent(sourceHomepage, mockBuilt, mastheadCss, ":root { }"),
    /token\(s\) the homepage does not define/
  );
});

test("extractRootTokens lifts the whole block and nothing after it", () => {
  const block = tokens();
  assert.ok(block.startsWith(":root {"), "block does not start at :root");
  assert.ok(block.trimEnd().endsWith("}"), "block is not closed");
  assert.ok(!block.includes("box-sizing"), "block ran past :root into the reset rules");
});

/*
 * ── DROPDOWN LATCHING ─────────────────────────────────────────────
 *
 * Rendered at 1440 before this change: hovering opened the panel, then walking
 * the pointer straight down from the button closed it at y=46 while the panel
 * did not begin until y=56, so the pointer could not reach it. Clicking the
 * button did not open the panel at all, because mouseenter had already set
 * `.open` by the time the click landed and the handler read `.open` to decide
 * what to do. Latch state is tracked separately from `.open` for that reason.
 */

test("clicking latches on the attribute, not on the open class", () => {
  const script = generateBehaviorScript();
  assert.ok(script.includes('var wasLatched = parent.hasAttribute("data-latched");'),
    "click handler no longer decides from latch state");
  assert.ok(!script.includes('var isOpen = parent && parent.classList.contains("open");'),
    "click handler is deciding from the hover-set open class again");
});

test("mouseleave leaves a latched panel alone", () => {
  const script = generateBehaviorScript();
  const leaveAt = script.indexOf('addEventListener("mouseleave"');
  const leaveEnd = script.indexOf("dBtns.forEach(function(btn) {", leaveAt);
  assert.ok(leaveAt !== -1 && leaveEnd > leaveAt, "mouseleave region not found");
  assert.ok(script.slice(leaveAt, leaveEnd).includes('if (container.hasAttribute("data-latched")) return;'),
    "mouseleave will tear down a clicked-open panel");
});

test("Escape and outside click clear the latch, not just the open class", () => {
  const script = generateBehaviorScript();
  assert.ok(script.includes('el.removeAttribute("data-latched");'),
    "nothing clears data-latched, so a latched panel can never be dismissed");
  // Selecting `.has-dropdown.open` would skip a latched panel whose open class
  // had already been removed, stranding the attribute set.
  assert.ok(!script.includes('m.querySelectorAll(".has-dropdown.open").forEach(shut)'),
    "dismissal is still filtering on the open class");
});
