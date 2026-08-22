# Voice, for the marketing site

This extends `docs/VOICE.md` in the product repo (`jessebruner/ParcelHOA`). That
document is not superseded here. Read it first; it governs anything a board
member, resident or homeowner receives, and the marketing site is one of those
things.

It already contains the rule we broke:

> Say the consequence, not the mechanism.

and

> No internal nouns — no *entity*, *record type*, *dispatch*, *provider*,
> *tier*, *ingest*.

Every heading Jesse rejected on 2026-08-22 violates one of those two lines. The
rule was written down in the sibling repo and this repo had no copy of it, so
seven pages were written without it. What follows is the marketing-specific
part, and nothing else.

---

## The reference page

The homepage is the only page the owner has called near-final. Its visible
feature headlines, verbatim from the shipped bundle:

> Simplify due-collection. · Let Common Parcel keep track of violations. · Get
> the best price with Automatic Contract Renewal. · Let residents vote easily
> and securely. · Super simple setup. · Empower residents. · Everything is
> securely stored.

Read them as a set. No aphorism, no sentence fragment, no mirrored clauses, no
withheld noun. Each names a thing the reader gets, in words the reader already
owns. **When a draft heading feels more interesting than these, it is wrong.**

---

## Rule A — A heading is a claim about what the reader gets

A heading that only makes sense after you have read the paragraph under it is a
caption, and captions belong under pictures.

Three questions, all of which must pass:

1. Scanning at speed, does a board treasurer know whether this section is
   about them?
2. Is it the benefit or the machinery? Machinery goes in the body, the table,
   or the visual — that is what the visual is *for*.
3. Could you say it aloud to that treasurer without them asking "meaning
   what?"

| Rejected | Why | Direction |
| --- | --- | --- |
| Two officers to authorize. One to halt. | Machinery. Nobody buys software for its approval quorum. | Nobody can move money alone |
| Access is scoped strictly by role | The reader is not the subject of their own sentence. | Everyone sees only their own business |
| Where your records live, and who can reach them | Two half-topics hinged on "and", answering neither. | Your records stay yours |
| Direct bank settlement with zero software custody | Three coinages in six words. | We never touch the money |
| One price. Everything is in it. | Withholds the noun. What is everything? | See Rule C |

This is the product guide's "consequence, not mechanism" applied to headings
specifically, because a heading is where the cost of getting it wrong is
highest: body copy that reads badly gets read anyway, a heading that reads
badly loses the reader.

## Rule B — The vocabulary is theirs, not ours

The product guide bans internal nouns. The marketing site has invented its own
set, which is the same failure with new words:

| Ours | Theirs |
| --- | --- |
| zero software custody | we never touch the money |
| consequential actions | fines, liens and notices |
| dispatch decision | whether the letter goes out |
| settlement | the money reaching your bank |
| pass-through cost | what postage actually costs |
| operating matrix | *(delete; show the table)* |

Test: would a board member have said this word before meeting us? If we taught
it to them, it is ours and it does not belong in a heading.

## Rule C — Never write a heading that withholds its own subject

"Everything is included" makes the reader work for a fact we could have given
them. Teasers are for headlines competing for a click; a scanner who has
already arrived does not need baiting, and baiting them spends the two seconds
we had.

Say the noun. And note that this particular heading also fails Rule E, because
mail delivery will be billed separately — so the honest version is narrower,
not just longer.

## Rule D — Six AI tells the linter does not catch

Each is present in the current pages. None trips `npm run voice`.

1. **The parallel fragment aphorism.** "Two officers to authorize. One to
   halt." Two clipped clauses in mirrored shape, standing in for an argument.
   Sibling of the `REVERSAL` rule the linter already has.
2. **The heading that is a caption.** Rule A.
3. **The noun tricolon.** "Notice, quorum, vote, minutes." Four nouns read as
   gravitas. It is a table of contents wearing a heading's clothes.
4. **The abstract nominalisation as subject.** "Access is scoped", "Citation
   coverage extends". The human disappears from the sentence.
5. **The "and" hinge title.** Two half-topics joined because neither carried
   the heading alone.
6. **The coined compound.** "software custody", "answer-engine surface". Two
   ordinary words fused into a term of art nobody requested.

## Rule E — Plainer is not looser

Tightening is not licence to widen a claim. "We never touch the money" is
allowed because owners pay into the association's own account and we hold no
balances: it is shorter *and* true. "Everything is included" is not, because
postage will be billed on top.

Before shortening a claim, check the claim survives the short version. This is
the failure shortening invites, and it is worse than the verbosity it cures.
The product guide's harder version still applies here: never promise a legal
effect the product cannot deliver.

---

## What the linter checks, and what it misses

`tools/voice-lint.mjs` runs on `dist`, not `src`, so it checks what a reader
actually receives. It bans AI vocabulary, stock frames, presumption about the
reader's life, and uncited numbers in top-of-funnel copy. It is good at what it
covers.

Two gaps, both measured at `3fd03c6` on 2026-08-22:

**1 · The `MECHANISM` rule already knows, at the wrong scope.** It bans `two
officers`, `audit trail`, `citation`, `legal weight` — on the `hero` and
`email` surfaces only. `/security` is a `general` surface, so "Two officers to
authorize. One to halt." passes as an H2:

```
security: general=0  hero=6
    only-at-hero  MECHANISM_IN_TOF  Two officers to authorize. One to halt.
```

The fix is not to widen the surface. Linting `/pricing` at hero surface
produces 43 problems, and most are correct copy — the price table and the
Detroit street address are supposed to contain digits. The fix is a **heading
scope**: apply `MECHANISM`, `COUNT` and `NOT_SELLING_POINT` to `h1`/`h2` on
every page, and leave body copy alone. That requires `extractCopy` to keep the
tag each line came from, which it currently discards.

**2 · The homepage's visible copy is never linted.** `extractCopy` strips
`<script>`, and the homepage ships as a compressed payload inside one. On a
1,584,693-byte `dist/index.html` the linter extracts 11,234 characters — the
crawler-only static block:

```
"Empower residents"           false
"Simplify due-collection"     false
"Demo mode"                   false
lint problems on homepage: 0
```

"8/8 pages clean" has meant seven Astro pages and a fragment of the eighth.

That gap surfaced one real conflict. `empower` was on the banned-word list and
the approved homepage says "Empower residents." Jesse settled it on 2026-08-22
in favour of the homepage, so `empower` came off the list.

The reasoning is worth keeping, because it decides the next case too. The list
exists to catch copy that reads as generated. "Empower residents." is a plain
two-word imperative about the reader; the words on the list are abstractions
standing in for a benefit nobody has stated. `empower` was on the list because
it appears on every published list of AI tells, which is a reason to look at a
word, not a reason to ban it. When the guide and a page Jesse has approved
disagree, the guide moves.
