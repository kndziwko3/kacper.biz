# SEO / GEO / AEO playbook for kacper.biz

Status: 2026-09-28. Scope: what the site ships for search engines and AI answer engines, why, how sure we are, and what to do
after launch. Source of every fact: `src/content/site.ts`. When a fact changes, edit `site.ts`, bump `SITE.lastModified`, rebuild.

## 1. Goal and honest framing

kacper.biz is the **entity home** of Kacper Rękawek: the one page set that says who he is, links both companies to him, and
separates him from a namesake (an international-security researcher who dominates name searches). The target is not to
outrank the namesake for the bare name; it is to make "Kacper Rękawek + Gliwice / OutreachPilot / FastLanding" resolve
unambiguously in Google, Bing, ChatGPT, Claude, Perplexity and Copilot.

Evidence levels used below: **Proven** (documented by the platform), **Reported** (independent studies or vendor docs
paraphrased by others, correlation only), **Speculative** (cheap, harmless, no evidence of effect).

## 2. What is implemented

| Piece | File | Why | Evidence |
|---|---|---|---|
| Canonical, hreflang (`pl-PL`, `en`, `x-default`=PL), `noindex` switch | `src/components/Seo.astro` | Duplicate/locale signals for a bilingual site; `/` and `/en` handled with `trailingSlash: 'never'` | Proven |
| JSON-LD entity graph | `src/lib/schema.ts` | Unambiguous entities for Google, Bing and LLM pipelines that ingest structured data | Proven for Google features; the rest Reported |
| `Person` with `disambiguatingDescription`, `alternateName`, `sameAs`, `worksFor` | `schema.ts` | Namesake defence; explicit identity links | Reported (Google states it uses structured data to understand entities, no guarantee) |
| Organization nodes reusing the product sites' own `@id`s | `schema.ts` | Same entity ids on all three domains so the graph merges | Reported |
| `ProfilePage` on About (`mainEntity` Person, `dateCreated`, `dateModified`) | `schema.ts` | Google's ProfilePage documentation | Proven |
| `FAQPage` markup | `schema.ts` | Kept for other consumers. **Google removed FAQ rich results on 2026-05-07**; the markup is still valid and harmless | Proven (no rich result) |
| No `AggregateRating` / `Review` anywhere | `schema.ts`, validator | Self-serving reviews violate Google guidelines | Proven |
| `robots.txt` naming the search and AI crawlers | `src/pages/robots.txt.ts` | See section 3 | Proven (crawler names and behaviour are vendor-documented) |
| Sitemap (`sitemap-index.xml`) | Astro integration | Discovery and lastmod; excludes `/lab` | Proven |
| `llms.txt`, `llms-full.txt` | `src/pages/llms*.txt.ts` | Consistency with both product sites, which already ship `llms.txt` | **Speculative**: Google says Search does not use these files ("neither harm nor help"). No proven effect on citations anywhere |
| `facts.json` | `src/pages/facts.json.ts` | Machine-readable facts with dates and source URLs, generated from `site.ts` so they cannot drift | Speculative (useful for agents and for our own tests) |
| Visible FAQ + dated statements + "what we do not claim" | page copy, `llms.txt` | Answer-shaped, quotable, honest text is what retrieval systems can lift | Reported |
| IndexNow key + script | `public/<key>.txt`, `scripts/indexnow.mjs` | Push freshness to Bing (the index behind Copilot and reportedly ChatGPT search), Yandex, Naver, Seznam, Yep | Proven for Bing/others; **Google does not support IndexNow** |
| `rel="me"` to LinkedIn, `theme-color`, manifest, icons | `Seo.astro`, `public/` | Identity loop with LinkedIn, brand polish | Speculative / cosmetic |
| OG images (12 cards) | `public/og/*.png`, `scripts/og.mjs` | Link previews on LinkedIn, Slack, X, messengers | Proven (previews) |
| Validator | `scripts/validate-seo.mjs` | Catches regressions before deploy | n/a |

Google's own guidance (Search Central, AI features): no special markup, no AI text files and no Markdown copies are needed to
appear in AI Overviews / AI Mode; ordinary SEO fundamentals apply. Nothing here relies on the speculative items.

## 3. Crawler policy (robots.txt)

- **Search crawlers (allowed, they create citations):** Googlebot, Bingbot, OAI-SearchBot (ChatGPT search), Claude-SearchBot,
  PerplexityBot, Applebot.
- **User-triggered fetchers (allowed):** ChatGPT-User, Claude-User, Perplexity-User. They fetch a page when a person asks about it.
- **Training crawlers / control tokens (allowed on purpose):** GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, CCBot.
  A lead-gen personal brand benefits from being in model memory and the pages contain nothing private. CCBot (Common Crawl)
  is the judgement call because its corpus feeds many third-party models. To opt out later, change `TRAINING_BOTS` to
  `Disallow: /` in `robots.txt.ts`; search and user-fetch bots are separate agents and keep working.
- Vendors document that blocking the training bot does not block the search or user bots (Anthropic: ClaudeBot vs Claude-SearchBot
  vs Claude-User; OpenAI: GPTBot vs OAI-SearchBot vs ChatGPT-User).
- Disallowed for everyone: `/api/` (form endpoint) and `/lab` (sandbox). RFC 9309: a crawler that matches a named group ignores
  `*`, so the disallow rules are repeated in every named group.
- Blocking OAI-SearchBot by accident (often via a blanket "block AI" rule) is the most common reason for total absence from
  ChatGPT search. The validator fails the build if any search bot is blocked.

## 4. Entity graph (per page)

Site-wide on every page: `WebSite` (`/#website`), `Person` (`/#person`), `Organization` OutreachPilot.pl
(`https://outreachpilot.pl/#organization`), `ProfessionalService` FastLanding.io (`https://fastlanding.io/#organization`).

| Page kind | Extra nodes |
|---|---|
| home | `WebPage` about Person |
| about | `ProfilePage` (mainEntity Person, dateCreated, dateModified), `FAQPage` if the page passes `faq` |
| product | `WebPage` about the org + `Service` (OutreachPilot: `additionalType` SoftwareApplication, no price; a literal SoftwareApplication would need offers and ratings for Google's rich result and only create Search Console noise) or `Service` + `OfferCatalog` (FastLanding, prices exactly as published, net PLN) |
| work | `CollectionPage` + `ItemList` of `CreativeWork` (creator FastLanding; OutreachPilot is **not** client work) |
| contact | `ContactPage`; `contactPoint` (public emails, AI phone line described as AI) on the two orgs |
| legal | `WebPage` |

Always: `BreadcrumbList` when breadcrumbs are passed, `inLanguage`, `dateModified` (= `SITE.lastModified`).

Rules baked in: no Person node for anyone but Kacper (Justyna has none: no surname or consent), no street address (city only), NIP/REGON
only (both product sites publish them), no GitHub URL, no awards/credentials/press, no ratings/reviews. Markup must match visible
content: the FastLanding product page must show the same prices as `FASTLANDING_OFFERS`, the contact page the same emails/phone, the
About page the same FAQ questions. `validate-seo.mjs` warns when a FAQ question is not visible on the page.

## 5. Launch checklist (in this order)

1. `npx astro build && node scripts/validate-seo.mjs` must print PASS. Fix errors; read warnings.
2. Deploy. Confirm live: `/robots.txt`, `/sitemap-index.xml`, `/llms.txt`, `/facts.json`, `/<indexnow-key>.txt`, `/og/home.png`.
3. **Google Search Console**: add a *Domain* property `kacper.biz`, verify with the DNS TXT record, submit
   `https://kacper.biz/sitemap-index.xml`, then URL Inspection -> Request indexing for `/`, `/o-mnie`, `/en`.
4. **Bing Webmaster Tools**: sign in, *Import from Google Search Console* (or verify by DNS), submit the same sitemap. Bing's index
   is what Copilot uses and what ChatGPT search is widely reported to draw on (OpenAI does not publish its sources).
5. **IndexNow**: `node scripts/indexnow.mjs` (dry run, prints the payload), then `node scripts/indexnow.mjs --send` once step 2
   passed. Repeat after each content change.
6. **LinkedIn**: profile *Website* = `https://kacper.biz`, add it as a Featured link, and make the headline mention OutreachPilot.pl and
   FastLanding.io and Gliwice. The site links back with `rel="me"` (loop closed).
7. Do the product-site work in section 6 (the largest single entity signal, and it costs nothing).
8. Validate markup: Schema Markup Validator (validator.schema.org) on `/o-mnie` and the FastLanding page; Google's Rich Results
   Test for ProfilePage. (No FAQ rich result exists any more; do not expect one.)
9. Add any further public profiles the owner creates (X, YouTube, Product Hunt, Crunchbase) to `PERSON.extraSameAs`
   in `site.ts`; they flow into `sameAs`, `llms.txt` and `facts.json` automatically.
10. After 2-4 weeks: check Search Console for name queries, and ask ChatGPT, Claude, Perplexity and Copilot (fresh chats, logged
    out where possible): "Who is Kacper Rękawek, founder of OutreachPilot.pl?" and the same with "FastLanding". Record answers
    in a dated note. Expect the namesake to keep the bare-name SERP; success is correct answers when the query includes a
    product or Gliwice.

## 6. Cross-site entity tasks (outreachpilot.pl and fastlanding.io)

Details and the rest of the audit are in `docs/product-site-fixes.md`. The ones that decide whether the entities merge:

1. **Founder `sameAs` -> kacper.biz, both ways.** In the founder's JSON-LD on each product site
   (`outreachpilot.pl/o-redakcji#kacper`, `fastlanding.io/#founder`) add `https://kacper.biz` to `sameAs`, and show a visible link
   "Założyciel: Kacper Rękawek" in the footer with `rel="me"`. kacper.biz already links to both and lists their author pages in `sameAs`.
2. **One LinkedIn URL.** kacper.biz and outreachpilot.pl use `https://www.linkedin.com/in/kacper-r%C4%99kawek/`; fastlanding.io uses
   an unencoded / different variant (`/in/kacper-rekawek`). Pick the one the profile actually resolves to and use it everywhere,
   including `PERSON.linkedin` here.
3. **Person `@id` conflict on `fastlanding.io/us/about`.** It reuses `#founder` and `#organization` with different properties than the PL
   page. One id must mean one definition: make the US page reference the same nodes, or give it its own ids.
4. **OutreachPilot blog `Article` schema:** `author` should be `Person` Kacper (with `url` https://kacper.biz and `sameAs`), not
   "Zespół OutreachPilot", and each article needs `dateModified`.
5. **FastLanding Organization needs `sameAs`** (LinkedIn, kacper.biz) and an honest portfolio: OutreachPilot is the founder's own product,
   not client work (kacper.biz states this on the Work page and in `llms.txt`).
6. Keep VAT wording consistent: kacper.biz publishes NIP/REGON only and no `vatID`; FastLanding publishes net prices while OutreachPilot
   declares a VAT exemption on the same NIP. Reconcile there, not here.

## 7. Off-site mentions plan

The best-known correlational finding (Ahrefs, 75,000 brands, AI Overviews visibility): branded web mentions correlate about 0.66
with AI visibility, backlinks about 0.22; a later update put YouTube mentions highest (about 0.74). Correlation, not proven causation,
and it measures Google's AI Overviews, but the direction matches how retrieval and training data work. So the on-site work above is
necessary but the leverage is **being described consistently by other sites**.

Use one canonical line everywhere: "Kacper Rękawek (Gliwice), founder of OutreachPilot.pl and FastLanding.io", linking `https://kacper.biz`.

Order of effort (real listings and real content only; no bought mentions, no invented reviews):

1. LinkedIn company pages for OutreachPilot.pl and FastLanding.io, each naming the founder and linking kacper.biz.
2. Product Hunt (or a comparable Polish launch board) for OutreachPilot.pl with the founder as maker; Crunchbase-style profile for the founder.
3. Turn the published benchmark (20 418 emails, methodology page on outreachpilot.pl) into pitches for Polish sales/marketing newsletters,
   podcasts and communities. Original data is the most linkable asset the owner already has.
4. Short screen-recorded demos on YouTube (the study above ranks YouTube mentions highest); title and description carry the canonical line.
5. Guest posts / interviews on Polish B2B and web-design sites, byline "Kacper Rękawek, Gliwice".
6. Ask real customers (with consent) for reviews on **third-party** platforms; never mark those up on kacper.biz.

## 8. Maintenance

- Changing a fact: edit `site.ts`, bump `SITE.lastModified`, rebuild, run the validator, run IndexNow. `llms.txt`, `facts.json` and JSON-LD update themselves.
- New route pair: add it to `ROUTE_PAIRS` (hreflang) and, if it should appear in `llms.txt`, to `PAGE_LABELS` in `src/lib/facts.ts`.
- FAQ: `getFaq()` reads `src/content/faq.ts` if present, otherwise `copy[lang].faq` from `src/content/copy.ts`, so the visible FAQ, the FAQPage markup
  and `llms-full.txt` come from one list.
- Icons and OG cards are committed, not built. Regenerate with `node scripts/og.mjs` (needs system Chromium; see the script header for flags).
  Card text is read from `site.ts`, so rerun it after changing names, taglines, e-mails or project names.
- The sitemap integration only pairs identical slugs for `xhtml:link` alternates; translated slugs (`/o-mnie` vs `/en/about`) get on-page hreflang only.
  That is valid (Google accepts any one method). If you want the sitemap to agree, add a `serialize()` hook in `astro.config.mjs` using `ROUTE_PAIRS`.
- Do not add: AggregateRating/Review, Person schema for other people, a street address, a GitHub link, claims of awards or press.
