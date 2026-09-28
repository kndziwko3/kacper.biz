# Poprawki na outreachpilot.pl i fastlanding.io (znalezione w audycie 2026-09-28)

Repozytoria tych stron nie są w tej sesji, więc to lista do wdrożenia osobno (mogę to zrobić jako PR-y, jeśli dodasz repozytoria).
Posortowane wg wpływu na SEO/GEO/AEO i wiarygodność.

## Oba serwisy: spięcie encji z kacper.biz (największy zysk)
1. W JSON-LD obu stron dodaj `https://kacper.biz` do `sameAs` osoby założyciela (`outreachpilot.pl/o-redakcji#kacper`, `fastlanding.io/#founder`)
   i dodaj widoczny link „Założyciel: Kacper Rękawek" w stopkach, z `rel="me"`. kacper.biz linkuje do obu.
2. Ujednolić adres LinkedIn: OutreachPilot używa `/in/kacper-r%C4%99kawek/`, FastLanding `/in/kacper-rekawek`.
3. Dodać `sameAs` do Organization FastLanding (dziś brak).

## OutreachPilot.pl
- Artykuły bloga mają `author = "Zespół OutreachPilot"` i brak `dateModified`. Zmień autora na Person Kacper (link do kacper.biz) i dodaj `dateModified`.
- Serwer blokuje (403, „outreachpilot-edge-guard") klientów HTTP: curl, wget, python-requests, httpx, axios, node-fetch. Część agentów AI i
  narzędzi audytowych używa takich klientów — sprawdź, czy to zamierzone; zezwól na znane boty wyszukiwarek AI.
- Niespójne liczby: darmowe narzędzia 18 (strona) vs 15 (agents.md) vs 14 (wpis bloga); słownik 40 haseł (/o-redakcji) vs 61 (/slownik).
- `/o-redakcji` nie ma zdjęcia ani biogramu autora (jedyny sygnał autorytetu to „buduję produkt").
- Raport metodologii nie ma nazwanego autora/recenzenta.

## FastLanding.io
- **Portfolio przedstawia OutreachPilot jako zrealizowany projekt (także /us/about), a to Twój własny produkt.** Wprowadza w błąd — przenieś do „własne produkty".
- Nieaktualne miniatury/opisy: Soleil Energia (H1 na żywo: „Cieplejszy dom, niższe rachunki…", w portfolio nadal „Magazyny energii BESS")
  oraz OutreachPilot (na żywo: „Cold mailing do firm z Twojego miasta w kilka minut").
- **Casa Flamingo (schema):** `AggregateRating.reviewCount = 6`, a widoczne recenzje to 3; jedna recenzja podpisana „Kacper R." komentuje stronę,
  nie pobyt (samodzielne recenzje naruszają wytyczne Google); w schema jest fikcyjny telefon `+34600000000`. Usuń/napraw zanim Google to ukarze.
- `/us/about` używa tych samych `@id` (`#founder`, `#organization`) z innymi właściwościami niż strona PL — jeden byt, dwie sprzeczne definicje.
- Cena US: `/us` i `facts.json` podają 2 900 USD, a renderowana `/us/about` pokazuje 3 900 USD (źródło tekstu niejasne).
- Ryzyko doorway pages: 15 stron „city × trade" dla USA (Houston, Dallas, Phoenix…) przy jednoczesnym „no US office". Rozważ noindex albo realną treść.
- `/o-nas`: błąd gramatyczny („małe, wyspecjalizowane zespół-narzędzie"), brak zdjęcia/biogramu/LinkedIna w widocznej treści.
- Zamówienia „ZLECENIE NR 2026/06" jest na sztywno w HTML — to wygląda na numer zlecenia, a jest dekoracją; rozważ zmianę, żeby nie sugerować liczby zleceń.
- Blog: 10 wpisów (11.06–18.08.2026), brak nowych od 18.08 i brak case studies — najsłabsze ogniwo topical authority.
