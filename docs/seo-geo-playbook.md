# SEO / GEO / AEO playbook for kacper.biz

Status: 2026-10-02 (site live since 2026-10-01). Scope: what the site ships for search engines and AI answer engines, why, how
sure we are, what the search results look like today, and what only the owner can do next. Source of every fact:
`src/content/site.ts` (and `src/content/ceidg.ts` for registry numbers). When a fact changes, edit `site.ts`, bump
`SITE.lastModified`, rebuild, run the validator.

## 1. Goal and honest framing

kacper.biz is the **entity home** of Kacper Rękawek: the one page set that says who he is, links both companies to him, and
separates him from a namesake (an international-security researcher who owns the bare-name results in every engine). The target is
not to outrank the namesake for the bare name; it is to make "Kacper Rękawek + Gliwice / OutreachPilot / FastLanding" resolve
unambiguously in Google, Bing, ChatGPT, Claude, Perplexity and Copilot, and to stop AI answers from mixing OutreachPilot.pl and
FastLanding.io up with look-alike products.

Evidence levels used below: **Proven** (documented by the platform), **Reported** (independent studies or vendor docs
paraphrased by others, correlation only), **Speculative** (cheap, harmless, no evidence of effect). Nothing here guarantees a
ranking, an AI mention or a citation.

## 2. Search results on 2026-10-02 (baseline)

Captured 2026-10-02 on Bing PL in a real browser (23 queries), 4 queries on Brave PL, Bing Copilot as a guest. Google showed a
reCAPTCHA wall, so there is **no Google, AI Overview or People Also Ask data**; paid SERP APIs had no balance. Raw notes:
the session scratchpad `seo/research/serp-ai-2026-10-02.md` and `entity-verification-2026-10-02.md` (not in the repo).
Single-day snapshot, Bing ranks differently from Google.

| Query family | What ranks | Our domains |
|---|---|---|
| "Kacper Rękawek", "Kacper Rekawek" | namesake (ICCT, GLOBSEC, books, radio); no knowledge panel | LinkedIn #3, GoWork "FastLanding" #6; kacper.biz not indexed yet |
| "Kacper Rękawek Gliwice" | flips to him: GoWork, LinkedIn, monitorfirm.pb.pl, fastlanding.io/o-nas | yes, via third parties |
| "Kacper Rękawek OutreachPilot" | LinkedIn posts #1 and #3, outreachpilot.pl #2, the public GitHub repo of this site #7 | yes |
| "OutreachPilot", "OutreachPilot.pl" | outreachpilot.pl #1–2, then outreachpilot.co, .io, .net share the page | yes |
| "outreachpilot opinie" | review sites (SourceForge, Capterra, Slashdot) about **another** OutreachPilot | only outreachpilot.pl |
| "FastLanding", "FastLanding.io" | fastlanding.io #1–2, fastlanding.dev and .site on the page | yes |
| "fastlanding opinie" | GoWork opinions #1, plus generic scam/warning lists (legalniewsieci.pl, czerwona-skarbonka.pl) | reputation risk, see 9.7 |
| "cold mailing CEIDG", "cold mailing do firm" | outreachpilot.pl #1 / #2–3; Bing AI answer cites it | strong (product site) |
| "narzędzie do cold mailingu" | outreachpilot.pl ranking article #1, AI answer names OutreachPilot first | strong |
| "baza firm CEIDG" | ceidg.gov.pl, biznes.gov.pl, obeg.pl, dane-firm.pl, rejestrb2b.pl | absent |
| "baza firm bez strony www" | dane-firm.pl #1, outreachpilot.pl guide #2 | near win |
| "strona internetowa w 7 dni", "landing page cena", "ile kosztuje landing page" | strony7dni.pl, deviqo.pl, Landingi, be-dev, KC Mobile | FastLanding absent |
| "chatbot AI dla firmy", "chatbot na stronę cena" | pcarena, drchatbot, aiport, autopilot.com.pl | FastLanding absent |
| "strona internetowa Gliwice" | only city portals, no agencies, no local pack seen | open niche, see 9.6 |

AI answers observed (Bing Copilot, guest, 2026-10-02):
- "Kim jest Kacper Rękawek" describes only the namesake.
- With both product names in the question it finds the Gliwice entrepreneur behind FastLanding (citing monitorfirm.pb.pl and
  GoWork) but says no source confirms the link to OutreachPilot. kacper.biz states that link on every page once indexed.
- "Co to jest OutreachPilot.pl" describes a **different** OutreachPilot (LinkedIn tool, iGaming media network).
- "Co to jest FastLanding.io" describes **fastlanding.dev / fastlanding.site** (AI landing-page builders).
- "narzędzie do cold mailingu do firm z CEIDG" lists Woodpecker, Lemlist, Apollo, Instantly and others, not OutreachPilot.
- Another AI summary repeated **old OutreachPilot prices (Pro 149 zł, Business 349 zł)** that no longer appear on
  outreachpilot.pl/cennik (re-read 2026-10-02: Free 0, Starter 99, Pro 199, Business 399, Agencja 799 zł/mies.).

## 3. Query-to-page ownership

A personal site cannot lead the category head terms; the product sites can. Each family has one owner page, and kacper.biz links
to it instead of competing with it.

| Query family | Owner page | kacper.biz role |
|---|---|---|
| Kacper Rękawek (+ Gliwice, kim jest, kontakt) | kacper.biz `/` (brands) and `/o-mnie` (identity, ProfilePage) | owner. Titles differ on purpose: home names the two companies, About names Gliwice |
| OutreachPilot / OutreachPilot.pl / "kto stoi za" | outreachpilot.pl | `/outreachpilot` supports: founder, plans, disambiguation from 5 look-alikes |
| FastLanding / FastLanding.io | fastlanding.io | `/fastlanding` supports: founder, prices, disambiguation from fastlanding.dev/.site |
| cold mailing CEIDG / do firm / B2B, narzędzie do cold mailingu | outreachpilot.pl (ranks #1–3 already) | link to it; FAQ "Czym jest cold mailing do firm z CEIDG?" |
| baza firm CEIDG, baza firm bez strony www | outreachpilot.pl/firmy and its guides | none; near win belongs to outreachpilot.pl |
| ile mikrofirm ma stronę www (original data) | outreachpilot.pl/raporty/firmy-bez-strony-www-2026 | FAQ answer with source and date (citable) |
| strona internetowa w 7 dni, landing page cena, ile kosztuje landing page | fastlanding.io (needs dedicated pages, see 9.5) | `/fastlanding` + FAQ "Ile kosztuje landing page i strona firmowa w FastLanding.io?" |
| chatbot AI dla firmy, chatbot na stronę cena | fastlanding.io/chatboty-ai | FAQ "Ile kosztuje chatbot AI dla firmy w FastLanding.io?" |
| strona internetowa Gliwice | fastlanding.io (a Gliwice page + Google Business Profile) | none |

Near-term wins (weeks): name + Gliwice / product queries once kacper.biz is indexed; "baza firm bez strony www" (#2 today,
outreachpilot.pl); "strona internetowa Gliwice" (no agency in the top 10). Head-term leadership (months, owner work): landing page
and chatbot price queries need dedicated fastlanding.io pages and links from outside (section 9).

## 4. AEO: questions answered on the site

Visible FAQ on the home page (all 11), with `FAQPage` markup. Each answer is self-contained, names the entity, and carries prices,
sources and dates. Every question has a stable anchor (`#faq-...`) on the visible item and the same URL in `Question.url`, so an
answer can be linked or cited directly. Google removed FAQ rich results (2026-05-07); the markup stays valid for other consumers.

| # | Question (PL; EN mirrors it) | Query family | Also on |
|---|---|---|---|
| 0 | Kim jest Kacper Rękawek? | name | /o-mnie |
| 1 | Czym jest OutreachPilot.pl? | brand | /outreachpilot |
| 2 | Ile kosztuje landing page i strona firmowa w FastLanding.io? | landing page cena, ile trwa strona | /fastlanding |
| 3 | Czy muszę się spotykać albo dzwonić? | process | /fastlanding |
| 4 | Czy OutreachPilot.pl ma związek z innymi narzędziami o nazwie OutreachPilot? | brand collision | /outreachpilot |
| 5 | Skąd pochodzą liczby na tej stronie? | trust | /o-mnie, /outreachpilot |
| 6 | Czym jest FastLanding.io? | brand + collision with fastlanding.dev/.site | home only (wire to /fastlanding, see 8) |
| 7 | Ile kosztuje chatbot AI dla firmy w FastLanding.io? | chatbot cena, ile kosztuje chatbot | home only (wire to /fastlanding) |
| 8 | Czym jest cold mailing do firm z CEIDG? | cold mailing CEIDG (+ legal caveat, no legal advice) | home only (wire to /outreachpilot) |
| 9 | Ile mikrofirm w Polsce podaje stronę www w CEIDG? | original data | home only (wire to /outreachpilot) |
| 10 | Jak skontaktować się z Kacprem Rękawkiem? | name + kontakt | home only |

Not answered on purpose: "czy cold mailing jest legalny w Polsce" (top autocomplete). The site only states the product's own
position (no claim of automatic RODO/PKE compliance, the sender assesses the legal basis); a legal answer belongs to a lawyer.
Pages pick FAQ items by index, so new questions are appended at the end of `copy[lang].faq`.

## 5. What is implemented

| Piece | File | Why | Evidence |
|---|---|---|---|
| Canonical, hreflang (`pl-PL`, `en`, `x-default`=PL), `noindex` switch | `src/components/Seo.astro` | Duplicate/locale signals for a bilingual site; `/` and `/en` with `trailingSlash: 'never'` | Proven |
| Live delivery (checked 2026-10-02) | Vercel | apex is canonical; www, http, trailing slash and `.html` all 308 to the clean URL; unknown paths return a real 404; `/lab` 404; `/api/lead` 405 to GET | Proven |
| JSON-LD entity graph | `src/lib/schema.ts` | One coherent graph on every page, every `@id` resolves (build check) | Proven for Google features; the rest Reported |
| `Person` (`disambiguatingDescription`, `alternateName`, `knowsLanguage`, `sameAs`, `worksFor`) | `schema.ts` | Namesake defence; identity links; sameAs only verified profiles (LinkedIn, outreachpilot.pl/o-redakcji, fastlanding.io/o-nas, all re-checked 2026-10-02) | Reported |
| Organization nodes reuse the product sites' own `@id`s, each with `disambiguatingDescription` naming the look-alike domains | `schema.ts`, `site.ts` | Same entity ids on all three domains; Copilot confused both brands on 2026-10-02 | Reported |
| `Service` + `OfferCatalog` for **both** products | `schema.ts` | OutreachPilot plans (5, final prices, VAT-exempt seller) and FastLanding one-off + monthly prices (9, net), exactly as shown on the page | Proven (markup must match content) |
| `ProfilePage` on About, `WebPage` (mainEntity Person) on home | `schema.ts` | Google's ProfilePage documentation | Proven |
| `CollectionPage` + `ItemList` of `CreativeWork` on Work, with screenshot `image` and `inLanguage` | `schema.ts` | Client sites as FastLanding work; OutreachPilot is **not** client work | Reported |
| `FAQPage` with `Question.url` anchors | `schema.ts`, `Faq.astro` | Deep-linkable answers; plain-text answers (typography stripped) | Proven (no rich result) |
| No `AggregateRating` / `Review` anywhere | `schema.ts`, validator | Self-serving reviews violate Google guidelines | Proven |
| `robots.txt` naming search, user-fetch and training crawlers | `src/pages/robots.txt.ts` | See section 6 | Proven (vendor-documented agents) |
| Sitemap with `<lastmod>` and `xhtml:link` hreflang pairs | `astro.config.mjs` | `lastmod` = `SITE.lastModified`, the same date as JSON-LD `dateModified` | Proven |
| Favicon: PNG 192 px declared before the SVG; manifest with `id` | `Seo.astro`, `public/site.webmanifest` | Google accepts SVG; Bing and older Safari need a raster icon | Proven |
| `llms.txt` in the llmstxt.org layout; `llms-full.txt` | `src/lib/llms.ts` | Facts in the free-text body, H2 sections hold only links; passes the suite validator | **Speculative**: Google says Search does not use these files |
| `facts.json` (schemaVersion 2) | `src/lib/facts.ts` | Every fact with its source URL and check date: plans, offers, benchmark, registry note | Speculative |
| Validator | `scripts/validate-seo.mjs` | See section 11 | n/a |

Google's own guidance (Search Central, AI features): no special markup, no AI text files and no Markdown copies are needed to
appear in AI Overviews / AI Mode; ordinary SEO fundamentals apply. Nothing here relies on the speculative items.

## 6. Crawler policy (robots.txt)

Unchanged on 2026-10-02. The SEO suite's platform-controls registry was past its 45-day verification window, so no crawler rule was
added or removed on its say-so; the owner's policy stands.

- **Search crawlers (allowed, they create citations):** Googlebot, Bingbot, OAI-SearchBot, Claude-SearchBot, PerplexityBot, Applebot.
- **User-triggered fetchers (allowed):** ChatGPT-User, Claude-User, Perplexity-User.
- **Training crawlers / control tokens (allowed on purpose):** GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, CCBot. To opt out
  later, change `TRAINING_BOTS` to `Disallow: /` in `robots.txt.ts`; search and user-fetch bots are separate agents and keep working.
- Disallowed for everyone: `/api/` and `/lab`. RFC 9309: a crawler that matches a named group ignores `*`, so the disallow rules are
  repeated in every named group. The validator fails the build if any search bot is blocked.

## 7. Entity graph (per page)

Site-wide on every page: `WebSite` (`/#website`), `Person` (`/#person`), `Organization` OutreachPilot.pl
(`https://outreachpilot.pl/#organization`), `ProfessionalService` FastLanding.io (`https://fastlanding.io/#organization`).

| Page kind | Extra nodes |
|---|---|
| home | `WebPage` (about + mainEntity Person), `FAQPage` (11 questions) |
| about | `ProfilePage` (mainEntity Person, dateCreated, dateModified), `BreadcrumbList`, `FAQPage` |
| product: OutreachPilot | `WebPage` + `Service` (`additionalType` SoftwareApplication) with `OfferCatalog` of 5 plans; a literal SoftwareApplication would need ratings for Google's rich result |
| product: FastLanding | `WebPage` + `Service` with `OfferCatalog` of 9 offers (6 one-off, 3 SEO/AI services, monthly ones as `UnitPriceSpecification` per month) |
| work | `CollectionPage` + `ItemList` of `CreativeWork` (creator FastLanding) |
| contact | `ContactPage`; `contactPoint` (public emails, AI phone line described as AI) on the two orgs |
| legal | `WebPage` |

Rules baked in: no Person node for anyone but Kacper (Justyna has none), no street address (city only), NIP/REGON only, no GitHub URL,
no awards/credentials/press, no ratings/reviews. Markup must match visible content; the validator now fails the build when a marked-up
price is not visible on its page.

## 8. Open items for the site (not done in the SEO lane)

1. **Registry numbers are mislabelled and stale (critical, fix before or with the next deploy).** outreachpilot.pl/firmy (re-read
   2026-10-02, "Aktualizacja 1 października 2026") says its 30-sector total is a **sum of active CEIDG entries per PKD code** and
   "nie jest liczbą firm"; the sum is now **3 702 470**, and seven sectors changed a lot (e.g. firmy budowlane 127 213 to 363 718).
   kacper.biz still shows the 29.09 snapshot and calls the sum "3 181 616 aktywnych JDG" (`copy.ts` home.demo.source PL/EN,
   `ceidg.ts` total, sector and city counts, demo labels "aktywnych JDG"). Refresh `ceidg.ts` from /firmy and relabel the total as
   entries, not businesses. FAQ 5 takes its date from `ceidg.ts` automatically; `PROOF[0]` in `site.ts` already carries the 1.10 figure
   with the correct label (it feeds llms.txt and facts.json only).
2. **Wire the new FAQ answers into the product pages** (component change): `OpPage.astro` `[1, 8, 4, 9, 5]`, `FlPage.astro`
   `[6, 2, 7, 3]`. Until then they are visible and marked up on the home page only.
3. **Footer and /outreachpilot disambiguation lines** still name three look-alike domains; `site.ts` now lists five
   (`PRODUCTS.outreachpilot.notAffiliatedWith`). Derive `ui.footer.disambig` and `op.disambig.p` from that list.
4. **`/favicon.ico`** returns 404. A 16/32/48 px ICO built from `public/icon-192.png` was handed over; put it in `public/`.

## 9. Owner-only actions (authority, profiles, product sites)

Ordered by expected effect on the entity and on AI answers. Real listings and real content only; no bought mentions, no invented
reviews. Use one canonical line everywhere: "Kacper Rękawek (Gliwice), founder of OutreachPilot.pl and FastLanding.io", linking
`https://kacper.biz`.

1. **Get kacper.biz indexed.** Bing Webmaster Tools (import from Search Console or DNS-verify), submit
   `https://kacper.biz/sitemap-index.xml`; Google Search Console as a Domain property via DNS TXT, submit the same sitemap, then URL
   Inspection for `/`, `/o-mnie`, `/en`. The GSC account connected to this session does not own kacper.biz yet. Then run
   `node scripts/indexnow.mjs --send` once per content release (Bing, Yandex, Seznam, Naver, Yep; Google ignores IndexNow).
2. **outreachpilot.pl links back.** It has **no link to kacper.biz anywhere** (checked 2026-10-02). Add a visible "Założyciel: Kacper
   Rękawek" link to `https://kacper.biz` with `rel="me"` on /o-redakcji and in the footer, and add `https://kacper.biz/` to the `sameAs`
   of `https://outreachpilot.pl/o-redakcji#kacper`. Also: its `Organization.sameAs` points to the founder's **personal** LinkedIn;
   remove it there (an organisation is not a person) and keep it on the Person node.
3. **fastlanding.io JSON-LD.** It links to kacper.biz visibly, but not in JSON-LD: add `https://kacper.biz/` to the `sameAs` of
   `https://fastlanding.io/#founder`, and give `https://fastlanding.io/#organization` a `sameAs` list. `/o-nas` redeclares
   `#organization` as a plain `Organization` while the home page says `ProfessionalService`; one id, one type.
4. **One LinkedIn URL.** kacper.biz and outreachpilot.pl use `/in/kacper-r%C4%99kawek/`; fastlanding.io uses `/in/kacper-rekawek`.
   Open both while logged in, keep the one that is canonical, use it on all three sites. On LinkedIn itself: Website =
   `https://kacper.biz`, headline naming OutreachPilot.pl, FastLanding.io and Gliwice, kacper.biz as a Featured link.
5. **Tell AI engines the brands apart on the product sites themselves.** outreachpilot.pl should name outreachpilot.co, .ai, .io, .net
   and useoutreachpilot.com as unrelated (Copilot described the .io/.net products as OutreachPilot.pl); fastlanding.io should name
   fastlanding.dev and fastlanding.site. Find and fix any outreachpilot.pl page or guide that still says Pro 149 zł / Business 349 zł.
   For head terms, fastlanding.io needs dedicated pages: "landing page cena / ile kosztuje landing page", "strona internetowa w 7 dni",
   "chatbot AI dla firmy cena", each answer-first with the published prices and dates.
6. **Local: FastLanding in Gliwice.** "strona internetowa Gliwice" shows only city portals today. A Google Business Profile for
   FastLanding as a service-area business (address hidden, Gliwice + Śląskie as service area, category web designer), a Bing Places
   copy, and a fastlanding.io/gliwice page. Claim the Panorama Firm listing (it already shows NIP and fastlanding.io; it also prints the
   street address, which is why kacper.biz does not use it as `sameAs`) and add kacper.biz and outreachpilot.pl there.
7. **Reputation for "opinie" queries.** "fastlanding opinie" pulls GoWork plus generic scam/warning lists. Check whether
   legalniewsieci.pl or czerwona-skarbonka.pl actually list fastlanding.io; if not, nothing to do; if yes, request a correction with
   the NIP/REGON. Ask real customers (with consent) for reviews on Google and GoWork; never mark those up on kacper.biz.
8. **The public GitHub repo of this site** (`github.com/kndziwko3/kacper.biz`) is indexed and ranks for "kacper.biz" (Bing #3) and
   "Kacper Rękawek OutreachPilot" (Bing #7, Brave #2). Decide whether it should be public; if yes, check it exposes nothing unwanted.
9. **Profiles worth creating** (none exist today; nothing found on Product Hunt, Crunchbase, Clutch, YouTube): LinkedIn company pages
   for OutreachPilot.pl and FastLanding.io (the existing "OutreachPilot" company page belongs to another firm), a Product Hunt launch
   for OutreachPilot.pl with the founder as maker, a YouTube channel with short screen-recorded demos. Add each URL to
   `PERSON.extraSameAs` in `site.ts` only after it is live and names him; it then flows into `sameAs`, llms.txt and facts.json.
10. **Original data as the linkable asset.** Pitch the benchmark (20 418 emails, methodology page) and the "3 na 100" report to Polish
    sales/marketing newsletters, podcasts and communities, byline "Kacper Rękawek, Gliwice". Independent mentions are what AI answers
    currently trust for him (monitorfirm.pb.pl, GoWork, Useme, LinkedIn), not his own domains.
11. **Wikidata:** item Q126026647 "Kacper Rękawek" has no description and is most likely the namesake. Do not edit or merge it.

## 10. Measurement (after indexing)

- Search Console and Bing Webmaster: impressions and clicks for name, name + Gliwice and name + product queries; indexed pages (14).
- Re-run the 2026-10-02 prompts in Bing Copilot (and ChatGPT, Perplexity, Gemini where reachable), fresh guest sessions:
  "Kim jest Kacper Rękawek", "Kim jest Kacper Rękawek z OutreachPilot.pl i FastLanding.io", "Co to jest OutreachPilot.pl",
  "Co to jest FastLanding.io", "Jakie narzędzie do cold mailingu do firm z CEIDG". Record answer, cited URLs and date. Success:
  correct entity with the product named, kacper.biz or the product site cited, no look-alike brand, current prices.
- Treat any change as observation, not proof of cause: deploys, indexing and engine updates overlap.

## 11. Maintenance

- Changing a fact: edit `site.ts`, bump `SITE.lastModified` (it drives JSON-LD `dateModified`, sitemap `<lastmod>`, llms.txt and
  facts.json), rebuild, run the validator, run IndexNow. Re-reading prices: update `PRICES_CHECKED` (and the amounts if they moved).
- `node scripts/validate-seo.mjs` checks, among others: title/description/H1/canonical/hreflang per page, JSON-LD parses and every
  `@id` resolves, **every Offer price is visible on its page**, FAQ questions are visible and `Question.url` anchors exist, no em dash
  in any built text file, no word joiner in titles/meta/JSON-LD, sitemap `<lastmod>` present and equal to facts.json, a raster
  favicon is declared, llms.txt H2 sections are link lists. Run it after every build; it must print PASS with 0 errors and 0 warnings.
- llms.txt layout check (optional, stricter): the SEO suite's `validate_llms_txt.py validate-file dist/llms.txt`.
- New route pair: add it to `ROUTE_PAIRS` (hreflang + sitemap pairs) and to `PAGE_LABELS` in `src/lib/facts.ts`.
- FAQ: `copy[lang].faq`; append, never reorder (pages pick items by index). The visible FAQ, `FAQPage` markup and llms-full.txt come
  from the same list.
- Icons and OG cards are committed, not built. Regenerate with `node scripts/og.mjs`.
- Do not add: AggregateRating/Review, Person schema for other people, a street address, a GitHub link, claims of awards or press,
  directory pages that print the street address as `sameAs`.
