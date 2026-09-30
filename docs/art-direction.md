# kacper.biz: art direction

The visual system is recorded in `DESIGN.md` (tokens in `.impeccable/design.json`); the direction contract for the
site lives in `.impeccable/surfaces/src-pages-index-astro.md`, product truth in `PRODUCT.md`. This file keeps the
idea and the copy rules in one place for people editing texts.

## Idea

**kacper.biz is a dark product studio with one sculpture in it.** The object is a monolith of 100 machined
aluminium slices, three of them copper: 100 micro-firms in CEIDG, of which only 3 list a website. Scrolling is the
camera moving round the studio while the slices re-form into each chapter's pose; between chapters cream evidence
sheets slide over the film carrying the facts (the index of sectors, campaign results, prices, client sites, contact).
Chosen by the owner on 30.09.2026 as the category standard played straight, with Oryzo (oryzo.ai) as the craft bar.

The numbers are his: 3 181 616 active sole proprietorships in 30 sectors (CEIDG via outreachpilot.pl/firmy,
29.09.2026); 3 in 100 micro-firms list a website in CEIDG (sample 4 700, 7.07.2026).

## Grounds and the one accent

Studio #0E0C0A for the film, graphite #191613 for the dark sheet (FastBot at night), cream #EDE7DC for the evidence
sheets. Text #EDE6DA on dark, ink #15120F on cream. Copper is the only hue: the three slices, the primary action,
the lit chapter on the rail. No second hue, no gradients on type.

## Type

Funnel Display for the name and headings (500, tight tracking; the name in two lines at about 11vw, 18vw on a
phone), Funnel Sans for reading, Martian Mono only for short labels and data (counts, dates, the rail). Tabular
lining numerals for figures. No kickers above headings.

## The film (WebGL)

| chapter | pose | camera |
|---|---|---|
| 0 Start | monolith, copper slices standing proud | three-quarter, object right |
| 1 3 na 100 | rotunda: the slices fan round a spine, copper rises | high, looking down into it |
| 2 OutreachPilot | the drawer: slices filed like registry cards, a wave flicks through them | low along the drawer |
| 3 FastLanding | the slices laid out as a landing page on a plinth | front, page turned to the light |
| 4 Kontakt | monolith again | low, close, object left |

Motion grammar: machined, weighted, damped; the object moves, the type holds still; one line-mask reveal per chapter
headline. Subpages hold one pose (`data-film-pose`). Without a GPU every stage shows the still of its pose
(`npm run stills`, rendered from the same scene).

## Copy rules (hard)

- No em dashes. En dash only inside numeric ranges (7–14 dni). Use a full stop, a comma or a colon.
- No "X, nie Y" antithesis, no triads of adjectives, no rhetorical questions as headings, no filler
  ("kompleksowo", "innowacyjne", "rozwiązania", "najwyższa jakość"), no eyebrow labels above headings.
- First person singular for Kacper, "my" only for FastLanding's team process.
- Every market or results number carries its source and date. Illustrative material is labelled as such.
- Polish typography (`src/lib/typo.ts`): no-break spaces after single-letter words and between numbers and units,
  numeric ranges never break at the dash, „cudzysłów”, numbers grouped with a no-break space.
