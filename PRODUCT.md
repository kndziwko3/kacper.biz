# Product

<!-- impeccable:product-schema 1 -->

Inferred from the repository (src/content/site.ts, copy.ts, ceidg.ts) and the public pages of outreachpilot.pl and
fastlanding.io, re-checked 2026-09-29. The owner handed over full creative control ("100% wolna ręka"), so no interview
round ran; facts below are sourced, open items are marked.

## Platform

web

## Users
- **Primary:** owners of Polish small businesses, freelancers and small agencies who arrive from LinkedIn, Google, AI
  answers or the two product sites and want to know who is behind OutreachPilot and FastLanding before they sign up,
  ask for a quote or book a call. Mostly on a phone, often between jobs; agencies on a laptop during the day.
- **Secondary:** AI engines and search crawlers building an entity for "Kacper Rękawek"; partners and press checking
  facts (company data, prices, dates).

## Product Purpose
kacper.biz is the founder's own page. It proves there is one real person in Gliwice behind two products, explains
both in one place, and turns interest into one of three actions: book 30 minutes with Justyna Lajca (Head of Sales),
send a short enquiry, or go straight to the product. It also strengthens SEO/GEO/AEO for both products.

## Positioning
- **OutreachPilot.pl** finds companies in the public CEIDG registry, Google Maps, PKT.pl and OpenStreetMap, the AI writes
  three emails in correct Polish (names and cities declined), and they go out from the user's own mailbox.
- **FastLanding.io** is a studio: landing page for 1 499 zł net in 7 days, company site 2 899 zł net in 14 days, AI
  chatbot (FastBot) from 1 990 zł net in 3–5 days; fixed price and deadline written into the contract, code handed
  over.
- What nobody else can copy: the CEIDG numbers (3 181 616 active sole proprietorships in 30 sectors; only 3 in 100
  micro-firms list a website in their entry), Polish declension done right, and one person from Gliwice running both.

## Operating Context
Polish business paperwork is the daily world of the audience: CEIDG entries, NIP/REGON, PKD codes, invoices, company
stamps, email inboxes, calendars. Sales happen in a 30-minute online call booked through Calendly
(calendly.com/lajcajustyna/30min).

## Capabilities and Constraints
- Static Astro site, PL (default) + EN, Vercel; lead form via `api/lead.js` (Resend or webhook, mailto fallback).
- SEO/GEO layer must be preserved: JSON-LD graph, llms.txt, llms-full.txt, facts.json, hreflang pairs, sitemap.
- Performance budget: Lighthouse mobile 95+ without GPU (PageSpeed Insights has no GPU). FastLanding promises
  PageSpeed 95+, so this site must meet it.
- No cookies, no third-party analytics.
- Open: portrait photo and a 4–5 sentence founder story (owner to supply; slot on /o-mnie must work without them).

## Brand Commitments
- Names: Kacper Rękawek; OutreachPilot.pl; FastLanding.io; FastBot; Justyna Lajca, Head of Sales.
- Voice: first person for Kacper, plain Polish, every market or results number with a source and date, no em dashes,
  no hype, no invented results.
- OutreachPilot.pl is not affiliated with outreachpilot.co, outreachpilot.ai or useoutreachpilot.com.

## Evidence on Hand
- CEIDG sector and city counts (src/content/ceidg.ts, via outreachpilot.pl/firmy, 29.09.2026).
- Report: 3% of micro-firms list a website in CEIDG (sample 4 700, 7.07.2026).
- Campaign benchmark: 28,5% opens, 1,7% replies, 0,8% bounces, 20 418 emails from 177 campaigns, data to 31.08.2026;
  211 campaigns in total.
- Client sites with screenshots (public/work): Stomatologia Mikroskopowa (Gliwice), Hello Home (Costa Blanca),
  Casa Flamingo (Ciudad Quesada); plus the OutreachPilot landing page.
- A sample FastBot conversation (fictional company, labelled as such).
- Absent, never fabricate: client results, testimonials, logos of clients, portrait photo.

## Product Principles
1. Proof over claims: show the registry, the declension, the send log, the real sites.
2. One person, two products, one place: the page must make the link between them obvious.
3. Every path ends in a human: Justyna's calendar or Kacper's reply within 24 hours on working days.
4. Fast and readable on a phone in daylight before anything else.

## Accessibility & Inclusion
WCAG 2.1 AA; reduced motion respected; the page is complete without JavaScript and without WebGL.
