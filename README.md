# Common Parcel website

An Astro static site for volunteer HOA boards. All 26 routes, including the homepage, share the same layout, navigation, fonts, and footer.

## Work locally

Use Node.js 24 or later.

```sh
npm ci
npm run dev
npm run verify
```

`verify` builds the site, runs the regression suite, checks reproducible builds, checks internal links, lints copy, and validates metadata and structured data. `node tools/verify.mjs` is equivalent when Node is available without npm on PATH.

## Edit the site

- Pages: `src/pages/`; homepage: `src/pages/index.astro`.
- Shared visual tokens: `src/styles/tokens.css`.
- Primary app destination and homepage FAQs: `src/data/site.ts`.
- Feature copy: `src/data/features/`; shared template: `src/pages/product/[slug].astro`.
- Pricing math: `src/components/pricing/brackets.ts`. All price examples and the calculator use it.
- Board guides and original citations: `src/data/blog.ts`.
- Route manifest: `src/data/routes.ts`; the build generates `dist/sitemap.xml`.

Conversion CTAs link to `https://app.commonparcel.com`. Product illustrations contain sample information and are labeled as illustrations. Decorative pixel landscapes are painted once near the viewport; there is no autoplay. The site remains readable without JavaScript. The calculator shows a labeled 50-lot example without JavaScript and validates whole-number inputs when interactive.

The GitHub Pages workflow publishes `dist` from the main branch. Branch work and local previews do not publish the website.
