# kacper.biz: art direction

The visual system is recorded in `DESIGN.md` (tokens in `.impeccable/design.json`); the direction contract for the
site lives in `.impeccable/surfaces/src-pages-index-astro.md`, product truth in `PRODUCT.md`. This file keeps the
idea and the copy rules in one place for people editing texts.

## Idea

**kacper.biz is a printed business directory,** the book OutreachPilot reads companies from. Kacper has an entry;
his products are the display ads; the directory's own furniture is the interface: running heads with guide words,
thumb-index tabs, leader dots, category heads, a rate card, an order coupon, a colophon on the back cover.

Why it belongs to Kacper and nobody else:
- OutreachPilot literally finds companies by sector and city in CEIDG, Google Maps and PKT.pl: a directory.
- The boxed display ad in the phone book was a small business's landing page; FastLanding builds today's version.
- The numbers are his: 3 181 616 active sole proprietorships in 30 sectors (CEIDG via outreachpilot.pl/firmy,
  29.09.2026); 3 in 100 micro-firms list a website in CEIDG (sample 4 700, 7.07.2026).

## Stocks and inks

Directory yellow for business pages, white pages for the personal and reading parts (the 3-in-100 register, work,
about, questions), reversed black for FastBot at night and the back cover. Black ink plus one red spot ink (prices,
the Gliwice marker, active states). Secondary text is black tinted by its stock, never gray.

## Type

Archivo only, in four voices by width: 62 black caps for display and category heads, 72 heavy for statements, 75
bold caps for listings, 100 regular for reading. Tabular lining numerals everywhere. No mono, no serif, no italics.

## The printed map (WebGL)

One point cloud printed in ink on the stock, visible through transparent map windows. The map is an ordered
halftone screen: an even hex lattice at full ink, tone carried by dot size (bigger around the cities, from a density
field over the published cities), a solid border, city dots, a small red Gliwice marker. Traffic prints the same way:
full-ink dots that thin by size, never by transparency. The shape sits in its window and travels with it; scrolling
through a window turns the map in its own plane like a turntable, and the email arcs stand up off the paper.
Picking a city in the index spreads red ink from it across the screen, prints a ring and a callout label (HTML type
placed by projecting the city through the frame).

| chapter | shape | where |
|---|---|---|
| 1 | Poland, Gliwice in red with its marker ring; the chosen city pings in the index | index of sectors, OutreachPilot page head |
| 2 | Same map, email trails in black ink leave Gliwice, replies come back in red | OutreachPilot window |
| 3 | Landing-page wireframe | FastLanding page head |
| 5 | Close-up low over Gliwice | About, Contact, 404 |

It prints (a wave from Gliwice) the first time a window is on screen, sleeps under opaque stock, and falls back to
the SVG poster (`public/map-poster.svg`, `npm run poster`) without a GPU, WebGL or JavaScript.

## Copy rules (hard)

- No em dashes. En dash only inside numeric ranges (7–14 dni). Use a full stop, a comma or a colon.
- No "X, nie Y" antithesis, no triads of adjectives, no rhetorical questions as headings, no filler
  ("kompleksowo", "innowacyjne", "rozwiązania", "najwyższa jakość"), no eyebrow labels above headings.
- First person singular for Kacper, "my" only for FastLanding's team process.
- Every market or results number carries its source and date. Illustrative material is labelled as such.
- Polish typography (`src/lib/typo.ts`): no-break spaces after single-letter words and between numbers and units,
  numeric ranges never break at the dash, „cudzysłów”, numbers grouped with a no-break space.
