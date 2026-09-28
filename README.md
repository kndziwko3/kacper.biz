# kacper.biz

Osobista strona Kacpra Rękawka — założyciela [OutreachPilot.pl](https://outreachpilot.pl) i [FastLanding.io](https://fastlanding.io).
Scroll-driven 3D, PL + EN, zaprojektowana pod SEO, GEO i AEO oraz jako źródło leadów dla obu produktów.

## Stack
- **Astro 7** (statyczny HTML, zero JS domyślnie) + TypeScript strict
- **Three.js** (jedna wyspa WebGL, ładowana po LCP, `import()` — poza ścieżką krytyczną)
- Natywny scroll (bez scroll-jackingu), CSS scroll-driven animations + IntersectionObserver
- Fonty self-hosted (Bricolage Grotesque, Geist, Instrument Serif) — bez zapytań do Google Fonts
- Formularz: Vercel Function `api/lead.js` (Resend lub webhook, fallback `mailto`)

## Komendy
```
npm install
npm run dev        # http://localhost:4321
npm run build      # -> dist/
npm run preview
node scripts/validate-seo.mjs   # po buildzie: title, description, h1, canonical, hreflang, JSON-LD, linki
node scripts/test-lead.mjs      # testy endpointu formularza
```

## Struktura
```
src/content/site.ts    # jedno źródło prawdy dla faktów (osoba, produkty, ceny, projekty)
src/content/copy.ts    # cała treść PL + EN
src/components/pages/  # strony renderowane dla obu języków
src/scene/             # scena 3D (mapa Polski → ruch maili → landing → chat → finał)
src/lib/schema.ts      # graf JSON-LD (Person, ProfilePage, Organization, WebSite…)
api/lead.js            # endpoint formularza
docs/                  # playbook SEO/GEO, lead capture, TODO właściciela, poprawki dla produktów
```

## Wdrożenie (Vercel)
1. Zaimportuj repo na Vercel (framework: Astro, build `npm run build`, output `dist`).
2. Ustaw zmienne z `.env.example` (odbiór formularza).
3. Domains → dodaj `kacper.biz` i `www.kacper.biz` (www → apex redirect) i ustaw rekordy DNS dokładnie tak, jak pokaże Vercel.
4. Po publikacji: `docs/seo-geo-playbook.md` (Search Console, Bing Webmaster, IndexNow, linki zwrotne).

Co musisz dostarczyć/potwierdzić: `docs/owner-todo.md`. Co poprawić na obu produktach: `docs/product-site-fixes.md`.

## Zweryfikowane (2026-09-28, build produkcyjny na `astro preview`)
| Sprawdzenie | Wynik |
|---|---|
| `astro check` (typy) | 0 błędów, 0 ostrzeżeń |
| `scripts/validate-seo.mjs` | 0 błędów, 0 ostrzeżeń (14 stron indeksowalnych) |
| `scripts/test-lead.mjs` | 29/29 przypadków |
| axe-core (WCAG 2.1 AA + best practice) | 0 naruszeń na 10 stronach |
| Lighthouse (headless, programowy GL) | A11y 100 · Best Practices 100 · SEO 100 |
| CLS | 0,005 (mobile i desktop) |
| Performance **bez WebGL** | 99 mobile / 100 desktop, TBT 0 ms |
| Payload | JS strony ~2 KB gz, scena 143 KB gz (osobny chunk, ładowany po `load` + idle), CSS 5,7 KB gz, 0 zewnętrznych requestów, 0 cookies |
| Tryby | reduced-motion (1 statyczna klatka), brak WebGL (poster + HTML), brak JS (cała treść widoczna) — bez błędów w konsoli |

### Znane ograniczenia (uczciwie)
- **Performance z włączoną sceną 3D wynosi ~68–69 w Lighthouse** — ale tylko w środowisku testowym, gdzie WebGL jest renderowany
  programowo (SwiftShader): kompilacja shaderów blokuje wątek (~2,7 s), czego nie ma na GPU. Scena używa `compileAsync`
  (`KHR_parallel_shader_compile`) tam, gdzie rozszerzenie istnieje, oraz oddaje wątek między etapami budowy kształtów.
  **Nie zmierzono jej na prawdziwym GPU/telefonie** — zrób to po wdrożeniu (PageSpeed Insights + Chrome DevTools na realnym telefonie).
- Kształt Polski to wielokąt ~113 wierzchołków (dokładność ok. 0,1°), a klatki przejściowe wyglądają jak wirująca mgła (losowe parowanie punktów) — świadomy kompromis.
- Analityka wyłączona (zero cookies). Włączenie Umami/Plausible wymaga aktualizacji polityki prywatności.
