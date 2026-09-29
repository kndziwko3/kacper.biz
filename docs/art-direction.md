# kacper.biz: art direction

## Idea

**Mapa, z której piszą się maile.** The protagonist is one object: a dot map of Poland made of light, with Gliwice
at the point where everything starts. Every chapter changes what the map is doing: it gathers, it counts, it sends,
it gets answers. The site is a working instrument built on real registry numbers, not a moodboard.

Why this is specific to Kacper and nobody else:
- The numbers are his: 3 181 616 active sole proprietorships in 30 sectors (CEIDG via outreachpilot.pl/firmy,
  29.09.2026), 3% of micro-businesses list a website in their CEIDG entry (sample 4 700, 7.07.2026).
- The mechanism is his: OutreachPilot finds companies and writes to them in correct Polish; FastLanding builds the
  page and the bot that turn a visit into an enquiry.
- The place is his: Gliwice, 50,29° N 18,67° E, with a live local clock.

## Signature moments

1. **Hero:** the name set at full width in Mona Sans, the letters breathing from condensed (wdth 75) to expanded
   (wdth 125) on load, while the points gather into Poland and Gliwice ignites. No blocking loader.
2. **Registry demo:** pick a sector and a city; real CEIDG counts roll on a tabular counter, the city lights up on the
   map, and a sample email line inflects the city correctly ("w Krakowie", "z Białegostoku").
3. **Night to paper:** the dark instrument gives way to a paper sheet for FastLanding, where real client sites scroll
   inside frames as you scroll the page.

## Type

- **Mona Sans** (variable: wght 200–900, wdth 75–125), self-hosted, latin + latin-ext. Display and text. Width is an
  expressive axis: condensed for dense data headlines, expanded for the name and chapter numerals.
- **Martian Mono** (variable) for data only: counts, timestamps, PKD codes, field labels. Never as decorative eyebrows.
- No serif, no italic accent words.
- Scale (desktop): display 12–15vw name; H1 subpage 64–96px; H2 44–56px; H3 22–26px; body 18px/1.55; data 12–13px.
  H1 max 3 lines. Measure 58–68ch.

## Colour

| token | hex | use |
|---|---|---|
| ink | #0b0b0a | page background (night) |
| ink-2 | #141412 | raised surfaces |
| paper | #ebe7de | FastLanding sheet (day) |
| bone | #ece8df | text on ink |
| mute | #9c988f | secondary text on ink (≥ 6:1) |
| signal | #ff5a1f | the only accent: a send, a count, the one primary CTA |
| signal-ink | #b8360a | signal on paper for text (≥ 4.5:1) |

Replies are rendered in bright bone, not a second hue. One accent across the whole site.

## Layout

- 12-column grid, 24px gutters, 1440 max for text, full-bleed for the map and screenshots.
- Rules (1px hairlines) and alignment carry structure. No glass cards, no drop shadows, no rounded "feature cards".
- Vary compositions: full-bleed type, sticky side rail with a scrubbed instrument, a paper sheet with framed
  screenshots, a two-column index. Never repeat "text column + empty half" twice in a row.
- Mobile: map pinned in a 42vh band above the text on solid ink; text never sits on moving points.

## Motion

- Lenis smooth scroll (disabled for reduced motion), GSAP ScrollTrigger for pinned sequences, SplitText line masks
  for H2 reveals (once, 0.9s expo.out, 70ms stagger). Hero H1 is never hidden (LCP): it animates width only.
- Astro ClientRouter: the canvas and header persist between pages; the map morphs to the next page's state.
- Hover: underline draws from the left; arrows move 3px. No magnetic buttons, no custom cursor.
- `prefers-reduced-motion`: no smooth scroll, no pins, one static map frame, content fully visible.

## Copy rules (hard)

- No em dashes. En dash only inside numeric ranges (7–14 dni). Use a full stop, a comma or a colon.
- No "X, nie Y" antithesis, no triads of adjectives, no three-word fragment headlines as a pattern, no rhetorical
  questions as headings, no "w dniach, nie miesiącach", no "gdy śpisz", no filler ("kompleksowo", "innowacyjne",
  "rozwiązania", "najwyższa jakość").
- First person singular for Kacper, "my" only when describing FastLanding's team process.
- Every claim carries a number, a source or a date. Illustrative UI is labelled "przykład".
- Polish typography: non-breaking space after single-letter words (a, i, o, u, w, z) and between a number and its
  unit; „cudzysłów”; numbers grouped with a non-breaking space from 10 000 up.

## Removed on purpose

Italic serif accents, numbered mono eyebrows, glass cards, film grain, gradient blobs, marquee, pulsing status dot,
scroll cue, progress bar, conic-gradient logo tile, count-up stat strip of unrelated vanity metrics, magnetic buttons.
