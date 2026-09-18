# Navigation and product illustrations

The menu and illustrations use the existing paper, terracotta, ink, serif, and pixel landscape vocabulary. Forest and sage are supporting colors for financial progress and property records. Status always includes a word or number, not color alone.

## Navigation

`Masthead.astro` reads the feature directory from `PRODUCT_GROUPS` in `routes.ts`. Each of three groups has three destinations. Link names describe the feature; one sentence explains the benefit. The desktop menu has a separate editorial panel for a product story, tour, or future campaign. Its current link goes to the product tour. The footer shows the four-unit price from the canonical pricing function.

Both disclosures use 14px SVG chevrons. Native markers are suppressed, and the SVG rotates when open. Native `details` keeps the directory usable without JavaScript. With JavaScript, desktop pointer entry opens after 140ms, pointer exit closes after 220ms, and clicking latches the panel open. The panel's invisible upper bridge prevents a gap between trigger and menu. Only one panel can be open. Clicking outside closes it; Escape closes it and restores focus; Arrow Down enters its links. Leaving with the keyboard closes the panel. No focus trap or application-menu roles are used for ordinary navigation links.

At 900px and below, the navigation becomes a button-controlled disclosure. Marketing panels and descriptions disappear, while all feature links, overview, price, and security remain. Under 620px, groups form one vertical directory. Navigation scrolls within the available viewport. Reduced-motion preferences disable opening and icon transitions through the global stylesheet.

## Illustrations

`FeatureScene.astro` selects one of nine components in `product/scenes`. Each tells a different story using fictional data. `PropertyDrawing.astro` provides the shared house drawing, with an optional fence. `feature-scenes.css` explicitly scopes every selector beneath `.feature-scene`; these styles remain attached when markup moves between Astro components. Container queries adapt the artwork to its actual column width, including narrow desktop columns and phones.

Each example has one `role="img"` with a meaningful description from `product-illustrations.ts`. Inner artwork is hidden from assistive technology. The visible caption identifies fictional association data. There are no focusable controls inside an illustration. These are explanatory compositions, not screenshots of the application's exact interface.

The examples retain board review, draft notices, and pending decisions. Insurance on file is not represented as verified coverage. Payment totals are sample records, not evidence of an active provider connection. When an example changes, update its description and check all related amounts, dates, and statuses.

Shared CSS is emitted as cacheable files rather than repeated inline on every page. This keeps the homepage's existing HTML size budget intact while allowing the richer navigation and illustrations.

To add a product scene, add its component and accessible description, register it in `FeatureScene.astro`, and inspect the actual result at a narrow container width and on desktop. The regression checks require every feature to have a distinct illustration and prevent fake controls from entering keyboard navigation.
