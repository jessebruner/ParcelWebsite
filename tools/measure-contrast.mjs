/*
 * CONTRAST OF TEXT THAT SITS ON A PAINTED PICTURE.
 *
 * A hero's background is not a colour. It is a canvas whose brightest pixel
 * moves as the scene animates, under one or two gradient veils, and the text
 * over it is white. getComputedStyle cannot answer this; it reports
 * `transparent` or the section's --night and calls it clean.
 *
 * So: hide the text, screenshot what is left, and sample the actual pixels
 * under the text's own line boxes. The figure reported is the worst 12px
 * BLOCK, with the worst single pixel printed beside it -- see the note on the
 * sampler for why a single pixel is the wrong unit over dithered art, and why
 * dropping it entirely would be the wrong correction.
 *
 * The canary is the part that makes the zero mean something. An element is
 * measured a second time with every veil removed. If the veil-off reading is
 * not worse than the veil-on reading, the probe is not looking at what it
 * claims to be looking at, and the run fails rather than printing a clean
 * sweep. A probe that cannot see a difference it manufactured itself cannot be
 * trusted to see one it did not.
 *
 * Not in npm run verify: it needs a Chrome on a debugging port and a preview
 * server.
 *
 *   npm run build && npx astro preview --port 4321 &
 *   chrome --headless=new --remote-debugging-port=9333 --user-data-dir=/tmp/p about:blank &
 *   node tools/measure-contrast.mjs 9333 1440 900
 */
const port = process.argv[2];
const width = Number(process.argv[3] || 1440);
const height = Number(process.argv[4] || 900);

const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then((r) => r.json());
const page = targets.find((t) => t.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((res, rej) => {
  ws.addEventListener("open", res, { once: true });
  ws.addEventListener("error", rej, { once: true });
});
let id = 0;
const pending = new Map();
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (!m.id || !pending.has(m.id)) return;
  const { res, rej, t } = pending.get(m.id);
  pending.delete(m.id);
  clearTimeout(t);
  m.error ? rej(new Error(m.error.message)) : res(m.result);
});
function send(method, params = {}) {
  const i = ++id;
  ws.send(JSON.stringify({ id: i, method, params }));
  return new Promise((res, rej) => {
    const t = setTimeout(() => { pending.delete(i); rej(new Error("timeout " + method)); }, 30000);
    pending.set(i, { res, rej, t });
  });
}
const ev = async (expression) => {
  const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(String(r.exceptionDetails.exception?.description));
  return r.result.value;
};

/* The selectors that sit on a picture, and what each one needs.
   WCAG: 3:1 for large text (>=24px bold or >=30px), 4.5:1 for the rest. */
const ON_ART = [
  { sel: ".hero .t-display", need: 3, what: "hero h1" },
  { sel: ".hero .t-lede", need: 4.5, what: "hero lede" },
  { sel: ".hero .btn", need: 4.5, what: "hero button" },
  { sel: ".closer h2", need: 3, what: "closer headline" },
  { sel: ".closer .btn", need: 4.5, what: "closer button" },
];

const ROUTES = [
  "/product/dues-and-payments", "/product/collections", "/product/accounting-and-budgets",
  "/product/rules-and-enforcement", "/product/meetings-and-voting", "/product/documents-and-answers",
  "/product/vendors-and-insurance", "/product/resident-portal", "/product/records-and-audit",
  "/product", "/pricing", "/security", "/about", "/contact", "/why-common-parcel", "/blog",
];

/* Injected into the page: sample a screenshot data URL over a box. */
const SAMPLER = `
window.__minContrast = async (dataUrl, lines, colour) => {
  const img = new Image();
  await new Promise((r, j) => { img.onload = r; img.onerror = j; img.src = dataUrl; });
  const cv = document.createElement("canvas");
  cv.width = img.width; cv.height = img.height;
  const g = cv.getContext("2d");
  g.drawImage(img, 0, 0);
  const dpr = img.width / window.innerWidth;
  const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const lum = (r, gg, b) => 0.2126 * lin(r) + 0.7152 * lin(gg) + 0.0722 * lin(b);
  const m = colour.match(/[\\d.]+/g).map(Number);
  const L1 = lum(m[0], m[1], m[2]);
  const ratio = (L2) => (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);

  /*
   * TWO FIGURES, AND THE BLOCK ONE IS THE ANSWER.
   *
   * The art is ordered-dithered across a nineteen-stop ramp and upscaled with
   * image-rendering: pixelated. The top stop of the dawn ramp is #FBF8F4,
   * which is --paper, which is the headline's own colour, so a
   * worst-single-pixel metric can find one speckle of the text colour and
   * report 1.00:1 on a heading anyone can read. A reader does not see one
   * pixel; they see a patch. BLOCK is 12px, about three source pixels at the
   * scale these canvases upscale to.
   *
   * The single-pixel figure is returned beside it rather than dropped. A large
   * gap between the two is the tell that the sample sits on dither rather than
   * on flat ground, and losing that signal is how the block average stops
   * being a correction and starts being a way to pass.
   */
  const BLOCK = 12;
  let worstPixel = 99;
  let worstBlock = 99;
  for (const box of lines) {
    const x = Math.max(0, Math.round(box.x * dpr));
    const y = Math.max(0, Math.round(box.y * dpr));
    const w = Math.max(1, Math.min(cv.width - x, Math.round(box.w * dpr)));
    const h = Math.max(1, Math.min(cv.height - y, Math.round(box.h * dpr)));
    if (x >= cv.width || y >= cv.height) continue;
    const d = g.getImageData(x, y, w, h).data;
    for (let by = 0; by < h; by += BLOCK) {
      for (let bx = 0; bx < w; bx += BLOCK) {
        let sum = 0;
        let n = 0;
        for (let yy = by; yy < Math.min(h, by + BLOCK); yy++) {
          for (let xx = bx; xx < Math.min(w, bx + BLOCK); xx++) {
            const i = (yy * w + xx) * 4;
            const L2 = lum(d[i], d[i + 1], d[i + 2]);
            sum += L2;
            n += 1;
            const c = ratio(L2);
            if (c < worstPixel) worstPixel = c;
          }
        }
        if (!n) continue;
        const c = ratio(sum / n);
        if (c < worstBlock) worstBlock = c;
      }
    }
  }
  return { block: worstBlock, pixel: worstPixel };
};
"ok"`;

/**
 * ONE ELEMENT, ITS LINE BOXES, AND WHETHER IT PAINTS ITS OWN GROUND.
 *
 * Two faults in the first version of this, both of which made it report
 * failures that were not there, and both worth naming because they are the
 * obvious way to write it.
 *
 * 1. The element's border box is not where the text is. A paragraph's box runs
 *    the width of its column, so the empty space to the right of a short last
 *    line is inside it. Sampling the lightest pixel over that box measures the
 *    picture beside the text, not behind it. Range line rects are tight to the
 *    glyphs on each line; the gaps between letters are still sampled, which is
 *    correct, because that is what a reader sees through the text.
 *
 * 2. A filled button paints its own ground. Hiding it to see what is behind it
 *    removes the fill as well, so the probe compared the button's dark label
 *    against the dark picture the button was covering and reported 1.08 on a
 *    white-on-terracotta control that any reader can see is fine. An element
 *    with an opaque background of its own is a plain colour pair and needs no
 *    screenshot at all.
 */
async function boxes(sel) {
  return ev(`(() => {
    const out = [];
    for (const el of document.querySelectorAll(${JSON.stringify(sel)})) {
      const cs = getComputedStyle(el);
      const bg = cs.backgroundColor;
      const a = bg.startsWith("rgba") ? Number(bg.match(/[\\d.]+/g)[3]) : 1;
      const scene = (el.closest("[data-scene]") || {}).dataset?.scene ?? "-";

      if (bg !== "transparent" && a > 0.92) {
        out.push({ own: bg, colour: cs.color, scene });
        continue;
      }
      const range = document.createRange();
      range.selectNodeContents(el);
      const lines = [...range.getClientRects()].filter((r) => r.width > 2 && r.height > 2);
      if (!lines.length) continue;
      out.push({
        lines: lines.map((r) => ({ x: r.x, y: r.y, w: r.width, h: r.height })),
        colour: cs.color,
        scene,
      });
    }
    return out;
  })()`);
}

/** Contrast of two CSS colours, for an element that paints its own ground. */
const pairContrast = (fg, bg) => ev(`(() => {
  const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const lum = (s) => { const m = s.match(/[\\d.]+/g).map(Number);
    return 0.2126 * lin(m[0]) + 0.7152 * lin(m[1]) + 0.0722 * lin(m[2]); };
  const a = lum(${JSON.stringify(fg)}), b = lum(${JSON.stringify(bg)});
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
})()`);

const hideText = (sel) => ev(`(() => {
  for (const el of document.querySelectorAll(${JSON.stringify(sel)})) el.style.visibility = "hidden";
  return "ok";
})()`);
const showText = (sel) => ev(`(() => {
  for (const el of document.querySelectorAll(${JSON.stringify(sel)})) el.style.visibility = "";
  return "ok";
})()`);
const setVeil = (on) => ev(`(() => {
  for (const el of document.querySelectorAll(".veil")) el.style.display = ${on ? '""' : '"none"'};
  return "ok";
})()`);

async function shot() {
  const r = await send("Page.captureScreenshot", { format: "png" });
  return "data:image/png;base64," + r.data;
}

await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 900 });
await send("Page.enable");

let readings = 0;
let failures = 0;
let canaryProved = 0;
let canaryFlat = 0;
let dithered = 0;

for (const route of ROUTES) {
  await send("Page.navigate", { url: `http://127.0.0.1:4321${route}` });
  await new Promise((r) => setTimeout(r, 2200));
  await ev(SAMPLER);

  for (const { sel, need, what } of ON_ART) {
    const found = await boxes(sel);
    if (!found.length) continue;
    /* Scroll each into view one at a time; a box off-screen is not in the shot. */
    for (let i = 0; i < found.length; i++) {
      await ev(`(() => {
        const el = document.querySelectorAll(${JSON.stringify(sel)})[${i}];
        el.scrollIntoView({ block: "center", behavior: "instant" });
        return "ok";
      })()`);
      await new Promise((r) => setTimeout(r, 500));
      const [box] = (await boxes(sel)).slice(i, i + 1);
      if (!box) continue;

      let withVeil;
      let pixel = null;
      let noVeil = null;
      if (box.own) {
        /* Paints its own ground: a colour pair, and the picture is irrelevant. */
        withVeil = await pairContrast(box.colour, box.own);
      } else {
        await hideText(sel);
        const on = await ev(
          `window.__minContrast(${JSON.stringify(await shot())}, ${JSON.stringify(box.lines)}, ${JSON.stringify(box.colour)})`,
        );
        withVeil = on.block;
        pixel = on.pixel;
        await setVeil(false);
        noVeil = (await ev(
          `window.__minContrast(${JSON.stringify(await shot())}, ${JSON.stringify(box.lines)}, ${JSON.stringify(box.colour)})`,
        )).block;
        await setVeil(true);
        await showText(sel);
      }

      readings += 1;
      const ok = withVeil >= need;
      if (!ok) failures += 1;
      if (noVeil !== null) {
        if (noVeil < withVeil - 0.02) canaryProved += 1;
        else canaryFlat += 1;
      }
      /* A block figure far above its own worst pixel means the sample sits on
         dither. Worth seeing even when both pass. */
      if (pixel !== null && withVeil - pixel > 1.5) dithered += 1;
      const flag = ok ? "  " : "!!";
      console.log(
        `${flag} ${route.padEnd(34)} ${box.scene.padEnd(8)} ${what.padEnd(16)}` +
          `${withVeil.toFixed(2).padStart(6)} (need ${need})   ` +
          (noVeil === null
            ? "own ground"
            : `worst px ${pixel.toFixed(2).padStart(5)}   veil off ${noVeil.toFixed(2)}`),
      );
    }
  }
}

console.log(`\n${readings} readings, ${failures} below threshold.`);
console.log(`canary: ${canaryProved} readings got worse with the veil removed, ${canaryFlat} did not.`);
console.log(`${dithered} readings sit on dither: the 12px block figure is more than 1.5 above the worst single pixel.`);
if (canaryProved === 0) {
  console.error("PROBE IS BLIND: removing every veil changed nothing. The clean sweep means nothing.");
  process.exit(3);
}
process.exit(failures ? 2 : 0);
