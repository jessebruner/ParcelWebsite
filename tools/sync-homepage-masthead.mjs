/**
 * ONE MASTHEAD. Injected into the homepage bundle from the built component.
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
 * Run after `astro build`. It is wired into the build script, so it cannot be
 * forgotten.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const JS_MARK_START = "/* injected: masthead and modal behaviour */";
export const JS_MARK_END = "/* end masthead and modal behaviour */";
export const BUNDLE_OPEN_ACCESS_BINDING = 'sc-camel-on-click="{{ openAccess }}"';
export const UNIFIED_OPEN_ACCESS_BINDING = 'data-open-modal="early-access"';
export const BUNDLE_MODAL_START = '\n  <div style="{{ modalStyle }}" sc-camel-on-click="{{ closeAccess }}" role="dialog" aria-modal="true" aria-label="Get early access" data-screen-label="Early access form">';
export const BUNDLE_MODAL_TAIL = "\n</div>\n\n</x-dc>";

function occurrences(text, needle) {
  return text.split(needle).length - 1;
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

export function generateBehaviorScript() {
  return (
    `<script>${JS_MARK_START}\n` +
    `(function(){\n` +
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
    `    dContainers.forEach(function(container) {\n` +
    `      var btn = container.querySelector(".nav-btn");\n` +
    `      container.addEventListener("mouseenter", function() {\n` +
    `        if (window.innerWidth > 860) {\n` +
    `          container.classList.add("open");\n` +
    `          if (btn) btn.setAttribute("aria-expanded", "true");\n` +
    `        }\n` +
    `      });\n` +
    `      container.addEventListener("mouseleave", function() {\n` +
    `        if (window.innerWidth > 860) {\n` +
    `          container.classList.remove("open");\n` +
    `          if (btn) btn.setAttribute("aria-expanded", "false");\n` +
    `        }\n` +
    `      });\n` +
    `    });\n` +
    `    dBtns.forEach(function(btn) {\n` +
    `      btn.addEventListener("click", function(e) {\n` +
    `        e.stopPropagation();\n` +
    `        var parent = btn.closest(".has-dropdown");\n` +
    `        var isOpen = parent && parent.classList.contains("open");\n` +
    `        m.querySelectorAll(".has-dropdown.open").forEach(function(el) {\n` +
    `          if (el !== parent) { el.classList.remove("open"); var nb = el.querySelector(".nav-btn"); if (nb) nb.setAttribute("aria-expanded", "false"); }\n` +
    `        });\n` +
    `        if (isOpen) { if (parent) parent.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); }\n` +
    `        else if (parent) { parent.classList.add("open"); btn.setAttribute("aria-expanded", "true"); }\n` +
    `      });\n` +
    `    });\n` +
    `    document.addEventListener("click", function(e) {\n` +
    `      if (!m.contains(e.target)) {\n` +
    `        m.querySelectorAll(".has-dropdown.open").forEach(function(el) {\n` +
    `          el.classList.remove("open"); var nb = el.querySelector(".nav-btn"); if (nb) nb.setAttribute("aria-expanded", "false");\n` +
    `        });\n` +
    `      }\n` +
    `    });\n` +
    `    document.addEventListener("keydown", function(e) {\n` +
    `      if (e.key !== "Escape") return;\n` +
    `      m.removeAttribute("data-open");\n` +
    `      if (b) b.setAttribute("aria-expanded", "false");\n` +
    `      m.querySelectorAll(".has-dropdown.open").forEach(function(el) {\n` +
    `        el.classList.remove("open"); var nb = el.querySelector(".nav-btn"); if (nb) nb.setAttribute("aria-expanded", "false");\n` +
    `      });\n` +
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
    `})();\n` +
    `${JS_MARK_END}</script>`
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

  // A phone has no hover. If the hover sync is not width-guarded, the first tap
  // on a dropdown fires mouseenter and click together and the menu opens then
  // closes. The block check above does not catch that: replacing the condition
  // with `if (true)` left all 14 tests green. Measured, not assumed.
  //
  // Written without a regex on purpose. This shell collapses backslashes when a
  // pattern is passed through a command string, which is how two lint rules in
  // this repo shipped dead earlier today, matching nothing while reporting clean.
  const enterAt = scriptText.indexOf('addEventListener("mouseenter"');
  const guardWindow = enterAt < 0 ? "" : scriptText.slice(enterAt, enterAt + 220);
  if (!guardWindow.includes("window.innerWidth >")) {
    throw new Error("Behavior script hover sync is not guarded by a viewport-width check");
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
  const unifiedDialogs = occurrences(template, '<dialog id="early-access-modal"');
  if (unifiedDialogs !== 1) {
    throw new Error(`expected 1 unified early-access dialog, found ${unifiedDialogs}`);
  }
}

export function syncHomepageContent(sourceHomepageRaw, builtPageRaw, mastheadCss) {
  const hm = /<header class="mast">[\s\S]*?<\/header>/.exec(builtPageRaw);
  if (!hm) throw new Error("no <header class=\"mast\"> in built page markup");
  let header = hm[0];

  header = header
    .replace(/ aria-current="page"/g, "")
    .replace(/ class="navlink on"/g, ' class="navlink"');

  if (/data-astro-cid/.test(header)) {
    throw new Error("masthead markup carries a scoped-style id; move those rules into masthead.css");
  }

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
  template = rewriteHomepageAccessSurface(template);

  const DEAD_RULES = [
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
  template =
    template.slice(0, lastStyleClose) +
    `\n${MARK}\n${mastheadCss}\n/* end masthead */\n` +
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
  const resultHtml = lines.join("\n");

  return {
    resultHtml,
    header,
    removed,
    template
  };
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const SOURCE_HOMEPAGE = "public/index.html";
  const TARGET_PAGE = "dist/index.html";
  const SOURCE_PAGE = "dist/pricing.html";
  const CSS = "src/styles/masthead.css";

  const built = readFileSync(SOURCE_PAGE, "utf8");
  const mastheadCss = readFileSync(CSS, "utf8");
  const sourceHomepage = readFileSync(SOURCE_HOMEPAGE, "utf8");

  const { resultHtml, header, removed, template } = syncHomepageContent(sourceHomepage, built, mastheadCss);
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

  verifyBehaviorScript(parsed.template);
  verifyHomepageTemplate(parsed.template);

  const navLabels = [...injected[0].matchAll(/(?:class="[^"]*navlink[^"]*"[^>]*>[\s\S]*?<span>([^<]+)<\/span>|class="[^"]*navlink[^"]*"[^>]*>([^<]+)<\/a>)/g)]
    .map((m) => (m[1] || m[2]).trim());
  console.log("masthead synced from Masthead.astro");
  console.log(`  markup identical to the component output: yes (${injected[0].length} chars)`);
  console.log(`  masthead.css injected: ${mastheadCss.split("\n").length} lines`);
  console.log(`  bundle's competing rules removed: ${removed}`);
  console.log(`  behavior verified: 3 unified triggers, 1 dialog, hover sync, mailto fallback, validation`);
  console.log(`  links: ${navLabels.join(" · ")}`);
  console.log(`  all four payloads parse; manifest ${Object.keys(parsed.manifest).length} assets`);
}
