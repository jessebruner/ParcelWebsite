/**
 * ONE MASTHEAD, ONE FOOTER, ONE CALCULATOR. All three are injected into the
 * homepage bundle from the built components.
 *
 * The homepage is the original bundle and cannot render an Astro component, so
 * for two rounds the site had two mastheads that I kept trying to make "look
 * alike". That is not the same component and it was correctly rejected.
 *
 * This makes it the same component. After every build:
 *
 *   1. The rendered <header class="mast"> is lifted out of a built Astro page.
 *      That markup is Masthead.astro's output, not a copy of it.
 *   2. src/styles/masthead.css is injected into the bundle's own stylesheet.
 *      Same file the Astro pages load.
 *   3. The bundle's original masthead and its nav rules are removed, so nothing
 *      competes.
 *   4. The injected markup is compared against the component's output and the
 *      script exits non-zero if they differ.
 *
 * The footer and the rate calculator travel the same route for the same
 * reason. The bundle's own footer linked to three same-page anchors and to
 * neither the privacy policy nor the terms, and the bundle's own price widget
 * was a second implementation of the bracket arithmetic sitting beside the
 * first. Both are now the component's own rendered output, compared against
 * it again after the file is written.
 *
 * Run after `astro build`. It is wired into the build script, so it cannot be
 * forgotten.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const JS_MARK_START = "/* injected: masthead and modal behaviour */";
export const JS_MARK_END = "/* end masthead and modal behaviour */";
export const CALC_MARK_START = "/* injected: rate calculator */";
export const CALC_MARK_END = "/* end rate calculator */";
export const BUNDLE_PRICE_GRID_OPEN =
  '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(340px, 100%), 1fr)); gap: clamp(32px, 4vw, 88px); margin-top: clamp(34px, 4vw, 64px); align-items: start;">';
export const CALC_OPEN = '<div class="pc" data-calc';
export const FOOTER_OPEN = '<footer class="site-footer">';
export const BUNDLE_OPEN_ACCESS_BINDING = 'sc-camel-on-click="{{ openAccess }}"';
export const UNIFIED_OPEN_ACCESS_BINDING = 'data-open-modal="early-access"';
export const BUNDLE_MODAL_START = '\n  <div style="{{ modalStyle }}" sc-camel-on-click="{{ closeAccess }}" role="dialog" aria-modal="true" aria-label="Get early access" data-screen-label="Early access form">';
export const BUNDLE_MODAL_TAIL = "\n</div>\n\n</x-dc>";

function occurrences(text, needle) {
  return text.split(needle).length - 1;
}

/**
 * Lift the `:root` custom-property block out of tokens.css.
 *
 * masthead.css is written entirely in tokens. The Astro pages load tokens.css
 * and resolve them; the homepage bundle is not an Astro page and loads no
 * stylesheet of ours, so for as long as only masthead.css was injected every
 * `var()` in it was undefined on the homepage and every declaration holding one
 * fell back silently. Measured on the built page, against /pricing as control:
 * the lockup lost its 56px inset and sat against the viewport edge, the nav
 * links rendered in Literata at 17px instead of IBM Plex Mono at 11px, the
 * sticky bar lost its background and its border, and the Early Access button
 * lost its terracotta fill and stopped looking like a button.
 *
 * Nothing failed. The markup was byte-identical to the component's output,
 * which is the only thing this file used to compare, and the suite was green
 * throughout. Hence assertTokensResolve below.
 */
export function extractRootTokens(tokensCss) {
  const start = tokensCss.indexOf(":root {");
  if (start === -1) throw new Error("tokens.css has no :root block");
  const end = tokensCss.indexOf("\n}", start);
  if (end === -1) throw new Error("tokens.css :root block is not closed");
  return tokensCss.slice(start, end + 2);
}

/**
 * Collect every `--name` a stylesheet reads through var(). Written with
 * indexOf rather than a pattern because this file is edited through a shell
 * that collapses backslashes, and a broken character class here would report
 * every page clean while matching nothing.
 */
export function referencedTokens(css) {
  return scanReferences(css).all;
}

/**
 * The subset that has to be defined somewhere: every name read through var()
 * at least once WITHOUT a fallback.
 *
 * `var(--d, 0ms)` is not the failure this guard exists for. --d is set inline
 * on each row of the includes list to stagger it, so it is undefined in the
 * stylesheet on purpose and the fallback is the value every other page uses
 * too. A var() with a fallback cannot go invalid at computed-value time, which
 * is the specific silent failure being caught here. A name that appears once
 * with a fallback and once without is still required, so writing the fallback
 * form in one rule cannot excuse the bare form in another.
 */
export function requiredTokens(css) {
  return scanReferences(css).required;
}

function scanReferences(css) {
  const all = new Set();
  const required = new Set();
  let at = css.indexOf("var(--");
  while (at !== -1) {
    let i = at + 4;
    let name = "";
    while (i < css.length) {
      const c = css[i];
      const ok = (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || (c >= "0" && c <= "9") || c === "-";
      if (!ok) break;
      name += c;
      i += 1;
    }
    if (name.length > 2) {
      all.add(name);
      let j = i;
      while (j < css.length && css[j] === " ") j += 1;
      if (css[j] !== ",") required.add(name);
    }
    at = css.indexOf("var(--", at + 1);
  }
  return { all, required };
}

export function definedTokens(cssBlock) {
  const names = new Set();
  let at = cssBlock.indexOf("--");
  while (at !== -1) {
    let i = at + 2;
    let name = "--";
    while (i < cssBlock.length) {
      const c = cssBlock[i];
      const ok = (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || (c >= "0" && c <= "9") || c === "-";
      if (!ok) break;
      name += c;
      i += 1;
    }
    // A definition, not a reference: the next non-space character is a colon,
    // and it is not sitting inside `var(`.
    let j = i;
    while (j < cssBlock.length && cssBlock[j] === " ") j += 1;
    const isVarRef = at >= 4 && cssBlock.slice(at - 4, at) === "var(";
    if (name.length > 2 && cssBlock[j] === ":" && !isVarRef) names.add(name);
    at = cssBlock.indexOf("--", at + 1);
  }
  return names;
}

/**
 * Every token the injected CSS reads must be defined by the injected tokens,
 * including tokens the token block itself reads. An undefined custom property
 * does not raise anything: the declaration becomes invalid at computed-value
 * time, so an inherited property silently takes its parent's value and a
 * non-inherited one silently takes its initial value. There is no way to see
 * that from the markup, which is why it has to be checked here.
 */
export function assertTokensResolve(mastheadCss, tokenBlock) {
  const defined = definedTokens(tokenBlock);
  const needed = new Set([...requiredTokens(mastheadCss), ...requiredTokens(tokenBlock)]);
  const missing = [...needed].filter((n) => !defined.has(n)).sort();
  if (missing.length) {
    throw new Error(
      `masthead CSS reads ${missing.length} token(s) the homepage does not define: ${missing.join(", ")}`
    );
  }
  return { defined: defined.size, needed: needed.size };
}

/**
 * Lift named top-level rules out of a stylesheet, verbatim.
 *
 * The footer markup uses .page, which is a global utility in tokens.css rather
 * than a footer rule, and only the :root block of tokens.css is injected. So
 * .page has to travel too. Copying its three declarations into
 * site-footer.css would have been a second copy of a rule this repo keeps in
 * one place, and it would have gone stale silently. This lifts the rule itself
 * and throws when a name is not found, so renaming .page fails the build
 * instead of quietly un-styling the homepage footer.
 */
export function extractRules(css, selectors) {
  const out = [];
  for (const selector of selectors) {
    const at = findTopLevelRule(css, selector);
    if (at === -1) throw new Error('tokens.css has no top-level "' + selector + '" rule');
    out.push(sliceRule(css, at));
  }
  return out.join("\n");
}

function findTopLevelRule(css, selector) {
  let depth = 0;
  let lineStart = 0;
  for (let i = 0; i < css.length; i += 1) {
    const c = css[i];
    if (c === "\n") { lineStart = i + 1; continue; }
    if (c === "{") { depth += 1; continue; }
    if (c === "}") { depth -= 1; continue; }
    if (depth !== 0) continue;
    if (!css.startsWith(selector, i)) continue;
    // Only when the selector is the whole of what precedes the brace, so
    // ".page" does not match ".band > .page" and return a nested rule.
    const brace = css.indexOf("{", i);
    if (brace === -1) continue;
    if (css.slice(i, brace).trim() !== selector) continue;
    if (css.slice(lineStart, i).trim() !== "") continue;
    return i;
  }
  return -1;
}

function sliceRule(css, at) {
  const open = css.indexOf("{", at);
  let depth = 0;
  for (let i = open; i < css.length; i += 1) {
    if (css[i] === "{") depth += 1;
    else if (css[i] === "}") {
      depth -= 1;
      if (depth === 0) return css.slice(at, i + 1);
    }
  }
  throw new Error("unclosed rule at " + at);
}

/**
 * Slice one element out of built markup by walking its own tag depth.
 *
 * Deliberately not a non-greedy regex. The footer and the calculator each
 * contain dozens of nested divs, so the first closing tag after the opening
 * one is about twenty levels too early. That is the mistake the early-access
 * modal rewrite made, and it left most of the form dangling after the footer.
 */
export function extractElement(html, openNeedle, tag) {
  const count = occurrences(html, openNeedle);
  if (count !== 1) {
    throw new Error('expected 1 "' + openNeedle.slice(0, 48) + '", found ' + count);
  }
  const start = html.indexOf(openNeedle);
  const open = new RegExp("<" + tag + "(?=[\\s>])", "g");
  const close = "</" + tag + ">";
  let depth = 0;
  let i = start;
  while (i < html.length) {
    open.lastIndex = i;
    const nextOpen = open.exec(html);
    const nextClose = html.indexOf(close, i);
    if (nextClose === -1) throw new Error("no closing " + close);
    if (nextOpen && nextOpen.index < nextClose) {
      depth += 1;
      i = nextOpen.index + 1;
      continue;
    }
    depth -= 1;
    if (depth === 0) return html.slice(start, nextClose + close.length);
    i = nextClose + close.length;
  }
  throw new Error("unbalanced <" + tag + ">");
}

/**
 * Every class the injected markup uses must be matched by the injected CSS.
 *
 * The same failure mode as an unresolved token, and just as quiet: a class no
 * rule matches raises nothing, it renders as unstyled inline text. This is
 * what .page would have done in the homepage footer.
 */
export function assertClassesStyled(markup, css, allow = []) {
  const used = new Set();
  const attr = /class="([^"]*)"/g;
  let m;
  while ((m = attr.exec(markup))) {
    for (const name of m[1].split(/\s+/)) if (name) used.add(name);
  }
  const missing = [...used]
    .filter((name) => !allow.includes(name))
    .filter((name) => !definesClass(css, name))
    .sort();
  if (missing.length) {
    throw new Error(
      "injected markup uses " + missing.length + " unstyled class(es): " + missing.join(", ")
    );
  }
  return used.size;
}

/**
 * A class is defined when the selector ends there.
 *
 * A bare substring test answers yes for "pc" as soon as ".pc-grid" exists,
 * which is the one name in this component most likely to lose its rule.
 */
function definesClass(css, name) {
  const needle = "." + name;
  let at = css.indexOf(needle);
  while (at !== -1) {
    const after = css[at + needle.length];
    const isName =
      after !== undefined &&
      ((after >= "a" && after <= "z") ||
        (after >= "A" && after <= "Z") ||
        (after >= "0" && after <= "9") ||
        after === "-" ||
        after === "_");
    if (!isName) return true;
    at = css.indexOf(needle, at + 1);
  }
  return false;
}

/**
 * The calculator's behaviour, lifted from the built page and made safe to run
 * on a page whose DOM does not exist yet.
 *
 * On an Astro page the module script runs deferred, after the markup is
 * parsed. The homepage bundle writes its DOM from JavaScript, so the element
 * is not there at that point, and the script's own `if (root)` guard would
 * silently do nothing.
 *
 * Booting once when the element first appears is not enough either, and that
 * part took a browser to find. Read the ext_resources payload: the bundle is
 * a React 18 app, and the template is markup React re-creates rather than
 * markup the browser keeps. Measured on the built homepage, two distinct
 * elements carry [data-calc] during load and the second replaces the first.
 * Binding once left every listener and the reveal observer on a node no
 * longer in the document. The card rendered correctly, the figure read $10,
 * and nothing anywhere — no exception, no console entry, no failing
 * assertion — reported that typing a lot count did nothing at all.
 *
 * Three consequences.
 *
 * The boot keys on the node it bound to, by identity, rather than on a
 * one-shot flag.
 *
 * The script is written into the outer document rather than into the
 * template, because a <script> inside the template is React's to re-create
 * too. Same reasoning as the gtag snippet and the favicon links in
 * public/index.html, which are out there for the same reason and say so.
 *
 * And the poll is load-bearing, not a belt-and-braces addition. Four builds
 * of this script were served to a real browser and driven the same way — type
 * 100 into the lot field, read the figure a second later. A 100-lot
 * association is $103.
 *
 *   identity + MutationObserver + interval   $103   what ships
 *   identity + MutationObserver, no interval  $10   dead
 *   bind once, observer + interval            $10   dead
 *
 * The observer alone does not survive the unpacker: it is registered on the
 * documentElement that existed at parse time, and by the time the second node
 * appears it is watching a document the page has moved on from. The observer
 * is kept for the instant first bind; the interval is what makes the rebind
 * happen. It costs one querySelector per tick against an already-parsed
 * document.
 *
 * One correction worth leaving here, because it cost an hour. The first three
 * of those runs were measured against a local server sending max-age=3600, so
 * every reading after the first was of a file that had already been replaced
 * on disk. It looked exactly like a fix that did not work. Serve dist with
 * caching off before believing any of this.
 */
export function rebindingScript(markStart, markEnd, rootExpression, body) {
  return (
    "<script>" + markStart + "\n" +
    "(function(){\n" +
    "  var bound = null;\n" +
    "  function boot(){\n" + body + "\n  }\n" +
    "  function attempt(){\n" +
    "    var el = " + rootExpression + ";\n" +
    "    if (!el || el === bound) return;\n" +
    "    bound = el;\n" +
    "    boot();\n" +
    "  }\n" +
    "  attempt();\n" +
    "  new MutationObserver(attempt).observe(document.documentElement, { childList: true, subtree: true });\n" +
    "  document.addEventListener(\"DOMContentLoaded\", attempt);\n" +
    "  setInterval(attempt, 300);\n" +
    "})();\n" +
    markEnd + "</script>"
  );
}

export function generateCalculatorScript(builtPageRaw) {
  const blocks = [...builtPageRaw.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)]
    .map((b) => b[1])
    .filter((b) => b.includes("data-calc"));
  if (blocks.length !== 1) {
    throw new Error("expected 1 calculator module script in the built page, found " + blocks.length);
  }
  const body = blocks[0];
  if (/\bimport\b|\bexport\b/.test(body)) {
    throw new Error("calculator script is not self-contained; it still imports");
  }
  return rebindingScript(CALC_MARK_START, CALC_MARK_END, 'document.querySelector("[data-calc]")', body);
}

/**
 * Remove the bundle-owned dialog at stable template boundaries and point the
 * two homepage CTAs at the Astro dialog. This deliberately does not parse
 * nested HTML with a non-greedy regex: the old modal contains many nested
 * divs, and doing that left most of the form dangling after the footer.
 */
export function rewriteHomepageAccessSurface(template) {
  const bindingCount = occurrences(template, BUNDLE_OPEN_ACCESS_BINDING);
  if (bindingCount !== 2) {
    throw new Error(`expected 2 bundle openAccess bindings, found ${bindingCount}`);
  }

  const modalStartCount = occurrences(template, BUNDLE_MODAL_START);
  if (modalStartCount !== 1) {
    throw new Error(`expected 1 bundle early-access modal start, found ${modalStartCount}`);
  }

  const start = template.indexOf(BUNDLE_MODAL_START);
  const tail = template.indexOf(BUNDLE_MODAL_TAIL, start);
  if (tail === -1) {
    throw new Error("bundle early-access modal tail boundary missing");
  }

  let rewritten = template.slice(0, start) + template.slice(tail);
  rewritten = rewritten.split(BUNDLE_OPEN_ACCESS_BINDING).join(UNIFIED_OPEN_ACCESS_BINDING);

  if (occurrences(rewritten, BUNDLE_OPEN_ACCESS_BINDING) !== 0) {
    throw new Error("bundle openAccess binding remains after rewrite");
  }
  if (rewritten.includes('data-screen-label="Early access form"')) {
    throw new Error("bundle early-access modal remains after rewrite");
  }
  return rewritten;
}

/**
 * The masthead and modal behaviour.
 *
 * This shipped for weeks bound once to the first node the bundle rendered, and
 * inside the template rather than out here. Measured against production on
 * 2026-08-29, the consequence was that clicking Product or Company in the
 * homepage nav did nothing at all, on the site's most-visited page, while the
 * identical component worked on every other page. The Early Access button kept
 * working and hid it: that one handler is delegated on document, so it does not
 * care which node is current.
 *
 * Now it goes through rebindingScript for the reason set out on
 * generateCalculatorScript. Re-running the body attaches a second set of
 * document-level listeners, which is harmless here and checked: the outside
 * click closes dropdowns that are already closed, Escape does the same, and
 * openModal is guarded by \`if (!dialog.open)\`.
 */
export function generateBehaviorScript() {
  return rebindingScript(
    JS_MARK_START,
    JS_MARK_END,
    'document.querySelector(".mast")',
    generateBehaviorBody()
  );
}

function generateBehaviorBody() {
  return (
    `` +
    `  var m = document.querySelector(".mast");\n` +
    `  if (m) {\n` +
    `    var b = m.querySelector(".burger");\n` +
    `    var dBtns = m.querySelectorAll(".has-dropdown > .nav-btn");\n` +
    `    var dContainers = m.querySelectorAll(".has-dropdown");\n` +
    `    if (b) b.addEventListener("click", function() {\n` +
    `      var o = m.hasAttribute("data-open");\n` +
    `      if (o) { m.removeAttribute("data-open"); } else { m.setAttribute("data-open", ""); }\n` +
    `      b.setAttribute("aria-expanded", String(!o));\n` +
    `    });\n` +
    `    var closeTimers = new WeakMap();\n` +
    `    function shut(el) {\n` +
    `      el.removeAttribute("data-latched");\n` +
    `      el.classList.remove("open");\n` +
    `      var nb = el.querySelector(".nav-btn"); if (nb) nb.setAttribute("aria-expanded", "false");\n` +
    `    }\n` +
    `    dContainers.forEach(function(container) {\n` +
    `      var btn = container.querySelector(".nav-btn");\n` +
    `      container.addEventListener("mouseenter", function() {\n` +
    `        if (window.innerWidth > 860) {\n` +
    `          var pending = closeTimers.get(container);\n` +
    `          if (pending) { window.clearTimeout(pending); closeTimers.delete(container); }\n` +
    `          container.classList.add("open");\n` +
    `          if (btn) btn.setAttribute("aria-expanded", "true");\n` +
    `        }\n` +
    `      });\n` +
    `      container.addEventListener("mouseleave", function() {\n` +
    `        if (window.innerWidth > 860) {\n` +
    `          if (container.hasAttribute("data-latched")) return;\n` +
    `          var pending = closeTimers.get(container);\n` +
    `          if (pending) window.clearTimeout(pending);\n` +
    `          closeTimers.set(container, window.setTimeout(function() {\n` +
    `            closeTimers.delete(container);\n` +
    `            container.classList.remove("open");\n` +
    `            if (btn) btn.setAttribute("aria-expanded", "false");\n` +
    `          }, 220));\n` +
    `        }\n` +
    `      });\n` +
    `    });\n` +
    `    dBtns.forEach(function(btn) {\n` +
    `      btn.addEventListener("click", function(e) {\n` +
    `        e.preventDefault();\n` +
    `        e.stopPropagation();\n` +
    `        var parent = btn.closest(".has-dropdown");\n` +
    `        if (!parent) return;\n` +
    `        var wasLatched = parent.hasAttribute("data-latched");\n` +
    `        m.querySelectorAll(".has-dropdown").forEach(function(el) {\n` +
    `          if (el !== parent) shut(el);\n` +
    `        });\n` +
    `        if (wasLatched) { shut(parent); }\n` +
    `        else { parent.setAttribute("data-latched", ""); parent.classList.add("open"); btn.setAttribute("aria-expanded", "true"); }\n` +
    `      });\n` +
    `    });\n` +
    `    document.addEventListener("click", function(e) {\n` +
    `      if (!m.contains(e.target)) {\n` +
    `        m.querySelectorAll(".has-dropdown").forEach(shut);\n` +
    `      }\n` +
    `    });\n` +
    `    document.addEventListener("keydown", function(e) {\n` +
    `      if (e.key !== "Escape") return;\n` +
    `      m.removeAttribute("data-open");\n` +
    `      if (b) b.setAttribute("aria-expanded", "false");\n` +
    `      m.querySelectorAll(".has-dropdown").forEach(shut);\n` +
    `    });\n` +
    `  }\n` +
    `  var dialog = document.getElementById("early-access-modal");\n` +
    `  if (dialog) {\n` +
    `    var endpoint = dialog.getAttribute("data-endpoint") || "";\n` +
    `    var closeBtn = document.getElementById("ea-close-btn");\n` +
    `    var cancelBtn = document.getElementById("ea-cancel-btn");\n` +
    `    var doneBtn = document.getElementById("ea-done-btn");\n` +
    `    var formView = document.getElementById("ea-form-view");\n` +
    `    var successView = document.getElementById("ea-success-view");\n` +
    `    var successTitle = document.getElementById("ea-success-title");\n` +
    `    var successBody = document.getElementById("ea-success-body");\n` +
    `    var errorBox = document.getElementById("ea-form-error");\n` +
    `    var form = document.getElementById("early-access-form");\n` +
    `    function showError(msg) {\n` +
    `      if (!errorBox) return;\n` +
    `      errorBox.textContent = msg;\n` +
    `      errorBox.style.display = "block";\n` +
    `    }\n` +
    `    function clearError() {\n` +
    `      if (!errorBox) return;\n` +
    `      errorBox.textContent = "";\n` +
    `      errorBox.style.display = "none";\n` +
    `    }\n` +
    `    function openModal(e) {\n` +
    `      if (e) e.preventDefault();\n` +
    `      if (!dialog.open) {\n` +
    `        clearError();\n` +
    `        if (formView) formView.style.display = "block";\n` +
    `        if (successView) successView.style.display = "none";\n` +
    `        dialog.showModal();\n` +
    `        var inp = dialog.querySelector("input");\n` +
    `        if (inp) inp.focus();\n` +
    `      }\n` +
    `    }\n` +
    `    function closeModal() { if (dialog.open) dialog.close(); }\n` +
    `    document.addEventListener("click", function(e) {\n` +
    `      var target = e.target;\n` +
    `      if (!target || !target.closest) return;\n` +
    `      var btn = target.closest("[data-open-modal='early-access']");\n` +
    `      if (!btn) return;\n` +
    `      openModal(e);\n` +
    `    });\n` +
    `    if (closeBtn) closeBtn.addEventListener("click", closeModal);\n` +
    `    if (cancelBtn) cancelBtn.addEventListener("click", closeModal);\n` +
    `    if (doneBtn) doneBtn.addEventListener("click", closeModal);\n` +
    `    dialog.addEventListener("click", function(e) {\n` +
    `      var r = dialog.getBoundingClientRect();\n` +
    `      var inside = r.top <= e.clientY && e.clientY <= r.top + r.height && r.left <= e.clientX && e.clientX <= r.left + r.width;\n` +
    `      if (!inside) closeModal();\n` +
    `    });\n` +
    `    if (form) form.addEventListener("submit", function(e) {\n` +
    `      e.preventDefault();\n` +
    `      clearError();\n` +
    `      var formData = new FormData(form);\n` +
    `      var assoc = (formData.get("association") || "").trim();\n` +
    `      var name = (formData.get("name") || "").trim();\n` +
    `      var lots = (formData.get("lots") || "").trim();\n` +
    `      var email = (formData.get("email") || "").trim();\n` +
    `      if (!assoc || !name || !lots || !email) {\n` +
    `        showError("Please complete all required fields.");\n` +
    `        return;\n` +
    `      }\n` +
    `      var lotsNum = parseInt(lots, 10);\n` +
    `      if (isNaN(lotsNum) || lotsNum < 1 || lotsNum > 50000 || String(lotsNum) !== lots) {\n` +
    `        showError("Please enter a valid lot count between 1 and 50,000.");\n` +
    `        return;\n` +
    `      }\n` +
    `      var emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;\n` +
    `      if (!emailRegex.test(email)) {\n` +
    `        showError("Please enter a valid email address.");\n` +
    `        return;\n` +
    `      }\n` +
    `      if (!endpoint) {\n` +
    `        var subject = encodeURIComponent("Early Access Inquiry: " + assoc);\n` +
    `        var mailBody = encodeURIComponent("Association: " + assoc + "\\nName: " + name + "\\nLots: " + lots + "\\nEmail: " + email + "\\n\\n");\n` +
    `        window.location.href = "mailto:jesse@commonparcel.com?subject=" + subject + "&body=" + mailBody;\n` +
    `        if (successTitle) successTitle.textContent = "Check your email app";\n` +
    `        if (successBody) {\n` +
    `          successBody.innerHTML = 'Your email application should open with your inquiry details prefilled. If it did not open, email us directly at <a href=\"mailto:jesse@commonparcel.com\" style=\"color: var(--terracotta); text-decoration: underline;\">jesse@commonparcel.com</a>.';\n` +
    `        }\n` +
    `        if (formView) formView.style.display = "none";\n` +
    `        if (successView) successView.style.display = "block";\n` +
    `        return;\n` +
    `      }\n` +
    `      var submitBtn = document.getElementById("ea-submit-btn");\n` +
    `      if (submitBtn) submitBtn.disabled = true;\n` +
    `      fetch(endpoint, {\n` +
    `        method: "POST",\n` +
    `        headers: { "Content-Type": "application/json" },\n` +
    `        body: JSON.stringify({ association: assoc, name: name, lots: lots, email: email, timestamp: new Date(Date.now() /* SOURCE_DATE_EPOCH */).toISOString() })\n` +
    `      }).then(function(res) {\n` +
    `        if (!res.ok) throw new Error("Server returned status " + res.status);\n` +
    `        if (successTitle) successTitle.textContent = "Request received.";\n` +
    `        if (successBody) successBody.textContent = "Thank you for your interest. We will follow up directly by email.";\n` +
    `        if (formView) formView.style.display = "none";\n` +
    `        if (successView) successView.style.display = "block";\n` +
    `      }).catch(function(err) {\n` +
    `        if (errorBox) {\n` +
    `          errorBox.innerHTML = 'Unable to submit your request. Please email us directly at <a href=\"mailto:jesse@commonparcel.com\" style=\"color: var(--terracotta); text-decoration: underline;\">jesse@commonparcel.com</a>.';\n` +
    `          errorBox.style.display = "block";\n` +
    `        }\n` +
    `      }).finally(function() {\n` +
    `        if (submitBtn) submitBtn.disabled = false;\n` +
    `      });\n` +
    `    });\n` +
    `  }\n` +
    ``
  );
}

export function verifyBehaviorScript(scriptText) {
  if (!scriptText.includes(JS_MARK_START) || !scriptText.includes(JS_MARK_END)) {
    throw new Error("Behavior script missing start or end marker");
  }

  // Check explicit mailto assignment in no-endpoint branch
  const mailtoAssignment = /if\s*\(\s*!endpoint\s*\)\s*\{[\s\S]*?window\.location\.href\s*=\s*["'`]mailto:jesse@commonparcel\.com\?subject=[\s\S]*?if\s*\(\s*successTitle\s*\)\s*successTitle\.textContent\s*=\s*["']Check your email app["'][\s\S]*?if\s*\(\s*formView\s*\)\s*formView\.style\.display\s*=\s*["']none["'][\s\S]*?if\s*\(\s*successView\s*\)\s*successView\.style\.display\s*=\s*["']block["'][\s\S]*?return;\s*\}/;
  if (!mailtoAssignment.test(scriptText)) {
    throw new Error("Behavior script missing truthful mailto assignment in no-endpoint branch");
  }

  // Check lot count bounds validation
  if (!/parseInt\(\s*lots\s*,\s*10\s*\)/.test(scriptText) || !/lotsNum\s*<\s*1\s*\|\|\s*lotsNum\s*>\s*50000/.test(scriptText)) {
    throw new Error("Behavior script missing lot count 1..50,000 bounds validation");
  }

  // Check hover listeners and aria-expanded synchronization inside dContainers.forEach
  const hoverSyncBlock = /dContainers\.forEach\s*\(\s*function\s*\(\s*container\s*\)\s*\{[\s\S]*?container\.addEventListener\(\s*["']mouseenter["'][\s\S]*?btn\.setAttribute\(\s*["']aria-expanded["']\s*,\s*["']true["']\s*\)[\s\S]*?container\.addEventListener\(\s*["']mouseleave["'][\s\S]*?btn\.setAttribute\(\s*["']aria-expanded["']\s*,\s*["']false["']\s*\)[\s\S]*?\}\s*\)/;
  if (!hoverSyncBlock.test(scriptText)) {
    throw new Error("Behavior script missing dContainers hover event listeners and aria-expanded sync");
  }

  // Hover sync is a desktop enhancement. Keep both listeners outside the
  // mobile navigation range so tap/click remains the only mobile state owner.
  // The separate latch makes the first tap resilient to emulated mouse events;
  // these guards remain defense in depth against hover changing open/ARIA state.
  // Inspect each listener region separately so one intact guard cannot hide a
  // regression in the other.
  const hoverBlockStart = scriptText.indexOf("dContainers.forEach(function(container) {");
  const hoverBlockEnd = scriptText.indexOf("dBtns.forEach(function(btn) {", hoverBlockStart);
  const hoverBlock = hoverBlockStart < 0 || hoverBlockEnd < 0
    ? ""
    : scriptText.slice(hoverBlockStart, hoverBlockEnd);
  const enterAt = hoverBlock.indexOf('addEventListener("mouseenter"');
  const leaveAt = hoverBlock.indexOf('addEventListener("mouseleave"');
  const requiredHoverGuard = "if (window.innerWidth > 860)";
  const enterRegion = enterAt < 0 || leaveAt < 0 ? "" : hoverBlock.slice(enterAt, leaveAt);
  const leaveRegion = leaveAt < 0 ? "" : hoverBlock.slice(leaveAt);

  if (!enterRegion.includes(requiredHoverGuard)) {
    throw new Error("Behavior script mouseenter hover sync must use the 860px viewport guard");
  }
  if (!leaveRegion.includes(requiredHoverGuard)) {
    throw new Error("Behavior script mouseleave hover sync must use the 860px viewport guard");
  }

  // Check document-level delegation by stable behavior attribute, never copy.
  const ctaDelegation = /target\.closest\(\s*["']\[data-open-modal=["']early-access["']\]["']\s*\)[\s\S]*?if\s*\(\s*!btn\s*\)\s*return;[\s\S]*?openModal\(e\)/;
  if (!ctaDelegation.test(scriptText)) {
    throw new Error("Behavior script missing data-open-modal delegation");
  }

  // Check that bare fake-success submit handler does NOT exist
  if (/form\.addEventListener\(\s*["']submit["']\s*,\s*function\s*\(\s*e\s*\)\s*\{\s*e\.preventDefault\(\);\s*(?:if\s*\(\s*formView\s*\)\s*)?formView\.style\.display\s*=\s*["']none["'];\s*(?:if\s*\(\s*successView\s*\)\s*)?successView\.style\.display\s*=\s*["']block["'];?\s*\}\)/.test(scriptText)) {
    throw new Error("Behavior script contains stale bare fake-success submit handler");
  }
}

export function verifyHomepageTemplate(template) {
  const unifiedTargets = occurrences(template, UNIFIED_OPEN_ACCESS_BINDING);
  if (unifiedTargets !== 3) {
    throw new Error(`expected 3 unified early-access controls, found ${unifiedTargets}`);
  }
  if (occurrences(template, BUNDLE_OPEN_ACCESS_BINDING) !== 0) {
    throw new Error("bundle openAccess binding is still reachable");
  }
  if (template.includes('data-screen-label="Early access form"')) {
    throw new Error("bundle early-access modal remains in homepage template");
  }
  if (occurrences(template, FOOTER_OPEN) !== 1) {
    throw new Error(`expected 1 site footer, found ${occurrences(template, FOOTER_OPEN)}`);
  }
  if (occurrences(template, "<footer style=") !== 0) {
    throw new Error("the bundle's own footer is still in the homepage template");
  }
  if (occurrences(template, CALC_OPEN) !== 1) {
    throw new Error(`expected 1 rate calculator, found ${occurrences(template, CALC_OPEN)}`);
  }
  if (occurrences(template, BUNDLE_PRICE_GRID_OPEN) !== 0) {
    throw new Error("the bundle's own price widget is still in the homepage template");
  }
  if (occurrences(template, "lot-slider") !== 0) {
    throw new Error("the bundle's own slider markup or rules survived the swap");
  }
  const unifiedDialogs = occurrences(template, '<dialog id="early-access-modal"');
  if (unifiedDialogs !== 1) {
    throw new Error(`expected 1 unified early-access dialog, found ${unifiedDialogs}`);
  }
}

export function syncHomepageContent(sourceHomepageRaw, builtPageRaw, mastheadCss, tokenBlock, extraCss = "") {
  const injectedCss = tokenBlock + "\n" + mastheadCss + "\n" + extraCss;
  assertTokensResolve(injectedCss, tokenBlock);
  const hm = /<header class="mast">[\s\S]*?<\/header>/.exec(builtPageRaw);
  if (!hm) throw new Error("no <header class=\"mast\"> in built page markup");
  let header = hm[0];

  header = header
    .replace(/ aria-current="page"/g, "")
    .replace(/ class="navlink on"/g, ' class="navlink"');

  if (/data-astro-cid/.test(header)) {
    throw new Error("masthead markup carries a scoped-style id; move those rules into masthead.css");
  }

  const footer = extractElement(builtPageRaw, FOOTER_OPEN, "footer");
  const calculator = extractElement(builtPageRaw, CALC_OPEN, "div");
  for (const [what, markup] of [["footer", footer], ["calculator", calculator]]) {
    if (/data-astro-cid/.test(markup)) {
      throw new Error(what + " markup carries a scoped-style id; move those rules into a plain stylesheet");
    }
  }
  // .page is the only class either one borrows from tokens.css. Anything else
  // arriving unstyled is a rule that did not travel, and stops the build.
  assertClassesStyled(footer + calculator, injectedCss);

  const lines = sourceHomepageRaw.split("\n");
  const at = {};
  lines.forEach((l, i) => {
    const m = /<script type="__bundler\/(\w+)">/.exec(l);
    if (m) at[m[1]] = i + 1;
  });
  for (const tag of ["template", "manifest", "ext_resources", "page_order"]) {
    if (at[tag] === undefined) throw new Error(`missing ${tag} payload`);
  }

  let template = JSON.parse(lines[at.template]);

  const existing =
    /<header class="mast">[\s\S]*?<\/header>/.exec(template) ||
    /<header data-screen-label="Masthead"[\s\S]*?<\/header>/.exec(template);
  if (!existing) throw new Error("no masthead found in the bundle template");
  template = template.replace(existing[0], header);

  const bundleFooter = extractElement(template, "<footer style=", "footer");
  template = template.replace(bundleFooter, footer);

  // The whole two-column widget goes, not just the slider: its right-hand
  // column was three comparison bars driven by the bundle's own lot-count
  // state. Left in place beside a calculator that no longer feeds them, they
  // would have sat frozen at four lots while the figure above said a hundred.
  // The bars moved into the component instead, so nothing was dropped.
  const bundleWidget = extractElement(template, BUNDLE_PRICE_GRID_OPEN, "div");
  template = template.replace(bundleWidget, calculator);

  template = rewriteHomepageAccessSurface(template);

  const DEAD_RULES = [
    /\.lot-slider(:active|:hover)?(::-webkit-slider-runnable-track|::-webkit-slider-thumb|::-moz-range-track|::-moz-range-thumb|:focus-visible)?(::-webkit-slider-thumb)?(, \.lot-slider:focus-visible::-webkit-slider-thumb)? \{[^}]*\}/g,
    /\.nav-links \{[^}]*\}/g,
    /\.navlink(--price)?(::after)?(:hover)?(::after)? \{[^}]*\}/g,
    /\.nav-cta \{[^}]*\}/g,
    /\.lockup-pad \{[^}]*\}/g,
    /\.lockup svg rect:nth-of-type\(2\) \{[^}]*\}/g,
    /\.lockup:hover svg rect:nth-of-type\(2\) \{[^}]*\}/g,
  ];
  let removed = 0;
  for (const re of DEAD_RULES) {
    template = template.replace(re, () => { removed++; return ""; });
  }

  const MARK = "/* injected: masthead.css */";
  template = template.replace(new RegExp(MARK.replace(/[*]/g, "\\*") + "[\\s\\S]*?/\\* end masthead \\*/"), "");
  const lastStyleClose = template.lastIndexOf("</style>");
  if (lastStyleClose === -1) throw new Error("no </style> in the bundle template");
  // The tokens go first, and in the same block, so that removing one removes
  // the other. The bundle defines no custom properties of its own and reads
  // none, so this collides with nothing it already does.
  template =
    template.slice(0, lastStyleClose) +
    `\n${MARK}\n${tokenBlock}\n${mastheadCss}\n${extraCss}\n/* end masthead */\n` +
    template.slice(lastStyleClose);

  const modalMatch = /<dialog id="early-access-modal"[\s\S]*?<\/dialog>/.exec(builtPageRaw);
  const DIALOG_MARK = "<!-- injected: early-access-modal -->";
  if (modalMatch) {
    template = template.replace(new RegExp(DIALOG_MARK + "[\\s\\S]*?<!-- end modal -->"), "");
    template = template.replace("</body>", `${DIALOG_MARK}\n${modalMatch[0]}\n<!-- end modal -->\n</body>`);
  }

  // Clean out previous injections idempotently
  template = template.replace(/<script>\s*\/\* injected: masthead behaviour \*\/[\s\S]*?<\/script>/g, "");
  template = template.replace(new RegExp(`<script>\\s*${JS_MARK_START.replace(/[*]/g, "\\*")}[\\s\\S]*?${JS_MARK_END.replace(/[*]/g, "\\*")}\\s*<\\/script>`, "g"), "");

  const behaviorScript = generateBehaviorScript();
  verifyBehaviorScript(behaviorScript);

  template = template.replace("</body>", behaviorScript + "\n</body>");
  verifyHomepageTemplate(template);

  lines[at.template] = JSON.stringify(template).replace(/<\//g, "<\\u002F");
  let resultHtml = lines.join("\n");

  const calculatorScript = generateCalculatorScript(builtPageRaw);
  resultHtml = stripCalculatorScript(resultHtml);
  const closeBody = resultHtml.lastIndexOf("</body>");
  if (closeBody === -1) throw new Error("no </body> in the homepage document");
  resultHtml = resultHtml.slice(0, closeBody) + calculatorScript + "\n" + resultHtml.slice(closeBody);
  verifyHomepageDocument(resultHtml);

  return {
    resultHtml,
    header,
    footer,
    calculator,
    removed,
    template
  };
}

function stripCalculatorScript(html) {
  const start = html.indexOf(CALC_MARK_START);
  if (start === -1) return html;
  const open = html.lastIndexOf("<script>", start);
  const end = html.indexOf(CALC_MARK_END, start);
  const close = html.indexOf("</script>", end);
  if (open === -1 || end === -1 || close === -1) throw new Error("calculator script is not closed");
  return html.slice(0, open) + html.slice(close + "</script>".length);
}

/**
 * What has to be true of the file that is served, as opposed to the template
 * inside it. The calculator's behaviour is the whole of it: it lives out here
 * precisely because the template is not where a script survives.
 */
export function verifyHomepageDocument(html) {
  if (occurrences(html, CALC_MARK_START) !== 1) {
    throw new Error(`expected 1 calculator behaviour block, found ${occurrences(html, CALC_MARK_START)}`);
  }
  const at = html.indexOf(CALC_MARK_START);
  // Not "is it in the file" — the payload is in the file. It must not be
  // inside the JSON the runtime parses, which is where a script stops being a
  // script the browser owns.
  const lines = html.split("\n");
  const payloadAt = lines.findIndex((line) => line.includes('<script type="__bundler/template">'));
  if (payloadAt !== -1 && JSON.parse(lines[payloadAt + 1]).includes(CALC_MARK_START)) {
    throw new Error("calculator behaviour landed inside the bundle payload, where React re-creates it");
  }
  const block = html.slice(at, html.indexOf(CALC_MARK_END, at));
  // Both, separately. The observer alone was measured going deaf after the
  // unpacker rewrote the document, and a check that accepted either would
  // have passed on the version that shipped a dead calculator.
  if (!block.includes("MutationObserver")) {
    throw new Error("calculator behaviour has no observer for the first render");
  }
  if (!block.includes("setInterval(attempt")) {
    throw new Error("calculator behaviour does not rebind when the bundle replaces the node");
  }
  if (!block.includes("el === bound")) {
    throw new Error("calculator behaviour binds once instead of following the node");
  }
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const SOURCE_HOMEPAGE = "public/index.html";
  const TARGET_PAGE = "dist/index.html";
  const SOURCE_PAGE = "dist/pricing.html";
  const CSS = "src/styles/masthead.css";
  const FOOTER_CSS = "src/styles/site-footer.css";
  const CALC_CSS = "src/styles/rate-calculator.css";
  const TOKENS = "src/styles/tokens.css";
  // .page is a tokens.css utility the footer markup uses. Lifted rather than
  // copied, so it cannot drift, and named so a rename fails the build.
  const BORROWED = [".page"];

  const built = readFileSync(SOURCE_PAGE, "utf8");
  const mastheadCss = readFileSync(CSS, "utf8");
  const tokensCss = readFileSync(TOKENS, "utf8");
  const tokenBlock = extractRootTokens(tokensCss);
  const extraCss =
    extractRules(tokensCss, BORROWED) +
    "\n" +
    readFileSync(FOOTER_CSS, "utf8") +
    "\n" +
    readFileSync(CALC_CSS, "utf8");
  const sourceHomepage = readFileSync(SOURCE_HOMEPAGE, "utf8");

  const tokenStats = assertTokensResolve(mastheadCss + "\n" + extraCss, tokenBlock);
  const { resultHtml, header, footer, calculator, removed, template } = syncHomepageContent(
    sourceHomepage,
    built,
    mastheadCss,
    tokenBlock,
    extraCss
  );
  writeFileSync(TARGET_PAGE, resultHtml);

  const out = readFileSync(TARGET_PAGE, "utf8").split("\n");
  const oAt = {};
  out.forEach((l, i) => {
    const m = /<script type="__bundler\/(\w+)">/.exec(l);
    if (m) oAt[m[1]] = i + 1;
  });
  const parsed = {};
  for (const tag of ["template", "manifest", "ext_resources", "page_order"]) parsed[tag] = JSON.parse(out[oAt[tag]]);

  const injected = /<header class="mast">[\s\S]*?<\/header>/.exec(parsed.template);
  if (!injected) throw new Error("masthead missing after write");
  if (injected[0] !== header) throw new Error("injected masthead differs from the component output");
  if (!parsed.template.includes("/* injected: masthead.css */")) throw new Error("masthead.css not injected");

  // Read back from the file that shipped, not from what was intended. The
  // masthead round taught this: the markup compared byte-identical while every
  // declaration styling it silently fell back.
  const writtenFooter = extractElement(parsed.template, FOOTER_OPEN, "footer");
  if (writtenFooter !== footer) throw new Error("written footer differs from the component output");
  const writtenCalculator = extractElement(parsed.template, CALC_OPEN, "div");
  if (writtenCalculator !== calculator) throw new Error("written calculator differs from the component output");
  verifyHomepageDocument(out.join("\n"));

  // Re-check against what was actually written, not against what was intended.
  // The injected CSS is the whole style block, so its own token references have
  // to resolve inside the page that shipped.
  const injectedStart = parsed.template.indexOf("/* injected: masthead.css */");
  const injectedEnd = parsed.template.indexOf("/* end masthead */", injectedStart);
  if (injectedEnd === -1) throw new Error("injected masthead block is not closed in the written page");
  const injectedBlock = parsed.template.slice(injectedStart, injectedEnd);
  assertTokensResolve(injectedBlock, injectedBlock);
  const styledClasses = assertClassesStyled(writtenFooter + writtenCalculator, injectedBlock);

  verifyBehaviorScript(parsed.template);
  verifyHomepageTemplate(parsed.template);

  const navLabels = [...injected[0].matchAll(/(?:class="[^"]*navlink[^"]*"[^>]*>[\s\S]*?<span>([^<]+)<\/span>|class="[^"]*navlink[^"]*"[^>]*>([^<]+)<\/a>)/g)]
    .map((m) => (m[1] || m[2]).trim());
  console.log("masthead synced from Masthead.astro");
  console.log(`  markup identical to the component output: yes (${injected[0].length} chars)`);
  console.log(`  masthead.css injected: ${mastheadCss.split("\n").length} lines`);
  console.log(`  design tokens injected: ${tokenStats.defined} defined, ${tokenStats.needed} read, 0 unresolved`);
  console.log(`  bundle's competing rules removed: ${removed}`);
  console.log(`  behavior verified: 3 unified triggers, 1 dialog, hover sync, mailto fallback, validation`);
  console.log(`  footer synced from SiteFooter.astro: identical (${writtenFooter.length} chars)`);
  console.log(`  calculator synced from RateCalculator.astro: identical (${writtenCalculator.length} chars)`);
  console.log(`  injected classes all styled: ${styledClasses}`);
  console.log(`  links: ${navLabels.join(" · ")}`);
  console.log(`  all four payloads parse; manifest ${Object.keys(parsed.manifest).length} assets`);
}
