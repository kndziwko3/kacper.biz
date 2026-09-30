---
name: kacper.biz
description: "A dark product studio with one real object in it: a machined 96% keyboard of 100 keys, three of them copper, taken apart by the scroll while cream evidence sheets carry the facts."
colors:
  copper: "#c8703f"
  copper-hi: "#e39463"
  copper-ink: "#974719"
  studio: "#0e0c0a"
  graphite: "#191613"
  cap-graphite: "#1c1916"
  text: "#ede6da"
  text-2: "#a8a092"
  paper: "#ede7dc"
  paper-2: "#e3dccf"
  field: "#f6f2ea"
  ink: "#15120f"
  ink-2: "#5b5349"
  placeholder: "#6e655a"
  error: "#a3341c"
  error-ink: "#9c2f15"
  error-wash: "#f8ede6"
  pbt-cream: "#e7dfd0"
  pbt-graphite: "#35312d"
  case-graphite: "#2d2a27"
  plate-aluminium: "#c4c0b9"
typography:
  name:
    fontFamily: "'Funnel Display', 'Display Fallback', system-ui, sans-serif"
    fontSize: "clamp(4.2rem, 1.2rem + 11.2vw, 13.5rem)"
    fontWeight: 500
    lineHeight: 0.84
    letterSpacing: "-0.04em"
  display:
    fontFamily: "'Funnel Display', 'Display Fallback', system-ui, sans-serif"
    fontSize: "clamp(2.35rem, 1.1rem + 4.3vw, 5.6rem)"
    fontWeight: 500
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "'Funnel Display', 'Display Fallback', system-ui, sans-serif"
    fontSize: "clamp(1.9rem, 1.2rem + 2.4vw, 3.4rem)"
    fontWeight: 500
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  title:
    fontFamily: "'Funnel Display', 'Display Fallback', system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 1.1rem + 0.5vw, 1.6rem)"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  numeral:
    fontFamily: "'Funnel Display', 'Display Fallback', system-ui, sans-serif"
    fontSize: "2.4rem"
    fontWeight: 500
    lineHeight: 0.9
    letterSpacing: "-0.04em"
  lead:
    fontFamily: "'Funnel Sans', 'Sans Fallback', system-ui, sans-serif"
    fontSize: "clamp(1.12rem, 1rem + 0.45vw, 1.38rem)"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "-0.005em"
  body:
    fontFamily: "'Funnel Sans', 'Sans Fallback', system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
    fontFeature: "'lnum'"
  small:
    fontFamily: "'Funnel Sans', 'Sans Fallback', system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  source:
    fontFamily: "'Funnel Sans', 'Sans Fallback', system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  button:
    fontFamily: "'Funnel Sans', 'Sans Fallback', system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.005em"
  key:
    fontFamily: "'Funnel Sans', 'Sans Fallback', system-ui, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.01em"
  label:
    fontFamily: "'Martian Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: "0.01em"
    fontVariation: "'wdth' 87.5"
rounded:
  focus: "2px"
  cap-inner: "0.5rem"
  cap: "0.6rem"
  tray: "0.9rem"
  panel: "1rem"
  bubble: "1.1rem"
  circle: "50%"
spacing:
  gutter: "clamp(1rem, 0.4rem + 2.6vw, 3rem)"
  col-gap: "clamp(1rem, 0.5rem + 1.6vw, 2rem)"
  page-max: "104rem"
  head: "4.25rem"
  key-target: "2.75rem"
  row: "1rem"
  sec-head: "clamp(2.5rem, 6vh, 4rem)"
  sheet-block: "clamp(4.5rem, 11vh, 8.5rem)"
  block: "clamp(5rem, 13vh, 9rem)"
  measure: "62ch"
components:
  key-copper:
    backgroundColor: "{colors.copper}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.cap}"
    padding: "0.8rem 1.35rem"
    height: "3rem"
  key-copper-hover:
    backgroundColor: "{colors.copper-hi}"
    textColor: "{colors.ink}"
  key-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    typography: "{typography.button}"
    rounded: "{rounded.cap}"
    padding: "0.8rem 1.35rem"
    height: "3rem"
  key-ghost-paper:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
  header-key:
    backgroundColor: "{colors.cap-graphite}"
    textColor: "{colors.text}"
    typography: "{typography.key}"
    rounded: "{rounded.cap}"
    padding: "0.55rem 1.05rem 0.62rem"
    height: "{spacing.key-target}"
  header-key-book:
    backgroundColor: "{colors.copper}"
    textColor: "{colors.ink}"
    typography: "{typography.key}"
    rounded: "{rounded.cap}"
    padding: "0.55rem 1.1rem 0.62rem"
    height: "{spacing.key-target}"
  rail:
    backgroundColor: "{colors.studio}"
    rounded: "{rounded.tray}"
    padding: "0.3rem"
  rail-key:
    backgroundColor: "transparent"
    textColor: "{colors.text-2}"
    typography: "{typography.label}"
    rounded: "{rounded.cap}"
    padding: "0.35rem 0.85rem"
    height: "2.25rem"
  rail-key-current:
    backgroundColor: "{colors.copper}"
    textColor: "{colors.ink}"
  rail-key-mini:
    backgroundColor: "{colors.cap-graphite}"
    textColor: "{colors.text-2}"
    typography: "{typography.label}"
    rounded: "{rounded.cap}"
    width: "{spacing.key-target}"
    height: "{spacing.key-target}"
  sheet:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    padding: "clamp(4.5rem, 11vh, 8.5rem) clamp(1rem, 0.4rem + 2.6vw, 3rem)"
  sheet-dark:
    backgroundColor: "{colors.graphite}"
    textColor: "{colors.text}"
  readout-card:
    backgroundColor: "{colors.graphite}"
    textColor: "{colors.text}"
    rounded: "{rounded.panel}"
    padding: "clamp(1.4rem, 2.6vw, 2.25rem)"
  form-panel:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "clamp(1.4rem, 3vw, 2.5rem)"
  work-frame:
    backgroundColor: "{colors.paper-2}"
    rounded: "{rounded.panel}"
  input:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.cap}"
    padding: "0.85rem 1rem"
    height: "3.25rem"
  input-invalid:
    backgroundColor: "{colors.error-wash}"
    textColor: "{colors.ink}"
  chip:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink}"
    rounded: "{rounded.cap-inner}"
    padding: "0.5rem 1rem"
    height: "{spacing.key-target}"
  chip-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  index-row-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.cap-inner}"
    padding: "0.62rem 0.75rem"
  chat-card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
  chat-bubble-visitor:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.bubble}"
    padding: "0.7rem 0.95rem"
  chat-bubble-bot:
    backgroundColor: "{colors.paper-2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.bubble}"
    padding: "0.7rem 0.95rem"
---

# Design System: kacper.biz

## Overview

**Creative North Star: "The Product Studio"**

kacper.biz is shot like a product: a warm studio-black set with one real object in it, a machined 96% keyboard of exactly 100 keys, three of them solid copper (Esc, K, Enter). Scrolling moves the camera and the board changes pose chapter by chapter; between chapters, flat cream evidence sheets slide over the film and carry the facts. The page's own controls are keys from the same board: the same corner, a darker skirt edge, 2px of travel under the finger.

Density is low on the film and high on the sheets. A film chapter holds one statement: the name or a headline in Funnel Display, a line of Funnel Sans, at most one key. The sheets carry the evidence in rows with hairlines, tabular figures, source lines and forms. Martian Mono appears only where the board itself would print: short labels, counts, dates, the chapter rail and the legends on the caps.

Motion is machined, weighted and damped. The object moves between chapters, the type holds still, and each chapter headline gets one line-mask reveal. Without a GPU, WebGL or JavaScript every stage shows a pre-rendered still of the same pose, and the page stays complete. Refused in the direction: an abstract sculpture, a floating blob, particles, a glowing globe; loud palettes (yellow, red, black) and printed or paper-textured looks.

**Key Characteristics:**
- Two grounds only: studio black for the film and its chrome, cream paper for the evidence sheets.
- One hue: copper, in three tempers (key face, lit on dark, ink on paper).
- Every control is a keycap: 0.6rem corner, 3px skirt, 2px press travel.
- One object, one canvas: a fixed WebGL film behind the page, stills in its place when it cannot run.
- A monumental name in Funnel Display; Funnel Sans for reading; Martian Mono for data only.
- Flat, opaque sheets with hairline rows; depth belongs to the film and the keys.

## Colors

Warm near-neutrals on two grounds, with copper as the only hue.

### Primary
- **Copper** (#C8703F): the face of the primary key (ink text on it, 5.19:1), the current key on the chapter rail, a picked FastBot reply, text selection, the input caret, the copper pads on the film's PCB. The three copper caps on the board are the same metal, rendered from its measured reflectance (see Board Materials).
- **Lit Copper** (#E39463): copper as type or line on dark grounds: the focus ring, the big counts on the readout card, the FastBot clock, the typed caret, a hovered or current menu item, step numerals on the graphite sheet, primary key hover (8.07:1 on studio).
- **Copper Ink** (#974719): copper as type on paper: step numerals, the required-field mark, the focus ring inside a sheet, link underline on hover (5.28:1 on paper).

### Neutral
- **Studio Black** (#0E0C0A): the page ground, the film's lifted black level, the header band, the rail tray, the menu, the footer, the shade behind chapter copy. Also the theme colour.
- **Graphite** (#191613): the dark sheet (FastBot) and the readout card on the index sheet.
- **Graphite Keycap** (#1C1916): the face of every dark key (header keys, the phone rail's letter keys) and the studio backdrop in the film.
- **Warm Light** (#EDE6DA): text on dark. Its 14% alpha is the dark hairline (`--line-d`).
- **Dim Stone** (#A8A092): secondary text on dark: leads, source lines, rail keys at rest (7.54:1 on studio).
- **Cream Paper** (#EDE7DC): the evidence sheets and the paper band behind the header when a sheet is under it.
- **Second Stock** (#E3DCCF): hover on index rows, the bot's chat bubble, the ground inside screenshot frames.
- **Field Cream** (#F6F2EA): inputs, choice chips, the contact form panel.
- **Ink** (#15120F): text on paper, selected chips and index rows, avatar discs. Its 16% alpha is the paper hairline (`--line-p`); 28% outlines inputs and chips.
- **Worn Ink** (#5B5349): secondary text on paper: leads, captions, field labels (6.14:1 on paper).
- **Placeholder Ink** (#6E655A): input placeholders only (5.12:1 on the field).

### State
- **Error Rust** (#A3341C): the border or outline of an invalid field or choice group.
- **Error Ink** (#9C2F15): error messages and the failed form status (6.03:1 on paper).
- **Error Wash** (#F8EDE6): the background of an invalid field.

### Board Materials (the film)
- **Cream PBT** (#E7DFD0): the alpha caps; in the 10 x 10 grid every PBT cap turns this one blank cream. The sheets are the same cream, so the board and the page share their stock.
- **Graphite PBT** (#35312D): the modifier caps.
- **Anodised Graphite** (#2D2A27): the CNC case, metallic, with a diamond-cut chamfer that shows bare polished aluminium as one bright line round the rim.
- **Brushed Aluminium** (#C4C0B9): the switch plate, one cut-out per key.
- Copper on the board is rendered from its measured linear reflectance (0.93, 0.44, 0.22), not from the swatch, so it reads as metal and not as resin; a pressed legend glows copper.

### Named Rules
**The One Metal Rule.** Copper is the only hue on the page. It marks the one primary key per screen, the chapter you are in, and the counts that matter. There is no second accent, no gradient on type and no glow in the page UI (in the film, the only emitted light is a pressed legend lighting copper); Error Rust appears only on a failed field.

**The Three Tempers Rule.** Copper changes temper with its ground: Copper (#C8703F) is a key face carrying ink; on studio or graphite, copper type is Lit Copper; on paper, it is Copper Ink. Copper #C8703F is never text on paper (2.92:1).

**The Two Grounds Rule.** Everything sits on studio black or on cream paper. A sheet swaps the text variables (text becomes ink, dim becomes worn ink, the dark hairline becomes the paper hairline) instead of inventing new colours; hairlines are always the ground's text colour at low alpha.

## Typography

**Display Font:** Funnel Display (with Display Fallback, a metric-matched Arial: ascent 95%, descent 24%)
**Body Font:** Funnel Sans (with Sans Fallback, the same metric-matched Arial)
**Label/Mono Font:** Martian Mono (with ui-monospace, SFMono-Regular, Menlo), variable width 75 to 112.5%

**Character:** A clean grotesk played straight: Funnel Display at weight 500 with tight negative tracking carries the name and the headlines like lettering on a product box, Funnel Sans reads quietly at the same weight family, and Martian Mono is the engraving: the voice of the board's own legends. All three are self-hosted woff2 subsets (latin and latin-ext).

### Hierarchy
- **Name** (500, clamp(4.2rem, 1.2rem + 11.2vw, 13.5rem), line-height 0.84, -0.04em): "Kacper Rękawek" on the first stage, two lines, about 11vw on desktop and 18vw on phones. Nothing else on the site reaches this size.
- **Display** (500, clamp(2.35rem, 1.1rem + 4.3vw, 5.6rem), 0.98, -0.035em): chapter headlines, sheet heads, the subpage H1 (max 16ch).
- **Headline** (500, clamp(1.9rem, 1.2rem + 2.4vw, 3.4rem), 1.02, -0.03em): section heads inside sheets (prices, clauses, process, FAQ, FastBot, the enquiry form) and client names on the work page.
- **Title** (500, clamp(1.25rem, 1.1rem + 0.5vw, 1.6rem), 1.2, -0.015em): H3s, beat titles in a chapter, the benchmark sentence, prose H2s.
- **Numeral** (500, 2.4rem, 0.9, -0.04em; 3.4rem from 960px): process step numbers in Copper Ink (Lit Copper on the graphite sheet). Large counts (the readout's figures, the FastBot clock, the footer's closing name) use the display face at local fluid sizes with -0.04em tracking.
- **Lead** (400, clamp(1.12rem, 1rem + 0.45vw, 1.38rem), 1.45): the line under a headline; the subpage lead holds 44ch.
- **Body** (400, 1.0625rem, 1.55, lining numerals): running text at 62ch (prose pages 68ch).
- **Small** (400, 0.9375rem, 1.5): row notes, breadcrumbs, form errors, beat descriptions.
- **Source** (400, 0.8125rem, 1.55): the source and date under every number, form hints and notices, max 70ch.
- **Button** (500, 1rem, 1, -0.005em): labels on copper and ghost keys.
- **Key** (500, 0.95rem, 1, -0.01em): labels on header keys; choice and city chips use the same size at weight 400.
- **Label** (Martian Mono 500, 0.75rem, 1.35, 0.01em, uppercase, width 87.5%): rail keys, column heads in the footer, field labels and legends (0.02em), row metadata, dates.

### Named Rules
**The Monument Rule.** The name is set once, largest, in two lines, and runs past the copy column under the object's shoulder. Headlines never borrow its size.

**The Mono Is Data Rule.** Martian Mono sets short labels, counts, dates, the rail and the cap legends, always uppercase at label size on the page. It never sets a sentence and never sits above a heading as a kicker.

**The Tabular Figures Rule.** Figures are lining everywhere; in rows, counts and prices they are tabular, and every market or results number carries a source line directly under it.

## Layout

A 12-column grid inside a 104rem wrap, with a fluid gutter (clamp(1rem, 0.4rem + 2.6vw, 3rem)) and column gap (clamp(1rem, 0.5rem + 1.6vw, 2rem)). Below 960px every block spans the full width; from 960px copy takes columns 1 to 6 or 7 to 12 and the other half belongs to the object. The fixed header is 4.25rem tall and anchors are offset by it.

**Chapters.** Each film chapter is a tall track (190 to 300svh on desktop, 150 to 240svh on phones) with a sticky stage of 100svh. The object starts its change of pose 0.55 of a viewport before a track pins and settles within the first 16% of it; the rest of the track drives motion inside the pose. Copy sits low: bottom-aligned on phones, vertically centred from 960px. On phones the object lives in the top half and the copy starts at 44svh, so the object rides with its chapter and is never parked behind text. Without a live film the tracks shorten (0.55 of their length on desktop, 0.6 on phones); with reduced motion they collapse to their content.

**Sheets.** Evidence sheets span the viewport with block padding of clamp(4.5rem, 11vh, 8.5rem); consecutive sheets join without a second top padding. Inside, a section head (headline over lead, clamp(2.5rem, 6vh, 4rem) below it) opens the sheet, and sub-blocks are spaced by clamp(5rem, 13vh, 9rem), often opened by a hairline. Two-column sheet layouts put the main block at columns 1 to 6 and a side block at 8 to 12; where the side block is an instrument, a form or a case record it stays pinned 1.5rem under the header while the main block scrolls.

**Subpage opener.** One viewport of the studio holding the route's pose: H1, lead, keys and breadcrumb bottom-left; on phones the text starts at 50svh.

Breakpoints in use: 420px (the language key drops), 480, 560 (the sector index goes to two columns), 600, 640 (form fields pair up), 700, 760 (full header labels, full rail names), 960px (grid spans, side-by-side chapters, sticky side blocks), and a short-window rule at 960px wide and 760px tall that trims chapter type so the copy clears the rail.

### Named Rules
**The Opaque Floor Rule.** Copy never fights lit metal. On desktop a studio shade (90% to transparent, from the copy side) sits behind the stage copy; on phones an opaque studio block rises from just above the first line, so any part of the object that passes behind text is hidden, never a see-through ghost.

**The One Object Rule.** There is one canvas and one object. Subpages hold a single pose of the same board; no second 3D element, illustration or decorative image enters the film side.

## Elevation & Depth

The page is flat; depth belongs to the film and to the keys. Sheets are opaque cream stock with no shadow of their own; where a sheet meets the film it casts a soft 5rem shade onto the film at its leading and trailing edges. Controls get depth only as keycaps: an inset darker skirt along the bottom edge and, on copper, a lit top edge; pressing moves the key 2px down and the skirt collapses to 1px. Objects laid on a sheet (screenshot frames, the FastBot chat card) carry one long, soft, negatively spread drop.

### Shadow Vocabulary
- **Cap skirt** (`box-shadow: inset 0 -3px 0 rgba(21, 18, 15, 0.22)`): the bottom edge of every copper key and the current rail key.
- **Cap top light** (`box-shadow: inset 0 1px 0 rgba(255, 232, 214, 0.3)`): the lit top edge of a copper key, paired with the skirt.
- **Cap pressed** (`box-shadow: inset 0 -1px 0 rgba(21, 18, 15, 0.22), inset 0 1px 0 rgba(255, 232, 214, 0.2)` with `translateY(2px)`): a copper key going down.
- **Dark key** (`box-shadow: inset 0 0 0 1px rgba(237, 230, 218, 0.1), inset 0 -3px 0 rgba(0, 0, 0, 0.45)`): header keys and the phone rail's letter keys; hover lifts the rim to 0.36, press to 0.2 with a 1px skirt.
- **Ghost key** (`box-shadow: inset 0 0 0 1px var(--line-d), inset 0 -3px 0 var(--line-d)`): the hairline key; on hover rim and skirt take the current text colour.
- **Rail tray rim** (`box-shadow: inset 0 0 0 1px rgba(237, 230, 218, 0.12)`): the tray that holds the rail keys.
- **Field focus** (`box-shadow: 0 0 0 3px rgba(200, 112, 63, 0.35)` with an ink border): inputs and textareas in focus.
- **Frame drop** (`box-shadow: 0 0 0 1px var(--line-p), 0 30px 60px -40px rgba(21, 18, 15, 0.45)`): screenshot frames on a sheet; hover darkens the rim to ink and deepens the drop to 0.55.
- **Chat drop** (`box-shadow: 0 40px 80px -40px rgba(0, 0, 0, 0.7)`): the cream chat card on the graphite sheet.
- **Sheet shade** (`linear-gradient(to top, rgba(0, 0, 0, 0.38), rgba(0, 0, 0, 0))`, 5rem tall): the shade a sheet casts on the film beyond its edges.

### Named Rules
**The Key Depth Rule.** A control shows depth only the way a keycap does: skirt, top light, 2px travel. No floating drop shadows, no glows, no lift on hover.

**The Paper Over Light Rule.** Sheets are opaque and flat. The film sleeps while a sheet covers the screen; the only depth a sheet shows is the shade it casts on the film.

## Shapes

Every control shares the keycap corner (0.6rem): copper and ghost keys, header keys, rail keys, inputs. Shapes nest concentrically around it: controls set inside a group step in (chips and selected index rows at 0.5rem), and holders step out (the rail tray at 0.9rem, the cap plus its 0.3rem padding; cards, frames, the form panel and the chat card at 1rem). Chat bubbles are 1.1rem with a 0.35rem tail corner on the speaker's side. Avatars are discs. Focus rings are 2px outlines offset 3px with a 2px corner. Rules are 1px hairlines in the ground's text colour at low alpha. There are no pills and no square-cornered controls.

### Named Rules
**The Cap Radius Rule.** 0.6rem is the corner of a key. A new control uses it; a container around controls adds its own padding to it; a control inside a container subtracts. Never a pill (999px), never a sharp corner on anything the finger presses.

## Components

### Buttons (keys)
Tactile and quiet: the page's buttons are caps from the same board.
- **Shape:** keycap corner (0.6rem), minimum height 3rem, padding 0.8rem 1.35rem, label in Funnel Sans 500 at 1rem.
- **Copper key (primary):** Copper face, ink label, cap skirt plus cap top light. One per screen, for the single primary action (book the call, send the enquiry). Hover warms the face to Lit Copper.
- **Press:** 2px travel (`translateY(2px)`, 0.12s on the standard ease) and the skirt collapses to 1px.
- **Focus:** a 2px Lit Copper outline offset 3px (Copper Ink on a sheet).
- **Ghost key (secondary):** transparent, a hairline rim and hairline skirt in the ground's line colour; on hover both take the text colour. Warm Light label on dark, ink on paper.

### Chips (choices, city chips, quick replies)
- **Style:** keys set inside a group at 0.5rem, minimum height 2.75rem, padding 0.5rem 1rem, Funnel Sans 0.95rem. On the enquiry form they sit on Field Cream with a 28% ink rim; the sector index's city chips are transparent with the paper hairline.
- **State:** hover draws the rim in ink; selected fills with ink and turns the label cream; keyboard focus shows a Copper Ink outline. The FastBot quick replies are the smallest chips (hairline rim); the one the visitor picked fills copper with an ink label.

### Cards / Containers
- **Evidence sheet:** Cream Paper, ink text, full-bleed, flat; the graphite variant carries FastBot at night.
- **Readout card:** a Graphite instrument face set on the cream index sheet: 1rem corner, padding clamp(1.4rem, 2.6vw, 2.25rem), hairline-divided head, the two counts in the display face (the first in Lit Copper) that roll to each new value, the sample sentence at lead size with the declined city name underlined in copper.
- **Form panel:** Field Cream at 1rem with a paper hairline ring, padding clamp(1.4rem, 3vw, 2.5rem); its inputs step up one tone lighter so they read on it.
- **Screenshot frame:** Second Stock at 1rem, clipped, with the frame drop; the full-page screenshot inside travels upward as the frame crosses the viewport.
- **Shadow Strategy:** see Elevation & Depth. No card floats on the dark film.

### Inputs / Fields
- **Style:** Field Cream, 1px ink rim at 28% (50% on hover), keycap corner, minimum height 3.25rem (textarea 8rem), padding 0.85rem 1rem, body type, a copper caret, Placeholder Ink placeholders.
- **Labels:** Martian Mono 0.75rem uppercase in Worn Ink above the field; required marks in Copper Ink.
- **Focus:** the rim turns ink and a 3px copper ring (35%) appears; no outline.
- **Error:** Error Rust rim over Error Wash; the message below in Error Ink at small size, weight 500.

### Navigation
- **Header keys:** a fixed 4.25rem bar of solid keys that reads on black and on cream: "kacper.biz" at left; the language key, the copper "book a call" key and Menu at right. Graphite Keycap faces with the dark-key rim and skirt, Funnel Sans 500 at 0.95rem, 2.75rem tall. Behind them a band of the ground (studio at 94%, or paper at 96% when a sheet is under the header) fades out 1.5rem below, so scrolling copy never runs into the keys. Below 760px the booking key shows its short label; below 420px the language key is dropped and the menu's language link carries the switch.
- **Menu:** a full-screen studio layer; items in the display face (clamp(2.2rem, 1.2rem + 4vw, 4.6rem)) divided by dark hairlines, each with a mono note; hover and the current page light in Lit Copper; a copper key and plain links at the foot.
- **Chapter rail (home):** a row of keys on the bottom edge of the film in a studio tray (0.9rem corner, 0.3rem padding, 12% rim). Rail keys are Martian Mono labels in Dim Stone; the chapter on screen is a copper cap with the cap skirt. Below 760px the other chapters shrink to 2.75rem graphite keys carrying one letter each, and the current one keeps its name. The rail belongs to the film: it slides down out of view while a sheet or the footer passes under it.

### The Board (signature)
A machined 96% keyboard, procedurally built in three.js: 100 caps as one instanced 1u cap stretched nine-slice to any width, switches, a brushed aluminium plate, a matte black PCB with copper pads and traces, an anodised graphite case. Legends are printed from an atlas set in Martian Mono (dye-sublimated on PBT, engraved on copper). Five poses blend on a damped chapter coordinate while the camera rides a rail, each chapter with its own lens (fov 22 to 32) and light: the floating board in a steep three-quarter view; the caps filed into a 10 x 10 grid with the three copper caps stepping out; the board typing the greeting by itself while the page spells it in step; the exploded build (caps, switches, plate, PCB, case); a macro on the copper Enter as it goes down once. Studio light only: softbox reflections from a baked environment, one warm key with a contact shadow, a cool rim, a narrow glint that tracks the copper caps; post adds depth of field, a lens vignette, Khronos PBR Neutral tone mapping, a black level lifted to Studio Black so canvas and page share one ground, fine grain and dither. Keys under the pointer press.

### Stills
Every stage and subpage opener carries a pre-rendered still of its pose (desktop and phone crops) that stands in until the film runs and stays for good without a GPU; the film fades in over it (0.9s).

### Rows (signature)
The sheets' one table language: label left, value right, a hairline between rows, 1rem of block padding, tabular figures right-aligned, an optional full-width note in the small size. Prices, plans, company facts, contact lines and case metadata all use it.

### Step lists
Numbered process steps: a Copper Ink numeral beside each step on phones, and from 960px a row of equal columns with the numeral (3.4rem) above the text, hairlines above and below the row.

### FastBot chat
A cream chat card on the graphite sheet: a header with an ink avatar disc and the hours in mono, the day as a mono label, visitor bubbles in ink with cream text, bot bubbles in Second Stock, quick-reply chips, a confirmation line with a Copper Ink tick, and a mono disclaimer row. On play, lines still to come wait at 40% opacity and appear in turn (0.45s), so the card never changes height.

### Day keys
The booking picker shows the next five working days as keys with a paper hairline: weekday and month in Martian Mono, the date in the display face at 1.75rem; hover fills them with ink.

## Do's and Don'ts

### Do:
- **Do** make every new control a keycap: the 0.6rem corner, an inset 3px skirt, 2px of travel on press.
- **Do** give each screen one copper key for its single primary action; the second action is a ghost key.
- **Do** put facts on cream sheets laid over the film, in the rows pattern with tabular figures and a source line under every number.
- **Do** use Lit Copper for copper type on dark and Copper Ink for copper type on paper.
- **Do** keep chapter copy on one half of the grid and leave the other half to the object; on phones keep the object in the top half and the copy on an opaque studio floor.
- **Do** keep the page complete without the film: a still for every pose, shorter tracks when the film is off, collapsed tracks and no reveals under reduced motion.
- **Do** let the object move and the type hold still: one line-mask reveal per chapter headline; beyond that only live values move (the greeting typed in step with the keys, a readout count rolling, a swapped word rising 0.35em).

### Don't:
- **Don't** introduce a second hue, a gradient on type, or a glow or bloom in the page UI; copper is the only colour on the page, and in the film only a pressed legend emits light.
- **Don't** add a second 3D object or any abstract form (sculpture, blob, particles, globe); the keyboard is the one object.
- **Don't** set Copper (#C8703F) as text on paper (2.92:1); use Copper Ink.
- **Don't** put a mono label above a heading as a kicker, and don't set sentences in Martian Mono.
- **Don't** give controls pill or square corners, floating drop shadows or hover lifts.
- **Don't** add print texture to the sheets (halftone, registration, grain, leader dots); they are flat cream stock, and grain belongs only to the film.
- **Don't** park the object behind a block of copy on a phone or let copy sit on see-through metal.
