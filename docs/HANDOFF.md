# Handoff: kacper.biz studio (state on 30.09.2026, evening)

Read this first, then `README.md`, `PRODUCT.md`, `DESIGN.md`, `docs/art-direction.md` and the direction contract
`.impeccable/surfaces/src-pages-index-astro.md`. Branch: `claude/funny-carson-fq3zme` (no PR yet).

## 1. What the owner asked for

- Round 1–4 (morning, cloud session): full redesign, "zero AI slop, zero bad design", much stronger 3D, more scroll film,
  craft bar **Oryzo (oryzo.ai)**. The owner chose the canon: a dark studio, one sculpted object driven by scroll, a big
  name, a clean grotesk. Rejected: loud colours, printed/paper looks, weak or small 3D. No sound. Facts, prices and
  Justyna's Calendly stay.
- Round 5 (evening, this session): "nie podoba mi się ten element 3d … zrób, żeby było zajebiście … masz 100% wolną
  rękę". The monolith of 100 plates was dropped and the object replaced.

Hard rules: no em dashes anywhere (en dash only in numeric ranges); no AI-slop tells (kickers/eyebrows above headings,
gradient text, glyph icons, hero-metric templates, filler words); every market or result number carries its source and
date; Polish micro-typography via `src/lib/typo.ts`; facts only from `src/content/site.ts`, `src/content/ceidg.ts`.

## 2. The object and the film

A machined 96% keyboard with exactly 100 keys, three of them solid copper (Esc, K, Enter) = "3 in 100 micro-firms list
a website in CEIDG". All procedural (`src/film/keyboard.ts`), no GLB:
- caps: one InstancedMesh of a sculpted 1u cap; the vertex shader stretches it nine-slice into any width; legends are
  printed from a canvas atlas set in Martian Mono; per-instance attributes: size, kind (cream / graphite / copper),
  press (travel + darkening + copper-lit legend), tone (the blank-cream grid tone);
- switches, a plate with 100 cut-outs, a PCB with copper pads, an anodised case with a diamond-cut chamfer.

Chapters (`SHOTS` in `src/film/film.ts` holds camera, lens, light, exposure, rim and phone framing per chapter):

| pose | what happens |
|---|---|
| 0 hero | the board, right half, bleeding off the frame; one wave of keystrokes when the film starts; caps under the mouse press |
| 1 grid | caps file into a 10 × 10; the board sinks away; 97 caps turn one blank cream; 3 copper caps step out |
| 2 typing | the board types "Dzień dobry, Panie Tomaszu" (AltGr+N for ń), the page spells it in step (`film:typed` event, `typedLine()` in main.ts) |
| 3 exploded | caps, switches, plate, PCB, case, opening while the chapter holds |
| 4 close | macro on the copper Enter; a glint slides across it and it goes down once |

Render: Khronos Neutral tone map, single-pass bokeh depth of field (`post.ts`), vignette, black level lifted to the
page's #0E0C0A so canvas and page share one ground, grain + dither. A RectAreaLight "glint" is re-aimed every frame at
the camera's mirror angle over the copper tops. Chapter timing: the object starts to move 0.55 viewport before a track
pins and arrives at 16% of the pinned span (`Tracks.state`); on phones it rides with its chapter (`Tracks.ride`).
Frame time (Apple M5, production build): high tier ~10 ms median at 1440 × 900 DPR 2, mid ~6 ms, phone low ~2 ms; the
resolution governor sheds pixels on slow devices.

Dev look-dev handle: `window.__film` (`SHOTS`, `rig(i, pos, euler)`, `kb.copper()`, renderer, post).

## 3. Stills, OG, provenance

```
npm run dev
npm run stills -- --base http://localhost:4321   # Chrome with GPU on macOS (seconds); SwiftShader elsewhere (slow)
npm run og
npm run provenance                               # re-embeds each raster's origin (stills and og rewrite the files)
```
Do not edit source files while `npm run stills` runs (the dev server reloads the lab page).

## 4. Review history (impeccable finish reviewer, fresh Opus)

| round | disposition | main points |
|---|---|---|
| 1–4 | rebuild, rebuild, rebuild, fix | the monolith world (see git history up to f598971) |
| 5 | **fix** | keyboard world: 8 material fixes (Enter macro, hero bleed, 97 vs 3 grid, typing legibility, copper and layers, phone legibility, FastBot card, eyebrows) |
| 5 verdict 1 | fix | 6/8 resolved; typing and phone ghost board partial; 2 regressions (copy touching object, faint FastBot lines) |
| 5 verdict 2 | fix | all remaining resolved; one small regression (FastBot disclaimer on phone), fixed and verified after the pass |

Evidence in `.impeccable/review/` (desktop, mobile, desktop-scroll, mobile-scroll, live-film, stills-mode, subpages),
captured from `astro build` + `astro preview`.

## 5. QA (all green, 30.09.2026)

```
npm run build
node scripts/validate-seo.mjs     # PASS 0/0
node scripts/test-lead.mjs        # 29/29
npx astro check                   # 0 errors
grep -rn $'\u2014' src public dist # em dashes: 0 (typo.ts only guards)
```
- axe-core (WCAG 2.1 AA + best practice), 14 routes at 1440 and 390 px: 0 violations.
- Lighthouse mobile on `/`: 99 / 100 / 100 / 100, LCP ~2.0 s, CLS 0 (headless has no GPU, so it measures the stills).

## 6. Open

- Owner: portrait photo and a 4–5 sentence founder story for /o-mnie (`docs/owner-todo.md`).
- Check the live film on a real phone and a mid-range laptop after deploy (headless tools cannot).
- Possible next ceiling (reviewer notes, not defects): a moving highlight sweep in the hero, a profile or top-down
  shot for more lens variety, contact shadow under the floating board.
