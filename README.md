# kacper.biz

Osobista strona Kacpra Rękawka, założyciela [OutreachPilot.pl](https://outreachpilot.pl) i [FastLanding.io](https://fastlanding.io).
Jedna scena 3D sterowana scrollem, PL + EN, zbudowana pod SEO, GEO i AEO oraz jako źródło zapytań dla obu produktów.
Kierunek wizualny i zasady tekstów: `docs/art-direction.md`.

## Stack
- **Astro 7** (statyczny HTML) + TypeScript strict, ClientRouter (scena i poster przeżywają nawigację)
- **Three.js**: jedna chmura punktów, która morfuje między rozdziałami (mapa Polski, ruch maili, landing, czat, zbliżenie na Gliwice).
  Ładowana po `load` + idle przez `import()`, tylko na sprzętowym GPU. Bez GPU, bez WebGL, przy save-data i bez JS
  działa statyczny poster `public/map-poster.svg` (5,5 KB) w tym samym kadrze.
- GSAP (ScrollTrigger, SplitText), Lenis tylko na myszy/touchpadzie, natywny scroll na dotyku
- Fonty self-hosted, przycięte do znaków używanych na stronie (Mona Sans, Martian Mono)
- Formularz: Vercel Function `api/lead.js` (Resend albo webhook, fallback `mailto`)

## Komendy
```
npm install
npm run dev        # http://localhost:4321
npm run build      # -> dist/
npm run preview
node scripts/validate-seo.mjs   # po buildzie: title, description, h1, canonical, hreflang, JSON-LD, linki
node scripts/test-lead.mjs      # testy endpointu formularza
npm run poster                  # generuje public/map-poster.svg z wielokąta sceny
npm run fonts                   # po zmianach w tekstach z nowymi znakami (wymaga: pip install fonttools brotli)
node scripts/og.mjs             # karty OG i ikony (Chromium z playwright-core)
```
Podgląd sceny na maszynie bez GPU (np. w CI): dopisz `?gl=high` do adresu.

## Struktura
```
src/content/site.ts    # jedno źródło prawdy dla faktów (osoba, produkty, ceny, projekty)
src/content/copy.ts    # cała treść PL + EN (typografia przez src/lib/typo.ts)
src/content/ceidg.ts   # liczby z CEIDG (outreachpilot.pl/firmy)
src/components/        # sekcje strony głównej (home/), podstrony (pages/), UI
src/scene/             # scena 3D: shapes (kształty), tracker (scroll -> rozdział), view (kadry), shaders
src/lib/schema.ts      # graf JSON-LD (Person, ProfilePage, Organization, WebSite, FAQPage…)
api/lead.js            # endpoint formularza
docs/                  # kierunek wizualny, playbook SEO/GEO, lead capture, TODO właściciela, poprawki dla produktów
```

### Scena: jak sekcje nią sterują
Każda sekcja z `data-scene="0..5"` to plateau: dopóki jest na ekranie, kształt stoi; między sekcjami punkty przepływają
z jednego rozdziału do drugiego (dowolna para, bez przechodzenia przez rozdziały pośrednie).
`data-scene-side` mówi, gdzie jest tekst (kształt idzie na drugą stronę), `data-scene-dim` przygasza scenę pod gęstym
tekstem, `data-scene-focus="1"` włącza efekt „3 na 100”, a `data-scene-occlude` usypia render pod papierowym arkuszem.

## Wdrożenie (Vercel)
1. Zaimportuj repo na Vercel (framework: Astro, build `npm run build`, output `dist`).
2. Ustaw zmienne z `.env.example` (odbiór formularza).
3. Domains: dodaj `kacper.biz` i `www.kacper.biz` (www przekierowuje na apex) i ustaw rekordy DNS tak, jak pokaże Vercel.
4. Po publikacji: `docs/seo-geo-playbook.md` (Search Console, Bing Webmaster, IndexNow, linki zwrotne).

Co musisz dostarczyć albo potwierdzić: `docs/owner-todo.md`. Co poprawić na obu produktach: `docs/product-site-fixes.md`.

## Zweryfikowane (2026-09-29, build produkcyjny na `astro preview`)
| Sprawdzenie | Wynik |
|---|---|
| `scripts/validate-seo.mjs` | 0 błędów, 0 ostrzeżeń |
| `scripts/test-lead.mjs` | 29/29 przypadków |
| axe-core (WCAG 2.1 AA + best practice) | 0 naruszeń na 14 stronach (PL, EN, 404) |
| Lighthouse mobile (headless, bez GPU, więc z posterem) | Performance 97–99, A11y 100, Best Practices 100, SEO 100 |
| Lighthouse desktop | Performance 100, CLS 0,017 |
| Em dashe | 0 w `src/`, `public/` i `dist/` (typo.ts rzuca błąd w dev, jeśli jakiś wróci) |

### Znane ograniczenia
- Lighthouse i PageSpeed Insights działają bez GPU, więc mierzą wersję z posterem. Scenę 3D sprawdź po wdrożeniu na prawdziwym
  telefonie i laptopie (Chrome DevTools, zakładka Performance). Scena sama obniża jakość, gdy klatki są wolne.
- Kształt Polski to wielokąt ~113 wierzchołków (dokładność ok. 0,1°), wystarczający do rozpoznania, nie do kartografii.
- Analityka wyłączona (zero cookies). Włączenie Umami albo Plausible wymaga aktualizacji polityki prywatności.
