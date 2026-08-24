/*
 * Every link and button on the site, and whether a screen reader can name it.
 *
 * Read from Chrome's accessibility tree, not from the attributes in the HTML.
 * Two reasons that distinction is the whole point of this file:
 *
 *  1. The homepage is not an Astro page. Its masthead is lifted out of a built
 *     page by tools/sync-homepage-masthead.mjs and written into a JSON template
 *     that the bundle renders at runtime, so an attribute being present in
 *     dist/index.html is not proof the DOM has it.
 *  2. A name can disappear at one width and not another. The masthead home link
 *     was named "Common Parcel" at 1440 and had NO name at 390, because
 *     masthead.css hides .wordmark at 420px and below and the heron inside the
 *     link is aria-hidden. Measured, on this build with the fix removed:
 *
 *       1440   name="Common Parcel"        wordmark-display=block
 *        390   name=""                     wordmark-display=none
 *
 * So: emulate the width, compute the name, and report the empties. Anything
 * that measures one width, or reads the file instead of the DOM, cannot see it.
 *
 * Not in npm run verify: it needs a Chrome on a debugging port and a preview
 * server. tests/masthead-a11y.test.mjs holds the masthead case in the suite.
 * Run this by hand before claiming the site is navigable by keyboard or screen
 * reader.
 *
 *   npm run build && npx astro preview --port 4321 &
 *   chrome --headless=new --remote-debugging-port=9401 --user-data-dir=/tmp/ax about:blank &
 *   node tools/measure-accessible-names.mjs 9401 390
 */
const port = process.argv[2], device = Number(process.argv[3]);
if (!port || !device) { console.error("usage: node tools/measure-accessible-names.mjs <cdp-port> <device-width>"); process.exit(2); }
const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then(r => r.json());
const page = targets.find(t => t.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.addEventListener("open", res, { once: true }); ws.addEventListener("error", rej, { once: true }); });
let id = 0; const pending = new Map();
ws.addEventListener("message", e => { const m = JSON.parse(e.data); if (!m.id || !pending.has(m.id)) return; const { res, rej, t } = pending.get(m.id); pending.delete(m.id); clearTimeout(t); m.error ? rej(new Error(m.error.message)) : res(m.result); });
function send(method, params = {}) { const i = ++id; ws.send(JSON.stringify({ id: i, method, params })); return new Promise((res, rej) => { const t = setTimeout(() => { pending.delete(i); rej(new Error("timeout " + method)); }, 20000); pending.set(i, { res, rej, t }); }); }

await send("Accessibility.enable");
await send("Emulation.setDeviceMetricsOverride", { width: device, height: 844, deviceScaleFactor: 1, mobile: device < 900 });

const ROUTES = ["/", "/about", "/pricing", "/security", "/contact", "/privacy", "/terms", "/why-common-parcel", "/product", "/blog",
  "/product/dues-and-payments", "/product/collections", "/product/accounting-and-budgets", "/product/rules-and-enforcement",
  "/product/meetings-and-voting", "/product/documents-and-answers", "/product/vendors-and-insurance", "/product/resident-portal",
  "/product/records-and-audit"];

// The canary: an anchor whose only content is an aria-hidden span has no name.
// If the probe cannot see this one, it cannot see a real one either.
const CANARY = `(()=>{const a=document.createElement("a");a.href="/";a.id="ax-canary";
  const s=document.createElement("span");s.setAttribute("aria-hidden","true");s.textContent="x";a.appendChild(s);
  document.body.appendChild(a);return true;})()`;

let unnamed = 0, checked = 0, canarySeen = false;
for (const route of ROUTES) {
  await send("Page.navigate", { url: "http://localhost:4321" + route });
  await new Promise(x => setTimeout(x, 1000));
  if (route === "/") await send("Runtime.evaluate", { expression: CANARY, returnByValue: true });

  const doc = await send("DOM.getDocument", { depth: -1 });
  const found = await send("DOM.querySelectorAll", { nodeId: doc.root.nodeId, selector: "a[href], button, [role=button]" });
  const misses = [];
  for (const nodeId of found.nodeIds) {
    const tree = await send("Accessibility.getPartialAXTree", { nodeId, fetchRelatives: false });
    const node = tree.nodes.find(n => n.role && (n.role.value === "link" || n.role.value === "button"));
    if (!node || node.ignored) continue;               // not exposed at all: not a naming question
    checked += 1;
    const name = node.name ? String(node.name.value).trim() : "";
    if (name.length > 0) continue;
    const where = await send("Runtime.evaluate", {
      expression: `(()=>{const e=document.querySelectorAll("a[href], button, [role=button]")[${found.nodeIds.indexOf(nodeId)}];
        return e ? e.tagName.toLowerCase()+(e.id?"#"+e.id:"")+(e.className?"."+String(e.className).trim().split(/\s+/)[0]:"") : "?";})()`,
      returnByValue: true
    });
    const label = where.result.value;
    if (label.includes("ax-canary")) { canarySeen = true; continue; }
    misses.push(label);
  }
  unnamed += misses.length;
  console.log(`${route.padEnd(36)} ${misses.length === 0 ? "ok" : "UNNAMED: " + misses.join(", ")}`);
}
console.log(`\n${checked} named-role elements at ${device}px, ${unnamed} with no accessible name`);
console.log(`canary detected: ${canarySeen ? "yes" : "NO -- this probe proves nothing"}`);
ws.close();
process.exit(unnamed === 0 && canarySeen ? 0 : 1);
