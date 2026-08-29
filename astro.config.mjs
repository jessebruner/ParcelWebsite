// @ts-check
import { defineConfig } from "astro/config";

/**
 * Static, served from GitHub Pages on its own domain, so no base path and no
 * adapter. `site` is set because canonicals, the sitemap and the JSON-LD all
 * need absolute URLs.
 *
 * build.format "file" writes /pricing.html rather than /pricing/index.html, and
 * trailingSlash "never" matches how every internal link here is written, so the
 * canonical tag and the served URL agree.
 */
export default defineConfig({
  site: "https://commonparcel.com",
  trailingSlash: "never",
  build: { format: "file" },
  compressHTML: true,
  devToolbar: { enabled: false },
});
