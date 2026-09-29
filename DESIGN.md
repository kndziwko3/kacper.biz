---
name: kacper.biz
description: "A printed business directory: Kacper Rękawek has an entry, his two products are the display ads, and the directory's own furniture is the interface."
colors:
  directory-yellow: "#f7d117"
  spot-red: "#e1251b"
  spot-red-deep: "#b3170f"
  ink: "#000000"
  white-pages: "#f6f5f1"
  reversed-black: "#000000"
  knockout-white: "#ffffff"
typography:
  display:
    fontFamily: "Archivo, 'Archivo Fallback', 'Arial Narrow', Arial, sans-serif"
    fontSize: "clamp(3.4rem, 1.6rem + 5.4vw, 6rem)"
    fontWeight: 900
    lineHeight: 0.84
    letterSpacing: "-0.004em"
    fontFeature: "'lnum', 'tnum'"
    fontVariation: "'wdth' 62"
  category:
    fontFamily: "Archivo, 'Archivo Fallback', 'Arial Narrow', Arial, sans-serif"
    fontSize: "clamp(2.6rem, 1.5rem + 4vw, 5.2rem)"
    fontWeight: 900
    lineHeight: 0.86
    letterSpacing: "-0.004em"
    fontFeature: "'lnum', 'tnum'"
    fontVariation: "'wdth' 62"
  ad-headline:
    fontFamily: "Archivo, 'Archivo Fallback', 'Arial Narrow', Arial, sans-serif"
    fontSize: "clamp(1.9rem, 1.2rem + 2vw, 3rem)"
    fontWeight: 900
    lineHeight: 0.88
    letterSpacing: "-0.003em"
    fontFeature: "'lnum', 'tnum'"
    fontVariation: "'wdth' 62"
  statement:
    fontFamily: "Archivo, 'Archivo Fallback', 'Arial Narrow', Arial, sans-serif"
    fontSize: "clamp(1.9rem, 1.2rem + 2.3vw, 3.35rem)"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.014em"
    fontFeature: "'lnum', 'tnum'"
    fontVariation: "'wdth' 72"
  head:
    fontFamily: "Archivo, 'Archivo Fallback', 'Arial Narrow', Arial, sans-serif"
    fontSize: "clamp(1.2rem, 1.05rem + 0.6vw, 1.6rem)"
    fontWeight: 800
    lineHeight: 1.08
    letterSpacing: "-0.006em"
    fontFeature: "'lnum', 'tnum'"
    fontVariation: "'wdth' 75"
  lead:
    fontFamily: "Archivo, 'Archivo Fallback', 'Arial Narrow', Arial, sans-serif"
    fontSize: "clamp(1.14rem, 1rem + 0.55vw, 1.42rem)"
    fontWeight: 400
    lineHeight: 1.38
    letterSpacing: "normal"
    fontFeature: "'lnum', 'tnum'"
    fontVariation: "'wdth' 100"
  body:
    fontFamily: "Archivo, 'Archivo Fallback', 'Arial Narrow', Arial, sans-serif"
    fontSize: "clamp(1rem, 0.97rem + 0.15vw, 1.0625rem)"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
    fontFeature: "'lnum', 'tnum'"
    fontVariation: "'wdth' 100"
  listing:
    fontFamily: "Archivo, 'Archivo Fallback', 'Arial Narrow', Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 750
    lineHeight: 1.2
    letterSpacing: "0.018em"
    fontFeature: "'lnum', 'tnum'"
    fontVariation: "'wdth' 75"
  slip:
    fontFamily: "Archivo, 'Archivo Fallback', 'Arial Narrow', Arial, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "0.02em"
    fontFeature: "'lnum', 'tnum'"
    fontVariation: "'wdth' 75"
  micro:
    fontFamily: "Archivo, 'Archivo Fallback', 'Arial Narrow', Arial, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "normal"
    fontFeature: "'lnum', 'tnum'"
    fontVariation: "'wdth' 90"
rounded:
  none: "0px"
spacing:
  gutter: "clamp(1rem, 3.4vw, 3.25rem)"
  column-gap: "clamp(0.9rem, 1.8vw, 1.6rem)"
  section: "clamp(4rem, 10vh, 7rem)"
  running-head: "52px"
  thumb-tab: "44px"
  page-max: "1480px"
components:
  running-head:
    backgroundColor: "{colors.directory-yellow}"
    textColor: "{colors.ink}"
    height: "{spacing.running-head}"
  thumb-tab:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.directory-yellow}"
    width: "{spacing.thumb-tab}"
    height: "7.4rem"
  thumb-tab-current:
    backgroundColor: "{colors.spot-red}"
    textColor: "{colors.knockout-white}"
  button-slip:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.directory-yellow}"
    typography: "{typography.slip}"
    rounded: "{rounded.none}"
    padding: "0.7rem 1.15rem"
    height: "48px"
  button-slip-hover:
    backgroundColor: "{colors.spot-red}"
    textColor: "{colors.knockout-white}"
  button-slip-line:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.slip}"
    rounded: "{rounded.none}"
    padding: "0.7rem 1.15rem"
    height: "48px"
  button-slip-line-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.directory-yellow}"
  button-slip-reversed:
    backgroundColor: "{colors.directory-yellow}"
    textColor: "{colors.reversed-black}"
    typography: "{typography.slip}"
    rounded: "{rounded.none}"
    padding: "0.7rem 1.15rem"
    height: "48px"
  button-slip-reversed-hover:
    backgroundColor: "{colors.spot-red}"
    textColor: "{colors.knockout-white}"
  button-slip-head:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.directory-yellow}"
    rounded: "{rounded.none}"
    padding: "0.4rem 0.7rem"
    height: "40px"
  display-ad:
    backgroundColor: "{colors.directory-yellow}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "clamp(1rem, 1.8vw, 1.5rem)"
  display-ad-reversed:
    backgroundColor: "{colors.reversed-black}"
    textColor: "{colors.directory-yellow}"
    rounded: "{rounded.none}"
    padding: "clamp(1rem, 1.8vw, 1.5rem)"
  display-ad-white:
    backgroundColor: "{colors.white-pages}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "clamp(1rem, 1.8vw, 1.5rem)"
  price-sticker:
    backgroundColor: "{colors.spot-red}"
    textColor: "{colors.knockout-white}"
    rounded: "{rounded.none}"
    padding: "0.3rem 0.55rem 0.28rem"
  sheet-bar:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.directory-yellow}"
    padding: "0.45rem 0.9rem"
  coupon-field:
    backgroundColor: "{colors.knockout-white}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "0.75rem 0.85rem"
    height: "50px"
  choice-chip:
    backgroundColor: "{colors.knockout-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0.45rem 0.8rem"
    height: "44px"
  choice-chip-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.directory-yellow}"
  city-tab:
    backgroundColor: "{colors.directory-yellow}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0.3rem 0.65rem"
    height: "40px"
  city-tab-selected:
    backgroundColor: "{colors.spot-red}"
    textColor: "{colors.knockout-white}"
  index-row-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.directory-yellow}"
---

# Design System: kacper.biz

## Overview

**Creative North Star: "The Printed Business Directory"**

kacper.biz is set as the book OutreachPilot reads companies from. Kacper Rękawek has an entry, OutreachPilot.pl and FastLanding.io are display ads billed by size, and the directory's own furniture carries the interface: a running head with guide words, thumb-index tabs cut into the fore-edge, leader dots, category heads, a rate card, an order coupon and a colophon on the back cover. Every surface is a printed sheet on one of three paper stocks, in black ink plus one red spot ink.

Density follows a real directory page: small listing caps, dotted leaders, tabular figures and hairline rules, broken by large condensed black caps for names, departments and counts. One family, Archivo, speaks in four widths. Motion behaves like a press: ad plates print in from the top, leader dots are laid down row by row, counters roll with damping, tabs slide out of the fore-edge and pages turn from the fore-edge. Nothing on the page emits light.

Behind the opaque sheets sits one WebGL map of Poland printed as an ordered halftone screen, visible only through transparent window sections. Without a GPU, WebGL or JavaScript an SVG poster of the same map stands in, and the page stays complete and readable on a phone in daylight (PRODUCT.md). Two directions were refused in the surface brief: the incumbent dark page with a glowing 3D map, a giant name and one neon accent, and its opposite, a white editorial page with a serif display and a portrait.

**Key Characteristics:**
- Three stocks (directory yellow, white pages, reversed black), black ink, one red spot ink.
- Archivo only, hierarchy by width: 62% display, 72% statement, 75% listing, 100% reading.
- Leader lines, rules in four weights (8, 3, 2 and 1 px), square bullets, zero radius, no elevation.
- Display ads whose area encodes importance, signed at the foot, with the price on a red sticker.
- Order-slip buttons that ink red on hover and print a red plate out of register on press.
- A printed halftone map behind window sections, with an SVG poster as the fallback.
- Tabular lining figures everywhere; numbers roll with damping and never jump.

## Colors

Three paper stocks, black ink and a single red spot ink; every other tone on the page is ink mixed into its own stock. Tokens live on `:root` in `src/styles/global.css` (`--yellow`, `--white`, `--black`, `--ink`, `--red`, `--red-deep`).

### Primary
- **Directory Yellow** (#f7d117): the business-page stock and the page ground (`html`, `body`, running head, Spis menu, Kacper's entry, the index of sectors, the OutreachPilot sheets, the contact page, the closing FastLanding ad). On reversed black it becomes the ink: headlines, links, rules and order slips print yellow on black (14.09:1). Text selection on yellow reverses to ink with yellow type.

### Secondary
- **Spot Red** (#e1251b): the one spot ink. As a fill it carries prices (the sticker), the current thumb tab, the selected city tab, the three "www" marks on the 3-in-100 sheet, the "interested" reply tag and every order slip on hover, always with Knockout White type (4.69:1). As a line it prints the misregistered plate on press, the text caret, the 16px leader of the map callout and the underline of a hovered link. On the map it marks Gliwice, the picked city's ink spread and ring, and returning replies. On yellow it reaches 3.14:1, so as type it appears only at display sizes (the current Spis entry, a hovered product name on the work page).
- **Spot Red Deep** (#b3170f): the same spot pulled darker for red type at reading sizes: required-field asterisks, form errors and invalid borders, the active step number, the sector count on the index result page, the count in the map callout, the "www" rows on white pages and the check marks in the proof panel and chat (6.32:1 on white pages, 4.62:1 on yellow).

### Neutral
- **Ink** (#000000): all type, rules, frames, leader dots, square bullets, the solid order slip, the sheet bars (an ink strip with yellow caps) and the halftone map. Focus outlines draw in the current foreground (3px solid, 3px offset).
- **White Pages** (#f6f5f1): the stock for the personal and reading parts (the 3-in-100 sheet, FastLanding, questions, About, Work, Privacy) and for inner sheets set on yellow or black: the index result page, the OutreachPilot proof panel, the order coupon and the FastBot chat.
- **Reversed Black** (#000000): the reversed stock for FastBot at night, the colophon on the back cover and the OutreachPilot display ads. The foreground flips to Directory Yellow; the black stock class also declares `color-scheme: dark`.
- **Knockout White** (#ffffff): type reversed out of red, and the paper of form fields, choice chips, the bot's chat bubbles and the screenshot frames on the work and FastLanding sheets.
- **Derived inks**: each stock recomputes `--fg-2` (foreground at 76% over the stock) and `--fg-3` (62%) with `color-mix(in srgb, ...)` on the stock element itself. They resolve to #3b3206 and #5e4f09 on yellow, #3b3b3a and #5d5d5c on white pages, #bc9f11 and #99820e on black; the lightest (`--fg-3` on yellow) holds 5.42:1.

### Named Rules
**The Three Stocks Rule.** Every sheet is printed on one stock: `.stock-yellow`, `.stock-white` or `.stock-black`. The stock re-points `--stock` and `--fg`, and the derived inks are recomputed on that element, so secondary type always belongs to its paper.

**The Tinted Ink Rule.** Secondary type is ink mixed into its own stock at 76% (body, notes) and 62% (sources, captions, inactive steps). The palette has no gray token.

**The One Spot Rule.** Red is the only hue besides the stocks. It fills prices and marks the active state (current tab, selected city, hovered or pressed slip) and Gliwice on the map. Red type at reading sizes uses Spot Red Deep.

## Typography

**Display Font:** Archivo variable (wght 100–900, wdth 62–125%), self-hosted as two subset woff2 files in `src/assets/fonts/` and preloaded, with a metric-adjusted fallback on Arial Narrow and Arial (size-adjust 96%, ascent 92%, descent 22%).
**Body Font:** Archivo at 100% width.
**Label/Mono Font:** Archivo at 75% width in bold caps. The system has no monospace, serif or italic.

**Character:** One grotesque stretched and squeezed like a directory typecase. Condensed black caps carry names, departments and counts; normal-width regular carries reading. Lining tabular figures are set on `body` and inherited by every role.

### Hierarchy
- **Display** (900, 62% width, uppercase, clamp(3.4rem, 1.6rem + 5.4vw, 6rem), line-height 0.84): the name in Kacper's entry, which fills its column instead (min(14.6cqi, 9.5rem) from 700px, min(22cqi, 6.4rem) on phones, with 0.1em below for the Ę ogonek). The same face and weight set counts at local sizes: the register total, index counts, benchmark figures, step and day numbers, the FastBot clock (up to 13rem).
- **Category** (900, 62%, uppercase, clamp(2.6rem, 1.5rem + 4vw, 5.2rem), 0.86): department heads (Indeks branż, OutreachPilot.pl, FastLanding.io, Pytania, Kontakt) under an 8px rule, and the Spis title.
- **Ad headline** (900, 62%, uppercase, clamp(1.9rem, 1.2rem + 2vw, 3rem), 0.88): display-ad headlines. The OutreachPilot entry ad scales up to clamp(2.2rem, 1.3rem + 2.6vw, 3.5rem), the call ad down to clamp(1.7rem, 1.2rem + 1.2vw, 2.2rem).
- **Statement** (800, 72%, sentence case, clamp(1.9rem, 1.2rem + 2.3vw, 3.35rem), 0.98, -0.014em): the one-sentence claim under a category head, subpage H1 statements, the colophon lead.
- **Head** (800, 75%, sentence case, clamp(1.2rem, 1.05rem + 0.6vw, 1.6rem), 1.08): step titles, questions, the coupon heading. Privacy headings use the same width at clamp(1.3rem, 1.15rem + 0.6vw, 1.7rem).
- **Lead** (400, 100%, clamp(1.14rem, 1rem + 0.55vw, 1.42rem), 1.38): the paragraph that opens a department, max 42ch.
- **Body** (400, 100%, clamp(1rem, 0.97rem + 0.15vw, 1.0625rem), 1.5): reading text in `--fg-2`, max 64ch (68ch for long reads).
- **Listing** (750, 75%, uppercase, 0.875rem, 0.018em, 1.2): labels, legends, sheet heads, table heads. Register and index rows use the same voice at 0.74–0.8rem; the running-head title and guide words use it at 900 and 700.
- **Slip** (800, 75%, uppercase, 0.95rem, 0.02em, 1.05): order-slip labels; 0.78rem in the phone running head, 0.82rem from 760px.
- **Micro** (400, 90% width, 0.78rem, 1.45): sources, captions, fine print and the running-head clock, in `--fg-3`, sources capped at 70ch.

### Named Rules
**The Width Is The Voice Rule.** Hierarchy is set by width first (62 display, 72 statement, 75 listing, 100 reading), weight second, size third. A new role takes one of these widths; fine print at 90% is the single width outside the four voices.

**The Tabular Figures Rule.** Every number is set in lining tabular figures and glued to its unit and its thousand groups with no-break spaces (`src/lib/typo.ts`), so counts, prices and times align in columns and never break across a line.

**The Polish Setting Rule.** Copy passes through `typo()` at build time: no single-letter word ends a line, short Polish words bind to the next word, a numeric range keeps its en dash joined to both numbers, and an em dash in copy throws in development.

## Layout

The page is a stack of sheets inside one container: max 1480px, side gutters clamp(1rem, 3.4vw, 3.25rem), and from 1100px an extra 44px on the right so nothing runs under the thumb tabs. Inside, a 12-column grid with a clamp(0.9rem, 1.8vw, 1.6rem) column gap; below 960px every child spans the full row, and from 960px the span classes take over (register 3 of 12, entry 9 of 12; statement 8 with lead 4; text 5 or 6 with figure 6 or 7).

Sections open with clamp(4rem, 10vh, 7rem) of vertical padding and close on a 2px ink rule. The running head is fixed at 52px, so the first section of every page starts at 52px plus clamp(1.5rem, 4.5vh, 3rem) (home) or clamp(2rem, 7vh, 4.5rem) (subpages). On the home page the stocks alternate: yellow entry, white 3-in-100 sheet, yellow index window, yellow OutreachPilot sheets around a map window, white FastLanding, black FastBot, white questions, yellow contact, black colophon.

The entry's ads share one grid. Phones stack them. From 700px the OutreachPilot and FastLanding ads sit side by side (5fr and 4fr) on a four-row subgrid, so headline, bullets, order line and signature align across the plates, and the call ad runs full width below; from 1280px all three stand in one row (5fr, 4fr, 3fr). Columns of type follow the directory: the index list splits into two columns from 560px, the 3-in-100 sheet keeps four columns of 25 at every width, questions run in two columns from 900px, the process in five from 960px, the colophon in four (1fr 1fr 1fr 1.6fr) from 1100px. The index list, the 3-in-100 sheet, the questions and the process are split by 1px column rules. Sticky elements from 960px: the 3-in-100 text, the OutreachPilot proof panel (top: calc(50vh - 11rem)), the FastBot chat, the case notes on the work page.

Map windows are transparent sections over the fixed canvas (the index, the OutreachPilot map band at clamp(24rem, 78vh, 46rem), page heads with a chapter, the 404); every opaque sheet is marked `data-scene-occlude` so the map can sleep under it. Below 960px a window opens at the top of its section (padding-top: calc(52px + 34svh)) and the text sits below it on a stock sheet that extends 1.5rem upward, with the poster pinned by default at 52px + 17svh.

### Named Rules
**The Size Is Billing Rule.** Ad area encodes importance: OutreachPilot takes the widest track (5fr), FastLanding the next (4fr), the call the smallest (3fr). A new ad is billed by the same logic.

**The Window Rule.** The map is visible only through transparent window sections. Every other section is an opaque stock, and the sheets on either side of a window carry a printed 2px rule, so the map reads as passing under paper.

## Elevation & Depth

The system is flat. No shadow creates elevation and no surface floats. Depth comes from printing facts: stocks change from sheet to sheet, 3px ink frames enclose inner sheets (the index result page, the proof panel, the chat, screenshot frames), and the map lies under the paper, seen through windows and tilted like a sheet on a desk (the poster at perspective(190vh) rotateX(32deg), 38deg in the OutreachPilot window). `box-shadow` appears only in four print roles, recorded in the sidecar: the field focus ring, the highlighter band under the re-declined city, the phone-only stock extension above a text sheet, and the 2px ink fore-edge during a page turn.

### Named Rules
**The Flat Stock Rule.** Surfaces never lift. A panel is another sheet of stock inside a 3px ink frame.

**The Misregistration Rule.** Press feedback is print: an order slip drops 1px and its red plate prints 1.5px out of register; a display ad prints its red plate 1.5px out while pressed.

## Shapes

Every corner is square (0px; fields reset the browser radius explicitly). Form comes from rectangles and rules in four weights, each with one job: 8px heavy rules over category heads and under sheet heads (rate card, clauses, process, benchmark, proof sheet, the Justyna listing); 3px frames (`--frame`) around display ads and inner sheets; 2px for section rules, the running-head rule, slip, field and chip borders and the ad signature rule; 1px for row rules and column rules. The one dashed line is the 2px cut line around the order coupon, with a 24px scissors mark on its top edge. Round forms exist only as printed dots: leader dots (0.075em radius at a 0.36em pitch), halftone dots and map rings. Bullets are solid 0.5em squares; the typing indicator is three 7px squares.

### Named Rules
**The Square Corner Rule.** Radius is zero on every element. Roundness is reserved for printed dots.

**The Rule Weight Rule.** 8px opens a department, 3px frames an ad or a sheet, 2px closes a section or edges a control, 1px separates rows and columns. A new element takes the weight of its job.

## Components

### Buttons (order slips)
A printed order slip: a solid block of ink with caps, square, no arrow (`src/components/ui/Btn.astro`, `.btn` in `global.css`).
- **Shape:** square (0px), 2px border in the fill color, 48px minimum height (40px in the phone running head, 36px from 760px).
- **Primary:** ink fill with type in the stock color (yellow on yellow pages, white pages on white), padding 0.7rem 1.15rem, Slip type.
- **Hover / Focus:** hover inks the slip in Spot Red with Knockout White type (0.18s, cubic-bezier(0.16, 1, 0.3, 1)). Press lands the slip 1px down and right while a 2px red plate prints 1.5px up and left behind it. Focus draws a 3px outline in the foreground at a 3px offset.
- **Line:** transparent with a 2px ink border and ink type; hover fills it with ink and stock-colored type.
- **Reversed:** on black stock and inside reversed ads the slip is yellow with black type; hover inks it red; the line variant turns yellow on hover.
- **Text links:** 700 weight with a 2px underline at a 4px offset; the underline turns red on hover. Links inside reading text use a 1px underline that thickens to 2px.

### Chips (choices, city tabs, quick replies)
- **Style:** square, 2px ink border, 600 to 650 weight. Enquiry choices sit on Knockout White (44px minimum); city tabs on yellow (40px); FastBot quick replies are bare outlines.
- **State:** a selected choice or quick reply turns into an ink block with yellow type; a selected city turns into a Spot Red block with Knockout White type, the active state carrying the spot. Hover: yellow under a choice, ink at 10% over yellow under a city tab. Focus: 3px ink outline at a 2 to 3px offset.

### Cards / Containers (display ads and inner sheets)
- **Corner Style:** square (0px).
- **Background:** the ad's own stock: yellow (FastLanding), reversed black (OutreachPilot), white pages (the call).
- **Shadow Strategy:** none (see Elevation & Depth).
- **Border:** 3px frame in the rule color; the reversed ad's frame is black.
- **Internal Padding:** clamp(1rem, 1.8vw, 1.5rem), 0.9rem between parts.
- **Anatomy:** ad headline; a square-bullet list at 0.97rem; a foot with the price sticker and one or two slips; the signature: a 2px rule, the advertiser's name in 850-weight listing caps, a leader line and a cross-reference or place at the right end.
- **Inner sheets:** the index result page, the proof panel, the chat and screenshot frames are white sheets in a 3px frame, topped by a sheet bar: an ink strip with yellow listing caps (sector and city, "KROK 1 Z 4", a URL). A proof frame's bar on the FastLanding sheet turns red on hover, and its capture scrolls inside the frame as the frame crosses the viewport.
- **Print-in:** on first view the entry ads clip in from the top (0.7s) at 0.25s, 0.4s and 0.55s.

### Price Sticker
A Spot Red block with Knockout White type at 75% width, 800, 1rem, padding 0.3rem 0.55rem 0.28rem, the note in a 600-weight small at 0.78em. It is the price carrier on every ad; the FastBot price wraps at 750, 0.92rem.

### Inputs / Fields (the order coupon)
- **Style:** 2px ink border, 0px radius, Knockout White field, 50px minimum height, padding 0.75rem 0.85rem, textarea from 7rem; labels in listing caps at 0.78rem; a red caret.
- **Focus:** the outline gives way to a double ring: a 3px yellow gap inside a 5px ink ring (0.15s).
- **Error:** invalid fields take a Spot Red Deep border; the error line sets 700 at 0.85rem in Spot Red Deep; required marks are Spot Red Deep asterisks.
- **Coupon:** the form sits on white pages inside a 2px dashed ink cut line padded clamp(0.6rem, 1.2vw, 0.9rem), with the scissors mark on the top edge.

### Navigation
- **Running head:** fixed, 52px, yellow, 2px ink rule below. Left, the book title in listing caps at 900 (1rem, 0.9rem on phones). Centre, from 760px, the guide words: the first and last department in view in micro listing caps with a dotted leader between them; a changed word slides up in 260ms. Right, the Gliwice clock (from 1100px, micro at 90% width), the language switch (from 760px) and the booking slip, shortened to "Rozmowa" on phones.
- **Thumb index (from 1100px):** black tabs 44px wide and at least 7.4rem tall, 4px apart, fixed to the right edge below the head, labelled in vertical listing caps at 0.8rem. Tabs rest tucked 8px into the fore-edge and slide out (0.28s) on hover, on focus, or while their department is in view; the current page's tab is Spot Red with Knockout White type.
- **Spis (below 1100px):** a full-screen yellow dialog opened by a 2px-outlined "Spis" button: the title in Category caps, an 8px rule, leader-line rows with department names in 900 condensed caps at clamp(1.7rem, 8vw, 2.4rem) and a note at the right; the current page in red; the booking slip, email and language link at the foot. Escape closes it and returns focus.
- **Breadcrumbs:** subpages open with listing caps at 0.78rem above the category head, the home link underlined.
- **Page turn:** a client-side navigation lays the next page over the old one from the fore-edge (clip-path from the right, 0.55s, cubic-bezier(0.65, 0, 0.35, 1), a 2px ink edge line) while the old page darkens to 90% brightness; going back wipes from the left. The running head, tabs and colophon swap without animation; the map canvas persists across pages.

### Leader Line (signature)
Name, a row of dots, value: the directory's basic line. The dots are a repeating radial gradient in the current color (0.075em dots at 0.36em by 0.3em, 0.9 opacity); the value never wraps and sets in tabular figures. It carries the register, the index rows, the entry lines, the rate cards, the benchmark, ad signatures, contact lines, the Spis, the FastBot listing and the greeked rows of the 3-in-100 sheet. A register row inverts to ink with yellow type on hover; a checked index row stays inverted. On first view the register lays its dots down row by row (0.7s each, 45ms apart) while its counts roll in from zero.

### Category Head (signature)
An 8px ink rule, 0.9rem of air, the department name in Category caps, usually followed by a Statement. Inside a department, sheet heads set listing caps above an 8px rule.

### Index Result Page (signature interaction)
Picking a sector and a city re-typesets a white directory page framed in 3px ink: a sheet bar with the sector and city, two counts in the display voice (the sector count in Spot Red Deep), and the first line of an email with the city re-declined under a yellow highlighter band (inset 0.42em). Counts roll to their new value in 900ms on a critically damped curve, changed words rise 0.35em into place in 320ms, and the printed map pings the city.

### Printed Map (signature)
A three.js point cloud on a fixed canvas behind the pages (`src/scene/`): 32 000, 16 000 or 8 000 points by device tier, device pixel ratio capped at 1.5 (1.0 on the low tier), premultiplied ink composited over the stock, no post-processing.
- **Screen:** the map chapters print as an ordered hex halftone at full ink; dot diameter is the lattice pitch times (0.22 + 0.28 × tone), about 12% ink in open country and 45% around the large cities. Below the 2px sprite floor ink falls with the dot's area, so small dots keep their tone. The border and city dots print solid.
- **Spot:** Gliwice carries a red marker ring. A picked city spreads red ink outward (radius by the square root of its share of firms, critically damped), prints a ring and gets an HTML callout: a yellow chip with the name in 850 listing caps, the count in Spot Red Deep and a 16px red leader to the ring, flipped to the other side near the edge, hidden below 960px.
- **Traffic:** email arcs in black ink leave Gliwice and stand up off the paper; replies return in red; arrivals ripple as rings of full-ink dots that thin by size.
- **Motion:** scrolling through a window turns the map in its own plane like a turntable (0.55 rad of turn for the index map, 1.15 for traffic, 0.4 for the Gliwice close-up; 60% of that on phones), and the shape follows the visible middle of its window. The map prints in over 2.8s the first time a window is on screen, and stops rendering under opaque stock. Reduced motion holds a still frame.
- **Poster:** `public/map-poster.svg` (653 by 620, the same halftone in black ink with the red Gliwice mark) stands in each window, fading out 1.2s after the live map mounts. Software GL, Save-Data and 2G connections keep the poster.

### FastBot Chat
A white sheet in a 3px yellow frame on reversed black, under a listing line with the firm's opening hours. Bubbles are square with a 2px ink border: the customer on yellow at the right, the bot on Knockout White at the left, chips between. The typing indicator is three 7px ink squares pulsing 0.15s apart; the transcript replays once when it scrolls into view.

## Do's and Don'ts

### Do:
- **Do** print every section on one stock class (`.stock-yellow`, `.stock-white`, `.stock-black`) and let `--fg-2` (76%) and `--fg-3` (62%) derive from it.
- **Do** put prices on the red sticker, and keep red fills to prices and active states.
- **Do** set name and value pairs as leader lines: registers, rate cards, contacts, signatures, menus.
- **Do** open a department with the category head: an 8px ink rule over 900-weight caps at 62% width.
- **Do** sign each display ad at its foot: a 2px rule, the advertiser's name, a leader, and a cross-reference or place.
- **Do** make every action an order slip: square, 48px minimum, 800-weight caps at 75% width; hover inks it red, press drops it 1px with the red plate 1.5px out of register.
- **Do** separate rows with 1px ink rules, close sections with 2px rules and frame ads and inner sheets at 3px.
- **Do** set counts, prices and times in tabular lining figures, and roll changing numbers with damping (900ms) under reduced-motion guards.
- **Do** keep the map printed in black ink and the red spot, tone carried by dot size, with the SVG poster as the fallback for no GPU, no WebGL and no JavaScript.
- **Do** collapse every transition and animation under `prefers-reduced-motion: reduce`: no turntable, no roll, no print-in, no smooth scroll.

### Don't:
- **Don't** add gray tokens; secondary type is ink mixed into its stock.
- **Don't** round a corner or lift a surface with a shadow.
- **Don't** add a second typeface, italics or monospace, or set proportional figures.
- **Don't** let anything glow: no bloom, no additive light, no transparency fades on halftone dots.
- **Don't** introduce a second accent hue; red is the only spot ink.
- **Don't** use em dashes in copy; an en dash appears only inside numeric ranges.
- **Don't** put eyebrow labels above headings; the department name is the category head itself.
- **Don't** fold answers into accordions; questions print open in ruled columns.
- **Don't** put arrows on buttons; an external link names its domain in the label.
