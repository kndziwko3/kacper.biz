# kacper.biz: art direction

The visual system is recorded in `DESIGN.md` (tokens in `.impeccable/design.json`); the direction contract for the
site lives in `.impeccable/surfaces/src-pages-index-astro.md`, product truth in `PRODUCT.md`. This file keeps the
idea and the copy rules in one place for people editing texts.

## Idea

**kacper.biz is a dark product studio with one real object in it: a machined 96% keyboard with exactly 100 keys.**
Three of the caps are solid copper (Esc, K for Kacper, Enter): 100 micro-firms in CEIDG, of which only 3 list a
website. It is the tool one person uses to build both companies. Scrolling is the camera moving round the studio while
the board changes pose chapter by chapter; between chapters cream evidence sheets slide over the film carrying the
facts (the index of sectors, campaign results, prices, client sites, contact). The canon direction (dark studio, one
sculpted object, the name set large) was chosen by the owner on 30.09.2026 with Oryzo (oryzo.ai) as the craft bar; the
first object, a monolith of 100 plates, was rejected the same day and replaced by the keyboard.

The numbers are his: 3 181 616 active sole proprietorships in 30 sectors (CEIDG via outreachpilot.pl/firmy,
29.09.2026); 3 in 100 micro-firms list a website in CEIDG (sample 4 700, 7.07.2026).

## Grounds and the one accent

Studio #0E0C0A for the film, graphite #191613 for the dark sheet (FastBot at night), cream #EDE7DC for the evidence
sheets. Text #EDE6DA on dark, ink #15120F on cream. Copper is the only hue: the three copper caps, the primary action,
the lit chapter on the rail. No second hue, no gradients on type. The board itself wears the palette: cream PBT alphas,
graphite PBT modifiers, copper accents, an anodised graphite case whose diamond-cut chamfer shows bare aluminium.

## Type

Funnel Display for the name and headings (500, tight tracking; the name in two lines at about 11vw, 18vw on a
phone), Funnel Sans for reading, Martian Mono only for short labels and data (counts, dates, the rail) and for the
legends printed on the caps. Tabular lining numerals for figures. No kickers above headings.

## The film (WebGL)

| chapter | pose | camera and light |
|---|---|---|
| 0 Start | the board floating, the numpad corner bleeding off the frame; one wave of keystrokes when the film starts | steep three-quarter, object right |
| 1 3 na 100 | the caps lift off their switches and file into a 10 × 10 grid; the stripped board sinks away; the 97 PBT caps turn one blank cream, the 3 copper caps step out of their cells and tip into the light | nearly face-on, fov 24, object right |
| 2 OutreachPilot | the board types "Dzień dobry, Panie Tomaszu" by itself (Shift for capitals, AltGr+N for the ń), then Enter; every pressed key goes down, darkens and lights its legend copper; the page spells the greeting in step at display size | key height from the front, the whole alpha block in frame, shallow depth of field, object left |
| 3 FastLanding | the build exploded: caps, switches, plate, PCB, case, opening further while the chapter holds; a cool rim separates the layers | three-quarter from above, fov 32, object right |
| 4 Kontakt | a macro on the copper Enter; a narrow softbox glint slides across its top and it goes down once, its engraved legend lighting up | macro, fov 22, shallow focus, the room darker, object right |

The film's black level is lifted to the page's studio black, so the canvas and the page share one ground. On a phone
the object sits above the copy and rides with its chapter: it leaves upward with the stage that scrolls away and comes
up from below with the next, never parked behind a block of text.

Motion grammar: machined, weighted, damped; the object moves between chapters (the move starts before a chapter pins),
the type holds still; one line-mask reveal per chapter headline. The caps under the mouse press. Subpages hold one pose
(`data-film-pose`). Without a GPU every stage shows the still of its pose (`npm run stills`, rendered from the same
scene). Controls on the page are keycaps: the cap radius, a darker skirt edge, 2 px of travel when pressed.

## Copy rules (hard)

- No em dashes. En dash only inside numeric ranges (7–14 dni). Use a full stop, a comma or a colon.
- No "X, nie Y" antithesis, no triads of adjectives, no rhetorical questions as headings, no filler
  ("kompleksowo", "innowacyjne", "rozwiązania", "najwyższa jakość"), no eyebrow labels above headings.
- First person singular for Kacper, "my" only for FastLanding's team process.
- Every market or results number carries its source and date. Illustrative material is labelled as such.
- Polish typography (`src/lib/typo.ts`): no-break spaces after single-letter words and between numbers and units,
  numeric ranges never break at the dash, „cudzysłów”, numbers grouped with a no-break space.
