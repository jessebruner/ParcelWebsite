/**
 * One-shot generator for the eight short core pages.
 *
 * They are short and share a shape, so writing them from one place keeps the
 * head props consistent. Delete this once they start diverging; a generator that
 * outlives its usefulness is worse than eight files.
 */
import { writeFileSync } from "node:fs";

const L = (...lines) => lines.join("\n") + "\n";

const head = (title, description, path, extra = {}) => {
  const props = [
    '  title="' + title + '"',
    '  description="' + description + '"',
    '  path="' + path + '"',
  ];
  if (extra.reviewed) props.push('  reviewed="' + extra.reviewed + '"');
  if (extra.shareTitle) props.push('  shareTitle="' + extra.shareTitle + '"');
  return props.join("\n");
};

const page = ({ file, title, description, path, eyebrow, h1, lede, bands, close, reviewed, depth = 1 }) => {
  const up = depth === 1 ? ".." : "../..";
  const out = [
    "---",
    "import Base from \"" + up + "/layouts/Base.astro\";",
    "import Hero from \"" + up + "/components/Hero.astro\";",
    "import Band from \"" + up + "/components/Band.astro\";",
    "---",
    "",
    "<Base",
    head(title, description, path, { reviewed }),
    ">",
    "  <Hero" + (eyebrow ? ' eyebrow="' + eyebrow + '"' : "") + ">",
    "    <h1 class=\"t-display\">" + h1 + "</h1>",
    lede ? "    <p class=\"t-lede\">" + lede + "</p>" : "",
    "  </Hero>",
    "",
    ...bands.map((b) => [
      "  <Band title=\"" + b.title + "\"" + (b.field ? " field" : "") +
        (b.note ? " note=\"" + b.note[0] + "\" noteHref=\"" + b.note[1] + "\"" : "") + ">",
      ...b.body.map((x) => "    " + x),
      "  </Band>",
      "",
    ].join("\n")),
    close ? [
      "  <section class=\"close on-ink\">",
      "    <div class=\"page\">",
      "      <h2 class=\"t-sheet\">" + close.h2 + "</h2>",
      "      <div class=\"actions\"><a class=\"btn btn--on-ink\" href=\"" + close.href + "\">" + close.label + "</a></div>",
      "    </div>",
      "  </section>",
    ].join("\n") : "",
    "</Base>",
    "",
    close ? [
      "<style>",
      "  .close { background: var(--cold); color: var(--paper); border-top: 1.5px solid var(--terracotta); }",
      "  .close h2 { color: var(--paper); max-width: 26ch; }",
      "  .close .actions { margin-top: var(--s-6); }",
      "</style>",
    ].join("\n") : "",
  ].filter((x) => x !== "").join("\n");
  writeFileSync(file, out + "\n");
  console.log("  " + file);
};

const p = (s) => "<p>" + s + "</p>";
const coda = (s) => "<p class=\"coda\">" + s + "</p>";
const rows = (items) => "<ul class=\"rows\">" + items.map((i) => "<li>" + i + "</li>").join("") + "</ul>";

/* ── About ────────────────────────────────────────────────────────────── */
page({
  file: "src/pages/about.astro",
  title: "About",
  description: "Common Parcel is built in Detroit for volunteer boards that run the association themselves. Written by one person who read the statutes by hand.",
  path: "/about",
  eyebrow: "About",
  h1: "Built for the board, not the manager",
  lede: "Most software in this category is sold to management companies. It assumes a trained administrator exists. For a self-managed board, that person does not.",
  bands: [
    {
      title: "The difference that produces",
      body: [
        p("There are a few neighbors with day jobs and a legal obligation, and the software has to do the work instead of handing it to somebody."),
        coda("That is the whole difference, and it shows up in every screen."),
      ],
    },
    {
      title: "Why the documents matter so much",
      field: true,
      body: [
        p("An association is governed by its own declaration and bylaws, which interact with state law differently in every state. No two associations are the same."),
        coda("That is why generic property software fits this so badly, and why Parcel starts by reading your documents instead of asking you to describe them."),
      ],
    },
    {
      title: "Why it admits what it does not know",
      body: [
        p("A board of volunteers can be sued for what it does. Anything Parcel produces might be read aloud by a lawyer."),
        p("So a citation that cannot be traced to a page in your own documents is not printed. A statutory clock resting on a provision nobody has read does not run. Where the answer is unknown, the interface says unknown."),
        coda("That is a slower product than one that guesses. It is the only kind worth having here."),
      ],
    },
    {
      title: "Who is building it",
      field: true,
      note: ["Email me", "/contact"],
      body: [
        p("Jesse Bruner. Detroit, Michigan."),
        p("I read the statutes for this by hand, one provision at a time, and recorded where each one came from. There are a few hundred still to read and the product says which."),
      ],
    },
  ],
  close: { h2: "Tell me about your association.", href: "/demo", label: "Get early access" },
});

/* ── Security ─────────────────────────────────────────────────────────── */
page({
  file: "src/pages/security.astro",
  title: "Security",
  description: "Where association records live, who can reach them, what is logged, and how to get everything out.",
  path: "/security",
  eyebrow: "Security",
  h1: "Where your records live, and who can reach them",
  lede: "",
  reviewed: "August 2026",
  bands: [
    {
      title: "Your money never passes through us",
      body: [p("Owners pay into the association's own bank account, in the association's own name. Parcel is not in that path and has no ability to move association money.")],
    },
    {
      title: "Every action is attributed",
      field: true,
      body: [p("Parcel keeps a numbered record of what happened, who did it, when, and on what basis. Reads are recorded as well as writes, so who looked at this has an answer.")],
    },
    {
      title: "Anything statutory takes two officers",
      body: [
        p("A lien, a fine, or a statutory notice needs two distinct board members to sign. There is no batch approval and no way for the software to sign for a board. A database constraint enforces it, so a retry or a second server cannot satisfy it alone."),
        coda("Stopping something is different. Any board member can halt an action alone, because halting is safe."),
      ],
    },
    {
      title: "Access is scoped by office",
      field: true,
      body: [p("A resident sees their own lots and nothing else. Committee members see the queue they were given. Officers see the association. Nobody sees another association.")],
    },
    {
      title: "You can take it all out",
      note: ["Report a problem", "/contact"],
      body: [p("A full export of ledgers, documents, minutes and the record is available any month, including the month you leave. The records belong to the association.")],
    },
  ],
});

/* ── Contact ──────────────────────────────────────────────────────────── */
page({
  file: "src/pages/contact.astro",
  title: "Contact",
  description: "Email the founder directly. No form routing, no queue.",
  path: "/contact",
  eyebrow: "Contact",
  h1: "Talk to a person",
  lede: "jesse@commonparcel.com",
  bands: [
    {
      title: "What to expect",
      body: [
        p("I read this myself and answer. There is no queue and no routing."),
        coda("Tell me your state and roughly how many lots and I can usually say something useful in the first reply."),
      ],
    },
    {
      title: "Where we are",
      field: true,
      body: [p("Common Parcel<br />1420 Washington Blvd, Ste 301<br />Detroit, MI 48226")],
    },
  ],
});

/* ── Demo ─────────────────────────────────────────────────────────────── */
page({
  file: "src/pages/demo.astro",
  title: "See it running",
  description: "A walkthrough of the board's month: the declaration going in, and the notices waiting for signature.",
  path: "/demo",
  eyebrow: "Early access",
  h1: "See it running",
  lede: "Fifteen minutes, on a call, with your own documents if you want.",
  bands: [
    {
      title: "What I show you",
      body: [rows([
        "<b>Upload.</b> Your declaration goes in and the provisions come out with the page each one sits on.",
        "<b>The month.</b> What Parcel invoices, reconciles, watches and drafts without being asked.",
        "<b>The stop.</b> Where it puts something in front of the board instead of sending it.",
        "<b>Your state.</b> What has been read for your jurisdiction, and what has not.",
      ])],
    },
    {
      title: "What to bring",
      field: true,
      body: [
        p("Your declaration and your roster, if you have them to hand."),
        coda("If you would rather see it on sample data first, that is fine. Say so."),
      ],
    },
    {
      title: "How to book it",
      note: ["See the price", "/pricing"],
      body: [p("Email <a href=\"mailto:jesse@commonparcel.com\">jesse@commonparcel.com</a> with your state and your lot count. I answer the same day.")],
    },
  ],
});

/* ── Changelog ────────────────────────────────────────────────────────── */
page({
  file: "src/pages/changelog.astro",
  title: "Changelog",
  description: "What shipped, and when. Statutory reading is listed too, because coverage is part of the product.",
  path: "/changelog",
  eyebrow: "Changelog",
  h1: "What shipped",
  lede: "Newest first. Statutory reading is listed alongside the software, because coverage is part of the product.",
  bands: [
    {
      title: "18 August 2026",
      body: [rows([
        "<b>The site.</b> Rebuilt on one navigation, with a page behind every link.",
        "<b>Compliance.</b> The statutory engine and the legislative watch documented in public, gaps included.",
      ])],
    },
    {
      title: "How this list is kept",
      field: true,
      body: [coda("Entries are generated from the release and from the statutory data, so coverage changes appear here without being written by hand.")],
    },
  ],
});

/* ── 404 ──────────────────────────────────────────────────────────────── */
page({
  file: "src/pages/404.astro",
  title: "Page not found",
  description: "That page is not here.",
  path: "/404",
  h1: "That page is not here",
  lede: "It may have moved, or the link may be wrong.",
  bands: [
    {
      title: "Try one of these",
      body: [rows([
        "<a href=\"/\">Home</a>",
        "<a href=\"/product/dues-and-payments\">What Parcel does</a>",
        "<a href=\"/compliance\">Compliance</a>",
        "<a href=\"/pricing\">Pricing</a>",
      ])],
    },
    {
      title: "If a link on this site sent you here",
      field: true,
      body: [p("Tell me and I will fix it. <a href=\"mailto:jesse@commonparcel.com\">jesse@commonparcel.com</a>")],
    },
  ],
});

/* ── Privacy ──────────────────────────────────────────────────────────── */
page({
  file: "src/pages/privacy.astro",
  title: "Privacy",
  description: "What Common Parcel collects, who owns association records, and how to get them out.",
  path: "/privacy",
  eyebrow: "Privacy",
  h1: "Privacy",
  lede: "The full policy is with counsel. What follows is factual and will not change when it lands.",
  bands: [
    {
      title: "Who owns the records",
      body: [p("The association owns its records. Parcel processes them on the association's behalf and holds no claim to them.")],
    },
    {
      title: "What that means in practice",
      field: true,
      body: [rows([
        "A full export of ledgers, documents, minutes and the record is available any month.",
        "Reads are logged as well as writes.",
        "Owners pay into the association's own bank account. Parcel is not in the payment path.",
        "A resident sees their own lots and nothing else.",
      ])],
    },
    {
      title: "Questions about your data",
      note: ["Email the founder", "/contact"],
      body: [p("Write to <a href=\"mailto:jesse@commonparcel.com\">jesse@commonparcel.com</a> and I will answer directly.")],
    },
  ],
});

/* ── Terms ────────────────────────────────────────────────────────────── */
page({
  file: "src/pages/terms.astro",
  title: "Terms",
  description: "Billing, cancellation, export, and what Common Parcel is not.",
  path: "/terms",
  eyebrow: "Terms",
  h1: "Terms",
  lede: "The full terms are with counsel. The commercial ones below are settled and will not change when they land.",
  bands: [
    {
      title: "Billing",
      body: [rows([
        "Monthly. No contract and no setup fee.",
        "Priced per lot on the published rate card, with a monthly minimum.",
        "Migration is included.",
      ])],
    },
    {
      title: "Leaving",
      field: true,
      body: [p("Cancel any month. A full export of ledgers, documents, minutes and the record is available in the month you leave.")],
    },
    {
      title: "What Parcel is not",
      note: ["See the price", "/pricing"],
      body: [
        p("Parcel is not a law firm and does not give legal advice. It records what your documents and your state's statute say, and where each came from."),
        coda("Anything with legal weight waits for two officers to sign. That is a product constraint, not a setting."),
      ],
    },
  ],
});

console.log("\ndone");
