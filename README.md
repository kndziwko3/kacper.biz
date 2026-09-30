# kacper.biz

Osobista strona Kacpra Rękawka, założyciela [OutreachPilot.pl](https://outreachpilot.pl) i [FastLanding.io](https://fastlanding.io).
Strona to ciemne studio z jedną rzeźbą: monolitem ze 100 frezowanych płyt (trzy miedziane), który przy scrollu
składa się w kolejne pozy rozdziałów, a między rozdziałami na film nasuwają się kremowe arkusze z dowodami (indeks
branż z CEIDG, wyniki kampanii, cenniki, realizacje, kontakt). PL + EN, zbudowana pod SEO, GEO i AEO oraz jako źródło
zapytań.
Stan prac i otwarte poprawki: `docs/HANDOFF.md`. System wizualny: `DESIGN.md` (do przepisania, patrz HANDOFF); kontrakt kierunku: `.impeccable/surfaces/`; fakty o produkcie: `PRODUCT.md`;
idea i zasady tekstów: `docs/art-direction.md`.

## Stack
- **Astro 7** (statyczny HTML) + TypeScript strict, ClientRouter (canvas filmu przeżywa nawigację)
- **Three.js** (`src/film/`): jeden stały canvas. Studio (PMREM z softboksów, spot klucza z cieniem, miedziana poświata
  na podłodze, satynowe odbicie) i monolit jako jeden `InstancedMesh` ze 100 płyt. Pozy: monolit, rotunda, szuflada
  z falą przeglądania, rozłożony landing page na cokole, monolit. Kamera jedzie po szynie między kadrami rozdziałów;
  przejście do innej podstrony przestawia obiekt zamiast ciąć. Cieniowanie płyt spłaszcza się według skoku płyt
  w pikselach wyjściowych, więc z daleka nie ma mory, a z bliska widać frezowane linie.
- Film startuje po `load`, przy pierwszym scrollu albo po ~3,5 s, tylko na sprzętowym GPU (klasa `html.film-live`).
  Wcześniej i bez GPU (albo przy save-data) każdy rozdział pokazuje still tej samej sceny: `public/stills/p0..p4-{d,m}.webp`
  (klasa `html.film-off` skraca wtedy tory rozdziałów).
- Rozdziały to wysokie tory z przypiętą sceną (`position: sticky`); nagłówek rozdziału odsłania się maską na natywnej
  osi `view-timeline`, reszta typografii stoi. Pasek rozdziałów na dole filmu (`Rail.astro`) świeci bieżący rozdział.
- Lenis tylko na myszy/touchpadzie, natywny scroll na dotyku
- Kroje: Funnel Display (nagłówki), Funnel Sans (tekst), Martian Mono (etykiety i dane); self-hosted, przycięte (~60 KB)
- Formularz: Vercel Function `api/lead.js` (Resend albo webhook, fallback `mailto`)

## Komendy
```
npm install
npm run dev        # http://localhost:4321
npm run build      # -> dist/
npm run preview
node scripts/validate-seo.mjs   # po buildzie: title, description, h1, canonical, hreflang, JSON-LD, linki
node scripts/test-lead.mjs      # testy endpointu formularza
npm run stills                  # przy działającym `npm run dev`: renderuje stills filmu (3x supersampling)
npm run og                      # karty OG i ikony (Chromium z playwright-core), po zmianie stills
npm run fonts                   # po zmianach w tekstach z nowymi znakami (wymaga: pip install fonttools brotli)
```
Podgląd filmu na maszynie bez GPU (np. w CI): dopisz `?gl=high|mid|low` do adresu. W dev jest też `/lab/still?a=0&l=0`
(jedna klatka filmu; tej trasy nie ma w buildzie produkcyjnym).

## Struktura
```
src/content/site.ts    # jedno źródło prawdy dla faktów (osoba, produkty, ceny, projekty)
src/content/copy.ts    # cała treść PL + EN (typografia przez src/lib/typo.ts)
src/content/ceidg.ts   # liczby z CEIDG (outreachpilot.pl/firmy)
src/film/              # film 3D: film.ts (renderer, kadry, tory), monolith.ts (płyty i pozy), studio.ts, post.ts
src/components/film/   # arkusze (OutreachPilot, FastLanding, FastBot, kontakt), indeks branż, realizacje, pasek rozdziałów
src/components/ui/     # Chapter (tor rozdziału), Sheet (arkusz), PageHead (otwarcie podstrony), Btn
src/components/pages/  # strony PL/EN
src/lib/schema.ts      # graf JSON-LD (Person, ProfilePage, Organization, WebSite, FAQPage…)
api/lead.js            # endpoint formularza
docs/                  # kierunek wizualny, playbook SEO/GEO, lead capture, TODO właściciela, poprawki dla produktów
```

### Film: jak strona nim steruje
`[data-ch="0..4"]` to tor rozdziału: pierwsze 42% toru przestawia płyty z pozy poprzedniego rozdziału, reszta napędza
ruch wewnątrz pozy (np. falę w szufladzie). `[data-sheet]` to arkusz: gdy zakrywa cały ekran, film śpi.
Podstrona trzyma jedną pozę przez `[data-film-pose]` w `PageHead`. Po zmianie czegokolwiek w `src/film/` wyrenderuj
stills ponownie (`npm run stills`), a potem karty OG (`npm run og`).

## Wdrożenie (Vercel)
1. Zaimportuj repo na Vercel (framework: Astro, build `npm run build`, output `dist`).
2. Ustaw zmienne z `.env.example` (odbiór formularza).
3. Domains: dodaj `kacper.biz` i `www.kacper.biz` (www przekierowuje na apex) i ustaw rekordy DNS tak, jak pokaże Vercel.
4. Po publikacji: `docs/seo-geo-playbook.md` (Search Console, Bing Webmaster, IndexNow, linki zwrotne).

Co musisz dostarczyć albo potwierdzić: `docs/owner-todo.md`. Co poprawić na obu produktach: `docs/product-site-fixes.md`.

## Zweryfikowane (2026-09-30, build produkcyjny na `astro preview`)
| Sprawdzenie | Wynik |
|---|---|
| `scripts/validate-seo.mjs` | 0 błędów, 0 ostrzeżeń |
| `scripts/test-lead.mjs` | 29/29 przypadków |
| axe-core (WCAG 2.1 AA + best practice) | 0 naruszeń na 14 stronach (PL, EN, 404) |
| Lighthouse mobile (headless, bez GPU, więc ze stills) | `/` 99; A11y, Best Practices, SEO 100; CLS 0; LCP 1,9 s |
| impeccable detect | 0 wzorców „AI slop” w `src/` |
| Em dashe | 0 w `src/`, `public/` i `dist/` (typo.ts rzuca błąd w dev, jeśli jakiś wróci) |

### Znane ograniczenia
- Lighthouse i PageSpeed Insights działają bez GPU, więc mierzą wersję ze stills. Film 3D sprawdź po wdrożeniu na prawdziwym
  telefonie i laptopie (Chrome DevTools, zakładka Performance). Film sam obniża rozdzielczość, gdy klatki są wolne.
- Chunk filmu (three.js) waży ok. 550 KB przed kompresją; ładuje się dopiero po `load` i tylko na sprzętowym GPU.
- Analityka wyłączona (zero cookies). Włączenie Umami albo Plausible wymaga aktualizacji polityki prywatności.
