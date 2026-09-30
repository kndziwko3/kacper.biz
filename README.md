# kacper.biz

Osobista strona Kacpra Rękawka, założyciela [OutreachPilot.pl](https://outreachpilot.pl) i [FastLanding.io](https://fastlanding.io).
Strona to ciemne studio z jednym prawdziwym obiektem: frezowaną klawiaturą 96% z dokładnie 100 klawiszami, z których
trzy są z litej miedzi (Esc, K, Enter: 3 na 100 mikrofirm w CEIDG podaje adres strony). Scroll rozkłada ją na kolejne
pozy rozdziałów, a między rozdziałami na film nasuwają się kremowe arkusze z dowodami (indeks branż z CEIDG, wyniki
kampanii, cenniki, realizacje, kontakt). PL + EN, zbudowana pod SEO, GEO i AEO oraz jako źródło
zapytań.
Stan prac i otwarte poprawki: `docs/HANDOFF.md`. System wizualny: `DESIGN.md` (do przepisania, patrz HANDOFF); kontrakt kierunku: `.impeccable/surfaces/`; fakty o produkcie: `PRODUCT.md`;
idea i zasady tekstów: `docs/art-direction.md`.

## Stack
- **Astro 7** (statyczny HTML) + TypeScript strict, ClientRouter (canvas filmu przeżywa nawigację)
- **Three.js** (`src/film/`): jeden stały canvas i jeden obiekt z proceduralnej geometrii (bez plików GLB).
  `keyboard.ts`: układ 96% ze 100 klawiszami, nasadki PBT (kremowe i grafitowe) z legendami w Martian Mono drukowanymi
  z atlasu, trzy miedziane, przełączniki, płyta ze 100 wycięciami, PCB z miedzianymi padami, anodowana obudowa z
  diamentowym fazowaniem. Każda nasadka to instancja jednej nasadki 1u, którą shader rozciąga metodą nine-slice do
  dowolnej szerokości (spacja 6,25u zachowuje promienie narożników). Pozy: klawiatura, siatka 10 × 10 (97 PBT, 3 miedziane
  wysuwają się), klawiatura pisze sama „Dzień dobry, Panie Tomaszu” (ń przez AltGr+N, strona wypisuje zdanie w tym samym
  tempie), rozłożenie na warstwy, zbliżenie na miedziany Enter, który wciska się raz. Klawisze pod kursorem się wciskają,
  a po starcie filmu przez klawiaturę przechodzi jedna fala wciśnięć.
- `film.ts`: renderer, kadry (`SHOTS`: kamera, światło i obiektyw każdego rozdziału, osobne kadrowanie na telefon), tory
  rozdziałów (obiekt zmienia pozę, zanim nowy rozdział się przypnie), przejście między podstronami. `studio.ts`: studio
  z softboksów (PMREM), spot klucza z cieniem, podłoga, a w `film.ts` wąski „glint” (RectAreaLight), który w każdej klatce
  ustawia się pod kątem odbicia nad miedzianymi nasadkami. `post.ts`: głębia ostrości (bokeh w jednym przebiegu), winieta,
  tone mapping Khronos PBR Neutral (krem zostaje kremowy, miedź miedzianą), poziom czerni podniesiony do czerni strony
  (#0E0C0A, więc canvas i strona mają jedno tło), ziarno i dither. Na telefonie obiekt jedzie razem ze swoim rozdziałem
  (`Tracks.ride`), więc nigdy nie stoi pod blokiem tekstu.
- Film startuje po `load`, przy pierwszym scrollu albo po ~3,5 s, tylko na sprzętowym GPU (klasa `html.film-live`).
  Wcześniej i bez GPU (albo przy save-data) każdy rozdział pokazuje still tej samej sceny: `public/stills/p0..p4-{d,m}.webp`
  (klasa `html.film-off` skraca wtedy tory rozdziałów).
- Rozdziały to wysokie tory z przypiętą sceną (`position: sticky`); nagłówek rozdziału odsłania się maską na natywnej
  osi `view-timeline`, reszta typografii stoi. Pasek rozdziałów na dole filmu (`Rail.astro`) to rząd klawiszy, bieżący
  rozdział jest miedziany.
- Kontrolki (przyciski, nagłówek, pasek, chipy) są klawiszami: promień nasadki, ciemniejsza krawędź, 2 px skoku po
  wciśnięciu.
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
npm run stills -- --base http://localhost:4321   # przy działającym `npm run dev`: stills filmu (supersampling, GPU)
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
src/content/typed.ts   # zdanie, które klawiatura pisze w rozdziale OutreachPilot
src/film/              # film 3D: film.ts (renderer, kadry, tory), keyboard.ts (klawiatura i pozy), studio.ts, post.ts
src/components/film/   # arkusze (OutreachPilot, FastLanding, FastBot, kontakt), indeks branż, realizacje, pasek rozdziałów
src/components/ui/     # Chapter (tor rozdziału), Sheet (arkusz), PageHead (otwarcie podstrony), Btn
src/components/pages/  # strony PL/EN
src/lib/schema.ts      # graf JSON-LD (Person, ProfilePage, Organization, WebSite, FAQPage…)
api/lead.js            # endpoint formularza
docs/                  # kierunek wizualny, playbook SEO/GEO, lead capture, TODO właściciela, poprawki dla produktów
```

### Film: jak strona nim steruje
`[data-ch="0..4"]` to tor rozdziału. Klawiatura zaczyna zmieniać pozę pół ekranu przed przypięciem toru (gdy poprzedni
rozdział albo arkusz jeszcze wyjeżdża) i kończy w 16% przypiętego toru; reszta toru napędza ruch wewnątrz pozy
(`local`: pisanie zdania, wysuwanie miedzianych nasadek, otwieranie się warstw, wciśnięcie Entera). `[data-sheet]` to
arkusz: gdy zakrywa cały ekran, film śpi. Podstrona trzyma jedną pozę przez `[data-film-pose]` w `PageHead`
(o mnie 0, OutreachPilot 1, FastLanding i realizacje 3, kontakt 4, 404 1).

Po zmianie czegokolwiek w `src/film/` wyrenderuj stills ponownie, a potem karty OG. Na Macu skrypt używa Chrome
z GPU (Metal) i trwa kilkanaście sekund; bez GPU (np. w kontenerze) wraca do SwiftShadera:
```
npm run dev
npm run stills -- --base http://localhost:4321
npm run og
```
W dev `window.__film` pozwala zmieniać kadry i pozy z konsoli (`__film.SHOTS[0].fx = 0.3`, `__film.rig(0, [x, y, z], [rx, ry, rz])`).

## Wdrożenie (Vercel)
1. Zaimportuj repo na Vercel (framework: Astro, build `npm run build`, output `dist`).
2. Ustaw zmienne z `.env.example` (odbiór formularza).
3. Domains: dodaj `kacper.biz` i `www.kacper.biz` (www przekierowuje na apex) i ustaw rekordy DNS tak, jak pokaże Vercel.
4. Po publikacji: `docs/seo-geo-playbook.md` (Search Console, Bing Webmaster, IndexNow, linki zwrotne).

Co musisz dostarczyć albo potwierdzić: `docs/owner-todo.md`. Co poprawić na obu produktach: `docs/product-site-fixes.md`.

## Zweryfikowane (30.09.2026, build produkcyjny na `astro preview`)
| Sprawdzenie | Wynik |
|---|---|
| Film na GPU (Apple M5, 1440 × 900, DPR 2) | mediana 5,3 ms na klatkę, p95 10 ms |
| `scripts/validate-seo.mjs` | 0 błędów, 0 ostrzeżeń |
| `scripts/test-lead.mjs` | 29/29 przypadków |
| axe-core (WCAG 2.1 AA + best practice) | 0 naruszeń na 14 stronach (PL, EN, 404), 1440 i 390 px |
| Lighthouse mobile (headless, bez GPU, więc ze stills) | `/` 99; A11y, Best Practices, SEO 100; CLS 0; LCP 1,9 s |
| impeccable detect | 0 wzorców „AI slop” w `src/` |
| Em dashe | 0 w `src/`, `public/` i `dist/` (typo.ts rzuca błąd w dev, jeśli jakiś wróci) |

### Znane ograniczenia
- Lighthouse i PageSpeed Insights działają bez GPU, więc mierzą wersję ze stills. Film 3D sprawdź po wdrożeniu na prawdziwym
  telefonie i laptopie (Chrome DevTools, zakładka Performance). Film sam obniża rozdzielczość, gdy klatki są wolne.
- Chunk filmu (three.js) waży ok. 600 KB przed kompresją (ok. 150 KB gzip); ładuje się dopiero po `load` i tylko na
  sprzętowym GPU.
- Analityka wyłączona (zero cookies). Włączenie Umami albo Plausible wymaga aktualizacji polityki prywatności.
