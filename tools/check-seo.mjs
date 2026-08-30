/**
 * THE HEAD, ON EVERY PAGE, CHECKED AT BUILD TIME.
 *
 * Google tracking, canonicals, titles, descriptions and one h1 were all
 * correct when this was written. Nothing held them that way: they come from
 * Base.astro for the 25 Astro pages and from the bundle's own <head> for the
 * homepage, so a new page or a re-exported homepage could drop any of them and
 * the build would stay green. That is what this is for.
 *
 * THE HOMEPAGE IS TWO PAGES IN ONE FILE, and getting that wrong is the trap.
 * `dist/index.html` carries a crawlable static block and, on one line, a JSON
 * payload the runtime unpacks over the document. Every element therefore
 * appears twice in the file's bytes. A raw count of `<h1` reports 2 and the
 * page is correct: a crawler without JavaScript reads the static one, a
 * browser reads the unpacked one, and neither ever sees both. So the file is
 * split into its two views and each is checked as the page it actually is.
 *
 *   node tools/check-seo.mjs
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";

const DIST = "dist";
const SITE = "https://commonparcel.com";
const PAYLOAD_TAG = '<script type="__bundler/template">';

/* Search-result truncation, not style. Titles past ~65 characters and
   descriptions past ~165 get cut off in the SERP, so the tail is written for
   nobody. Both are hard limits here because the copy is inside them. */
export const TITLE_MAX = 65;
export const DESC_MAX = 165;
export const DESC_MIN = 50;

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) {
      if (entry === "_astro" || entry === "fonts") continue;
      walk(p, out);
    } else if (p.endsWith(".html")) out.push(p);
  }
  return out;
}

export function routeOf(file) {
  const rel = relative(DIST, file).split(sep).join("/").replace(/\.html$/, "");
  return rel === "index" ? "/" : "/" + rel;
}

/**
 * The two views of one file. `document` is the file with the payload line
 * removed, which is what a crawler reads. `rendered` is the unpacked payload,
 * which is what a browser reads. A page with no payload has one view.
 */
export function views(html) {
  const lines = html.split("\n");
  const at = lines.findIndex((line) => line.includes(PAYLOAD_TAG));
  if (at === -1) return { document: html, rendered: null };
  let rendered = null;
  try {
    rendered = JSON.parse(lines[at + 1]);
  } catch (err) {
    throw new Error(`the bundle payload is not valid JSON: ${err.message}`);
  }
  const withoutPayload = lines.slice(0, at + 1).concat(lines.slice(at + 2)).join("\n");
  return { document: withoutPayload, rendered };
}

/*
 * Length is counted on what a reader sees, not on the bytes in the file.
 * `association's` is stored as `association&#39;s`, five characters where the
 * result shows one, and the first version of this check reported a title at 69
 * that renders at 65 — it would have had me shorten copy that was already
 * inside the limit. Decode first, then measure.
 */
const ENTITIES = {
  "&#39;": "'", "&apos;": "'", "&quot;": '"', "&amp;": "&", "&lt;": "<",
  "&gt;": ">", "&nbsp;": " ", "&mdash;": "—", "&ndash;": "–", "&hellip;": "…",
  "&rsquo;": "’", "&lsquo;": "‘", "&ldquo;": "“", "&rdquo;": "”",
};

export function decodeEntities(s) {
  if (s === null || s === undefined) return s;
  let out = s;
  for (const [k, v] of Object.entries(ENTITIES)) out = out.split(k).join(v);
  return out.replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)));
}

const pick = (html, re) => {
  const m = re.exec(html);
  return m ? decodeEntities(m[1]) : null;
};

/** Head facts, read from the document view. Only the real <head> has them. */
export function headOf(html) {
  return {
    gaId: pick(html, /gtag\/js\?id=([A-Z0-9-]+)/),
    lang: pick(html, /<html lang="([^"]+)"/),
    title: pick(html, /<title[^>]*>([\s\S]*?)<\/title>/),
    description: pick(html, /<meta name="description" content="([\s\S]*?)"\s*\/?>/),
    canonical: pick(html, /<link rel="canonical" href="([^"]+)"/),
    robots: pick(html, /<meta name="robots" content="([^"]+)"/),
    viewport: /<meta name="viewport"/.test(html),
    ogImage: pick(html, /<meta property="og:image" content="([^"]+)"/),
  };
}

export function countH1(html) {
  return (html.match(/<h1[\s>]/g) || []).length;
}

/**
 * Insecure subresources and links. Scoped to src/href so it cannot trip on
 * prose, an xmlns, or a schema.org @context, none of which a browser fetches.
 */
export function insecureRefs(html) {
  return [...html.matchAll(/(?:src|href)="(http:\/\/[^"]+)"/g)]
    .map((m) => m[1])
    .filter((u) => !u.startsWith("http://www.w3.org/"));
}

export function jsonLdBlocks(html) {
  return [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
}

export function auditPages(files) {
  const problems = [];
  const rows = [];
  const titles = new Map();
  const descriptions = new Map();
  let gaId = null;

  for (const file of files) {
    const route = routeOf(file);
    const raw = readFileSync(file, "utf8");
    const fail = (msg) => problems.push(`${route}: ${msg}`);

    let v;
    try {
      v = views(raw);
    } catch (err) {
      fail(err.message);
      continue;
    }

    const head = headOf(v.document);
    const indexable = !(head.robots || "").includes("noindex");

    if (!head.gaId) fail("no Google tag");
    else if (gaId === null) gaId = head.gaId;
    else if (head.gaId !== gaId) fail(`Google tag is ${head.gaId}, the rest of the site is ${gaId}`);

    if (!head.lang) fail("no lang on <html>");
    if (!head.viewport) fail("no viewport meta");
    if (!head.title) fail("no <title>");
    if (!head.description) fail("no meta description");
    if (indexable && !head.canonical) fail("indexable with no canonical");
    if (indexable && head.canonical && head.canonical !== `${SITE}${route}` && head.canonical !== `${SITE}/`) {
      fail(`canonical ${head.canonical} does not match the route`);
    }

    // Length rules apply to what can appear in a result. A noindex page cannot.
    if (indexable && head.title && head.title.length > TITLE_MAX) {
      fail(`title is ${head.title.length} chars, cut off past ${TITLE_MAX}`);
    }
    if (indexable && head.description) {
      const n = head.description.length;
      if (n > DESC_MAX) fail(`description is ${n} chars, cut off past ${DESC_MAX}`);
      if (n < DESC_MIN) fail(`description is ${n} chars, too thin to earn the click`);
    }

    // One h1 per view, because each view is the whole page to its own reader.
    for (const [name, html] of [["document", v.document], ["rendered", v.rendered]]) {
      if (html === null) continue;
      const n = countH1(html);
      if (n !== 1) fail(`${n} h1 in the ${name} view`);
    }

    for (const [name, html] of [["document", v.document], ["rendered", v.rendered]]) {
      if (html === null) continue;
      const bad = insecureRefs(html);
      if (bad.length) fail(`${bad.length} http:// reference(s) in the ${name} view, first ${bad[0]}`);
    }

    for (const block of jsonLdBlocks(v.document)) {
      try {
        JSON.parse(block);
      } catch (err) {
        fail(`JSON-LD does not parse: ${err.message}`);
      }
    }

    if (indexable && head.title) {
      const key = head.title.trim();
      titles.set(key, [...(titles.get(key) ?? []), route]);
    }
    if (indexable && head.description) {
      const key = head.description.trim();
      descriptions.set(key, [...(descriptions.get(key) ?? []), route]);
    }

    rows.push({ route, indexable, title: head.title?.length ?? 0, desc: head.description?.length ?? 0, ld: jsonLdBlocks(v.document).length });
  }

  for (const [title, routes] of titles) {
    if (routes.length > 1) problems.push(`duplicate title on ${routes.join(", ")}: ${title.slice(0, 60)}`);
  }
  for (const [, routes] of descriptions) {
    if (routes.length > 1) problems.push(`duplicate description on ${routes.join(", ")}`);
  }

  return { problems, rows, gaId };
}

/** Both directions. A page absent from the sitemap and a sitemap entry with no page are different bugs. */
export function auditSitemap(rows) {
  const problems = [];
  const path = join(DIST, "sitemap.xml");
  if (!existsSync(path)) return ["no dist/sitemap.xml"];
  const xml = readFileSync(path, "utf8");
  const listed = [...xml.matchAll(/<loc>https:\/\/commonparcel\.com([^<]*)<\/loc>/g)].map((m) => m[1] || "/");
  const indexable = rows.filter((r) => r.indexable).map((r) => r.route);

  for (const route of indexable) if (!listed.includes(route)) problems.push(`sitemap is missing ${route}`);
  for (const route of listed) {
    if (!indexable.includes(route)) problems.push(`sitemap lists ${route}, which is noindex or has no page`);
  }

  /* An all-today lastmod is worse than none: it tells Google every page
     changed on every deploy, so the signal stops meaning anything. Dates come
     from post data now, and pages without a tracked date carry no lastmod. */
  const stamps = [...xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((m) => m[1]);
  if (stamps.length > 1 && new Set(stamps).size === 1) {
    problems.push(`every sitemap entry claims lastmod ${stamps[0]}; a uniform date is noise`);
  }
  return problems;
}

const isMain = process.argv[1] && process.argv[1].endsWith("check-seo.mjs");
if (isMain) {
  if (!existsSync(DIST)) {
    console.error("No dist/. Run `npm run build` first.");
    process.exit(2);
  }
  const files = walk(DIST).sort();
  const { problems, rows, gaId } = auditPages(files);
  const all = problems.concat(auditSitemap(rows));

  if (all.length) {
    console.log(`\n${all.length} SEO problem(s):`);
    for (const p of all) console.log(`  x ${p}`);
    process.exit(1);
  }
  const indexable = rows.filter((r) => r.indexable).length;
  const withLd = rows.filter((r) => r.ld > 0).length;
  console.log(
    `seo: ${rows.length} pages, ${indexable} indexable, Google tag ${gaId} on all of them, ` +
    `${withLd} carrying JSON-LD, titles <= ${TITLE_MAX}, descriptions ${DESC_MIN}-${DESC_MAX}, one h1 per view`
  );
}
