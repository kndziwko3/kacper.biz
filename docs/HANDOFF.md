# Handoff: kacper.biz studio redesign (state on 30.09.2026)

Read this first, then `README.md`, `PRODUCT.md`, `docs/art-direction.md` and the direction contract
`.impeccable/surfaces/src-pages-index-astro.md`. Branch: `claude/funny-carson-fq3zme` (all work pushed there; no PR yet).

## 1. What the owner asked for

Owner (Polish): full redesign, "zero AI slop, zero bad design", much stronger 3D, more scroll-driven, researched against
the best sites of the kind. Answers given in the direction round:
- Direction: **"Standard: rzeźba 3D"**, the canon: a dark studio, one sculptural 3D object driven by scroll, a big name,
  a clean grotesk.
- What failed before: loud colours, not premium enough, weak 3D, too little scroll.
- Keep: nothing (full freedom). Facts, prices and Justyna's Calendly booking stay.
- Sound: none. Craft bar: **Oryzo (oryzo.ai)**.

Hard rules: no em dashes anywhere (en dash only in numeric ranges); no AI-slop tells (kickers/eyebrows above headings,
gradient text, glyph icons, hero-metric templates, filler words); every market or result number carries its source and
date; Polish micro-typography via `src/lib/typo.ts`; facts only from `src/content/site.ts`, `src/content/ceidg.ts`.
Commits end with the co-author/session trailers used in the history. Never disable TLS verification in this container.

## 2. The world that is built

- Studio #0E0C0A (film), graphite #191613 (dark sheet), cream #EDE7DC (evidence sheets), text #EDE6DA / ink #15120F,
  copper #C8703F (hi #E39463 on dark, #974719 on paper) as the only hue.
- Type: Funnel Display (headings, name), Funnel Sans (text), Martian Mono (short labels, data, the rail). Geist was
  dropped because the impeccable detector flags Geist/Geist Mono as overused reflex faces.
- The object: a monolith of 100 machined plates (instanced), three copper (indices 14, 58, 87) = "3 in 100 micro-firms
  in CEIDG list a website". Poses: 0 monolith (sliced face to camera), 1 rotunda/fan, 2 registry drawer with a flick wave,
  3 exploded landing page on a plinth, 4 monolith again.
- Home: five CSS-sticky chapter tracks (`[data-ch]`, `src/components/ui/Chapter.astro`), cream sheets between them
  (`[data-sheet]`, `src/components/film/*Sheet.astro`), chapter rail at the bottom (`Rail.astro`), header pills on a
  band of the ground under them (studio or paper, toggled by `headerGround()` in `src/scripts/main.ts`).
- Subpages: `PageHead.astro` holds one pose (`data-film-pose`) with its still, then sheets.
- Motion grammar: the object moves, the type holds still; one line-mask reveal per chapter headline (native
  `view-timeline`, `src/styles/global.css`).

## 3. How the film works (src/film)

- `film.ts`: renderer (AgX, HalfFloat RT with MSAA per tier, `post.ts` final pass with vignette/grain), `SHOTS` (camera
  per pose: pos, tgt, fov, fx lens shift, drift), `Tracks` (maps scroll to `{a, b, t, local}`: first 42% of a track
  morphs from the previous pose), route-change morph on `rescan()`, resolution governor, `supersample` option for stills.
- `monolith.ts`: plate geometry (RoundedBox, 5 chamfer segments), pose builders, shader patch. Important shader logic:
  `pitchPx` = plate pitch in OUTPUT pixels (`uPxScale` = supersample factor for stills). Below ~3 px the shading normal
  is flattened toward the face it belongs to (pressed faces take the camera-facing stack face) so the stack never
  aliases into moire; the block's outer corners are exempt (`outer`). `nonPerturbedNormal` is updated too, because
  three's specular anti-aliasing reads it. Plates do not receive shadows (self-shadow on 12 mm slices is only acne).
  The floor reflection is a mirrored InstancedMesh (`refMat`, additive).
- `studio.ts`: PMREM environment from softbox cards (the strip cards are what makes metal read as metal), floor, warm
  pool, key spot with shadow, copper spill, rim, back wall wash.
- Boot (`src/scripts/main.ts`): film mounts after `load`, on first scroll or after ~3.5 s, only on a hardware GPU
  (`html.film-live`); otherwise `html.film-off` and the stills stay. `?gl=high|mid|low` forces the live film (QA).

## 4. Stills pipeline (the no-GPU picture and the LCP image)

`public/stills/p0..p4-{d,m}.webp` are rendered from the same scene, 3x supersampled, read straight off the canvas
(`window.__png`) on the dev-only lab route `/lab/still?a=<pose>&l=<local>&tier=high&ss` (`src/pages/lab/[view].astro`,
absent from the production build), downsampled with Lanczos.

```
npm run dev            # keep it running
npm run stills         # all ten; --only 0 --views d for one
npm run og             # OG cards from the stills (after stills change)
```
Gotchas:
- Do not edit ANY source file while `npm run stills` runs: the Astro dev server reloads the lab page and the run dies
  with "Execution context was destroyed".
- After `npm install`, Vite may serve "504 Outdated Optimize Dep": stop the dev server, `rm -rf node_modules/.vite`,
  start it again.
- In this cloud container Chromium only has SwiftShader (software GL): the site shows stills (`film-off`); use
  `?gl=low` and a small viewport (1024x640) to capture the live film; full-page 4800x3000 screenshots time out, hence
  the canvas readback.
- `pgrep -f "astro preview"` inside a command that also contains that text matches the shell itself; kill servers in a
  separate command.

## 5. Review history (impeccable finish reviewer, fresh Opus each round)

| round | disposition | main points |
|---|---|---|
| 1 | rebuild | flat grey monolith with moire, chapter copy invisible in stills mode, no rail, kickers, phone hero overflow, whole-block fades |
| 2 | rebuild | aluminium read as card, dark "plinth", cropped hero, page pose unreadable, header collisions, rail over copy, mono breadcrumb kicker |
| 3 | rebuild (hero p0 only) | wood-grain moire on the sliced face, copper read as book covers, hero buttons, rail numerals, benchmark hero-metric |
| 4 | **fix** | 8 material fixes below; p1 rotunda, p2 card fan, p3 exploded page, sheets, benchmark sentence and the name are to be kept |

Review evidence lives in `.impeccable/review/` (desktop.png, mobile.png, desktop-scroll.png, mobile-scroll.png,
live-film.png, subpages.png): recapture over the same files after each fix batch.

## 6. OPEN WORK: round-4 material fixes (apply in one batch, then recapture and ask for a verdict)

1. **Reflection draws over the block.** `src/film/monolith.ts` `refMat`: set `depthTest = true` (keep
   `depthWrite = false`, additive blending). The floor (`studio.ts`) is `transparent` and writes depth, so also set the
   floor material `depthWrite = false`, otherwise the mirrored plates below the floor plane will be hidden. Re-render
   stills p0-p4 (d and m).
2. **Hero framing (product-shot air).** `src/film/film.ts` `SHOTS[0]` (now pos [3.25, 2.0, 6.1], tgt [0, 1.55, 0],
   fov 30): pull back ~25-30% and raise above the block top (y ~ 3.4-3.5), aim at mid-height, so the monolith fills
   ~65-70% of the viewport height, its top face with the 100 plate ends shows, and the foot, contact shadow and
   reflection sit clear above the rail. Trade-off to watch: a smaller object lowers the plate pitch in pixels; check the
   sliced face at 1:1 for moire after re-rendering (flatten range is `smoothstep(1.6, 3.0, pitchPx)` in the shader).
3. **Copper reads as tabs/tape.** `monolith()` in `monolith.ts`: cut the copper proud offset (now y 0.06, z 0.022) to
   ~0.008 / 0.012 so the silhouette stays one block; give copper a hot highlight, e.g. in the `roughnessmap_fragment`
   patch lower roughness for copper instances (detect via instance colour `vColor`, copper has r >> b; guard with
   `#ifdef USE_INSTANCING_COLOR`), roughness ~0.16 vs 0.28.
4. **Aluminium reads as walnut + painted grey.** `studio.ts`: keep the copper spill and warm key from tinting the plates
   (lower the spill a lot and move the warmth into the unlit floor `pool` mesh instead; check p1 keeps its glow), so
   the sliced face and side face share the steel hue. Put one hard strip card where the side face (+X at pose-0 yaw
   0.05) reflects to the camera: for the current camera the reflection direction from the side face points down-back-
   right, roughly toward (4, -0.5, -8.5) from the object; place a narrow tall card there (and re-derive for the new
   SHOTS[0]). Aim for a visible vertical band on the side face and a glint on the front-right corner.
5. **Pills only in the header.** `global.css` `.btn` and `Btn.astro`: in-page CTAs, city chips (`Lookup.astro`
   `.lk-city span`), form option chips (`ContactForm.astro` `.choice span`) and the chat chips get a 0-2 px radius;
   keep pills only for the header (`.hp`, `.hd-book`: give `.hd-book` its own `border-radius: 999px` when `.btn` goes
   square) and the rail.
6. **Rail lights the wrong chapter at the close.** `src/scripts/main.ts` `rail()`: move the detection line lower
   (e.g. `rootMargin: '-70% 0px -29% 0px'`) so a chapter lights as soon as its headline is on screen (KONTAKT while
   "Za obiema firmami..." shows); make the step-aside band smaller (`'-94% 0px 0px 0px'`) so the rail hides only when
   the sheet really reaches it.
7. **p2 fan edges run under the copy.** Strengthen the copy-side scrim (`global.css` `.stage::after`, desktop:
   e.g. 0.9 at the edge, 0.8 at 40%, 0 at 62%) or end the fan left of the copy column (`SHOTS[2]` / `register()`).
8. **Client capture sliced through its headline.** `src/scripts/showcase.ts`: start the scroll tour only after the
   frame's top passes ~55% of the viewport (`p = clamp01((vh*0.55 - r.top) / (vh*0.55 + r.height))`), so every frame
   first shows the top of the page.

After the batch: `npm run stills`, `npm run og`, `npm run build`, impeccable detector (0 findings expected), recapture
`.impeccable/review/*`, send the same captures to a finish reviewer for a verdict pass (score each of the 8 as
resolved/partial/unresolved). Then run the documenter: **DESIGN.md and `.impeccable/design.json` still describe the
previous "directory" world and must be rewritten for the studio world** (tokens above, type, film, components).

## 7. QA (all green on the last full run, 30.09.2026)

```
npm run build
node scripts/validate-seo.mjs     # PASS 0/0
node scripts/test-lead.mjs        # 29/29
npx astro check                   # 0 errors
grep -rn $'\u2014' src public dist # em dashes: 0 (typo.ts only guards)
```
- axe-core (WCAG 2.1 AA + best practice) on the 14 routes via `astro preview`: 0 violations.
- Lighthouse mobile on `/`: 99-100 performance, 100 a11y/BP/SEO, LCP ~1.7 s, CLS 0 (headless has no GPU, so it measures
  the stills version).
- Impeccable detector: `npx impeccable install` (skill from impeccable.style, github.com/pbakaus/impeccable), then
  `impeccable detect --json src`.
