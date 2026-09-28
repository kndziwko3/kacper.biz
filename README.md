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
