import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import {
  BUNDLE_OPEN_ACCESS_BINDING,
  generateBehaviorScript,
  rewriteHomepageAccessSurface,
  verifyBehaviorScript,
  verifyHomepageTemplate,
  verifyHomepageDocument,
  syncHomepageContent,
  extractRootTokens,
  extractRules,
  extractElement,
  assertClassesStyled,
  assertTokensResolve,
  referencedTokens,
  definedTokens
} from "../tools/sync-homepage-masthead.mjs";

/** The real token block, read fresh, so a token deleted from tokens.css fails here. */
function tokens() {
  return extractRootTokens(readFileSync("src/styles/tokens.css", "utf8"));
}

/**
 * The stylesheets that travel with the footer and the calculator, read fresh
 * for the same reason: deleting a rule from either has to fail here.
 */
function extras() {
  return [
    extractRules(readFileSync("src/styles/tokens.css", "utf8"), [".page"]),
    readFileSync("src/styles/site-footer.css", "utf8"),
    readFileSync("src/styles/rate-calculator.css", "utf8"),
  ].join("\n");
}

/**
 * A stand-in built page. The sync lifts three components out of one, so a mock
 * carrying only a masthead makes the tool throw before it reaches whatever the
 * test was actually about. Small on purpose: these tests are about the sync,
 * and the real markup is compared against the component in the build itself.
 */
function built(mastheadMarkup) {
  return (
    mastheadMarkup +
    '<footer class="site-footer"><div class="page sf-inner"><p class="sf-addr">Detroit</p></div></footer>' +
    '<div class="pc" data-calc data-cfg="{}"><div class="pc-grid"><div class="pc-main"></div></div></div>' +
    '<script type="module">var root=document.querySelector("[data-calc]");</script>'
  );
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

  const { resultHtml, template } = syncHomepageContent(sourceHomepage, built(mockBuilt), mockCss, tokens(), extras());
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
  const { template } = syncHomepageContent(sourceHomepage, built(mockBuilt), ".mast { display:block; }", tokens(), extras());
  const mutated = template.replace('data-open-modal="early-access"', BUNDLE_OPEN_ACCESS_BINDING);
  assert.throws(
    () => verifyHomepageTemplate(mutated),
    /expected 3 unified early-access controls, found 2/
  );
});

test("homepage template verifier rejects a second dialog", () => {
  const sourceHomepage = readFileSync("public/index.html", "utf8");
  const mockBuilt = '<header class="mast"><button data-open-modal="early-access">Early Access</button></header><dialog id="early-access-modal"></dialog>';
  const { template } = syncHomepageContent(sourceHomepage, built(mockBuilt), ".mast { display:block; }", tokens(), extras());
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
  const { template } = syncHomepageContent(sourceHomepage, built(mockBuiltMasthead), mastheadCss, tokens(), extras());

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
  const { template } = syncHomepageContent(sourceHomepage, built(mockBuilt), mastheadCss, tokens(), extras());

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
    () => syncHomepageContent(sourceHomepage, built(mockBuilt), mastheadCss, ":root { }", extras()),
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

/*
 * ── THE FOOTER AND THE CALCULATOR ─────────────────────────────────
 *
 * They reached the homepage the same way the masthead did, so they can fail
 * the same way. Two of them are new failure modes the masthead never had: the
 * bundle's own copy surviving beside the injected one, and a class arriving
 * with no rule behind it because a global utility did not travel.
 */

test("the sync replaces the bundle's own footer, not adds to it", () => {
  const sourceHomepage = readFileSync("public/index.html", "utf8");
  const mockBuilt = '<header class="mast"><button data-open-modal="early-access">Early Access</button></header><dialog id="early-access-modal"></dialog>';
  const { template } = syncHomepageContent(sourceHomepage, built(mockBuilt), ".mast { display:block; }", tokens(), extras());

  assert.equal(template.split('<footer class="site-footer">').length - 1, 1);
  assert.equal(template.split("<footer style=").length - 1, 0, "the bundle's own footer survived");
});

test("the sync replaces the bundle's own price widget with the calculator", () => {
  const sourceHomepage = readFileSync("public/index.html", "utf8");
  const mockBuilt = '<header class="mast"><button data-open-modal="early-access">Early Access</button></header><dialog id="early-access-modal"></dialog>';
  const { template, resultHtml } = syncHomepageContent(sourceHomepage, built(mockBuilt), ".mast { display:block; }", tokens(), extras());

  assert.equal(template.split('<div class="pc" data-calc').length - 1, 1);
  assert.equal(template.split("lot-slider").length - 1, 0, "the bundle's own slider survived the swap");

  // Markup in the payload, behaviour in the document, and the split is the
  // point rather than an implementation detail. The payload is JSON the
  // unpacker parses and re-renders, so a <script> written into it never
  // becomes a script the browser owns: the calculator renders and never
  // moves. Both halves are asserted, and the second is asserted as an
  // absence, because a marker in the payload is the failure.
  assert.match(resultHtml, /\/\* injected: rate calculator \*\//);
  assert.ok(!template.includes("/* injected: rate calculator */"),
    "calculator behaviour is in the payload, where the unpacker re-creates it");
});

test("mutation test: a second footer in the template fails the verifier", () => {
  const sourceHomepage = readFileSync("public/index.html", "utf8");
  const mockBuilt = '<header class="mast"><button data-open-modal="early-access">Early Access</button></header><dialog id="early-access-modal"></dialog>';
  const { template } = syncHomepageContent(sourceHomepage, built(mockBuilt), ".mast { display:block; }", tokens(), extras());
  const mutated = template.replace("</body>", '<footer class="site-footer"></footer></body>');
  assert.throws(() => verifyHomepageTemplate(mutated), /expected 1 site footer, found 2/);
});

test("mutation test: the bundle's price widget left in place fails the verifier", () => {
  const sourceHomepage = readFileSync("public/index.html", "utf8");
  const mockBuilt = '<header class="mast"><button data-open-modal="early-access">Early Access</button></header><dialog id="early-access-modal"></dialog>';
  const { template } = syncHomepageContent(sourceHomepage, built(mockBuilt), ".mast { display:block; }", tokens(), extras());
  const mutated = template.replace(
    "</body>",
    '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(340px, 100%), 1fr)); gap: clamp(32px, 4vw, 88px); margin-top: clamp(34px, 4vw, 64px); align-items: start;"></div></body>'
  );
  assert.throws(() => verifyHomepageTemplate(mutated), /own price widget is still/);
});

test("mutation test: dropping .page from the injected CSS fails the sync", () => {
  // The footer's outer container uses .page, which is a tokens.css utility and
  // not a footer rule. Only the :root block of tokens.css is injected, so
  // without the lift the class arrives with nothing behind it: no max-width,
  // no page padding, footer text against the viewport edge. Nothing about that
  // raises, which is why it is asserted rather than assumed.
  const sourceHomepage = readFileSync("public/index.html", "utf8");
  const mockBuilt = '<header class="mast"><button data-open-modal="early-access">Early Access</button></header><dialog id="early-access-modal"></dialog>';
  const withoutPage = extras().split(".page {").join(".page-renamed {");
  assert.throws(
    () => syncHomepageContent(sourceHomepage, built(mockBuilt), ".mast { display:block; }", tokens(), withoutPage),
    /unstyled class\(es\): page/
  );
});

test("extractRules lifts the rule itself and throws on a name that is gone", () => {
  const tokensCss = readFileSync("src/styles/tokens.css", "utf8");
  const lifted = extractRules(tokensCss, [".page"]);
  assert.match(lifted, /max-width: var\(--page-max\)/);
  // Not the nested one. ".band > .page" is a different rule with a different
  // declaration, and a looser match would have returned it instead.
  assert.ok(!lifted.includes("display: grid"), "extractRules returned a nested .page rule");
  assert.throws(() => extractRules(tokensCss, [".not-a-real-class"]), /no top-level/);
});

test("assertClassesStyled distinguishes a class from a longer one that shares its prefix", () => {
  // ".pc" is a substring of ".pc-grid". A plain includes() reports the card
  // styled the moment any child rule exists, which is the one rule in that
  // stylesheet whose loss would flatten the whole component.
  assert.throws(
    () => assertClassesStyled('<div class="pc"></div>', ".pc-grid { display: grid; }"),
    /unstyled class\(es\): pc/
  );
  assert.doesNotThrow(() => assertClassesStyled('<div class="pc"></div>', ".pc { border: 0; }"));
});

/*
 * The document guard, driven directly.
 *
 * The two assertions above about the payload being free of the calculator
 * behaviour cannot fail on their own: every route to putting the marker there
 * trips this function first. So the property is proved here, where the input
 * is hand-built and the guard is the only thing under test.
 */

const calcBlock = (extra = "") =>
  "<script>/* injected: rate calculator */\n" +
  "var bound = null;\n" +
  "function attempt() { var el = document.querySelector('[data-calc]'); if (el === bound) return; bound = el; }\n" +
  "new MutationObserver(attempt).observe(document.documentElement, { childList: true, subtree: true });\n" +
  "setInterval(attempt, 400);\n" +
  extra +
  "/* end rate calculator */</script>";

const docWith = (body) =>
  "<!DOCTYPE html><html><body>\n" +
  '<script type="__bundler/template">\n' +
  JSON.stringify("<body>a template</body>") + "\n" +
  "</script>\n" +
  body +
  "\n</body></html>";

test("the document guard accepts behaviour that sits outside the bundle payload", () => {
  assert.doesNotThrow(() => verifyHomepageDocument(docWith(calcBlock())));
});

test("the document guard rejects behaviour that sits inside the bundle payload", () => {
  // The marker appears exactly once, so the count check passes and the payload
  // check is what has to catch it. This is the dead-calculator shape: a script
  // written into the JSON the unpacker parses never runs as a script.
  const doc =
    "<!DOCTYPE html><html><body>\n" +
    '<script type="__bundler/template">\n' +
    JSON.stringify("<body>" + calcBlock() + "</body>") + "\n" +
    "</script>\n</body></html>";
  assert.equal(doc.split("/* injected: rate calculator */").length - 1, 1);
  assert.throws(() => verifyHomepageDocument(doc), /landed inside the bundle payload/);
});

test("the document guard rejects behaviour that binds once instead of following the node", () => {
  // Each of the three required mechanisms, removed one at a time. A guard that
  // accepted any one of them would have passed the version that shipped a
  // calculator reading $10 at every lot count.
  const full = calcBlock();
  for (const [needle, expected] of [
    ["new MutationObserver(attempt)", /no observer for the first render/],
    ["setInterval(attempt", /does not rebind when the bundle replaces the node/],
    ["el === bound", /binds once instead of following the node/]
  ]) {
    const broken = full.replace(needle, "/* removed */");
    assert.notEqual(broken, full, `mutation anchor '${needle}' is not in the fixture`);
    assert.throws(() => verifyHomepageDocument(docWith(broken)), expected, `removing '${needle}' did not fail the guard`);
  }
});

test("extractElement walks tag depth rather than stopping at the first close", () => {
  const html = '<div class="pc" data-calc><div><div></div></div></div><p>after</p>';
  assert.equal(extractElement(html, '<div class="pc" data-calc', "div"), '<div class="pc" data-calc><div><div></div></div></div>');
});

test("the calculator boots on a page whose DOM is written after the script runs", () => {
  // The homepage bundle writes its own body from JavaScript. The component's
  // script guards on `if (root)` and returns silently when the element is not
  // there yet, so lifting it unwrapped gives a calculator that renders and
  // never moves, with nothing anywhere reporting it.
  const sourceHomepage = readFileSync("public/index.html", "utf8");
  const mockBuilt = '<header class="mast"><button data-open-modal="early-access">Early Access</button></header><dialog id="early-access-modal"></dialog>';
  const { resultHtml } = syncHomepageContent(sourceHomepage, built(mockBuilt), ".mast { display:block; }", tokens(), extras());
  const start = resultHtml.indexOf("/* injected: rate calculator */");
  const end = resultHtml.indexOf("/* end rate calculator */", start);
  assert.ok(start !== -1 && end > start, "calculator behaviour missing or unclosed");
  const script = resultHtml.slice(start, end);
  assert.match(script, /new MutationObserver\(attempt\)/);
  assert.match(script, /DOMContentLoaded/);
});

/*
 * ── WHAT ACTUALLY SHIPPED ─────────────────────────────────────────
 *
 * The tests above drive the sync with a stand-in built page, so they prove the
 * mechanism and nothing about the site. These read dist/index.html, which is
 * the file GitHub Pages serves, and assert the two things a visitor came for.
 */

const shippedTemplate = () => {
  if (!existsSync("dist/index.html")) return null;
  const lines = readFileSync("dist/index.html", "utf8").split("\n");
  const at = lines.findIndex((line) => line.includes('<script type="__bundler/template">'));
  if (at === -1) return null;
  return JSON.parse(lines[at + 1]);
};

test("the shipped homepage footer carries the links the bundle's footer never had", () => {
  const template = shippedTemplate();
  if (!template) { assert.ok(true, "no build present; run npm run build"); return; }

  // Anchors to #product, #price and #faq were the whole of it. The site's
  // most-visited page linked to neither the privacy policy nor the terms, and
  // to no other page on the site at all.
  for (const href of ["/pricing", "/security", "/about", "/contact", "/privacy", "/terms", "/blog", "/product"]) {
    assert.ok(template.includes('href="' + href + '"'), `shipped homepage footer has no link to ${href}`);
  }
  assert.equal(template.split('<footer class="site-footer">').length - 1, 1);
});

test("the shipped homepage runs the pricing page's own calculator", () => {
  const template = shippedTemplate();
  if (!template) { assert.ok(true, "no build present; run npm run build"); return; }
  const pricing = existsSync("dist/pricing.html") ? readFileSync("dist/pricing.html", "utf8") : null;
  if (!pricing) { assert.ok(true, "no build present"); return; }

  const fromHome = extractElement(template, '<div class="pc" data-calc', "div");
  const fromPricing = extractElement(pricing, '<div class="pc" data-calc', "div");
  assert.equal(fromHome, fromPricing, "the homepage calculator is not byte-identical to the pricing page's");

  // And the parts of it that carry the numbers, named rather than counted.
  for (const hook of ["data-count-input", "data-range", "data-total", "pc-includes-list", "data-bar=\"manager\""]) {
    assert.ok(fromHome.includes(hook), `shipped calculator is missing ${hook}`);
  }

  // The behaviour is asserted on the file GitHub Pages serves, not on the
  // payload inside it, and the payload is asserted to be free of it. A
  // calculator whose script sits in the payload still renders — it reads $10
  // at every lot count forever, because nothing rebinds it after the
  // unpacker replaces the node. That is the shape of the bug this pair
  // exists to catch, and only one of the two assertions can see it.
  const doc = readFileSync("dist/index.html", "utf8");
  assert.ok(doc.includes("/* injected: rate calculator */"), "shipped homepage has no calculator behaviour");
  assert.ok(!template.includes("/* injected: rate calculator */"),
    "shipped calculator behaviour is inside the bundle payload, where it cannot rebind");
});
