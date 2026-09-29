# Poprawki na outreachpilot.pl i fastlanding.io

Stan sprawdzony ponownie 2026-09-29. Repozytoria tych stron nie są w tej sesji, więc to lista do wdrożenia osobno.

## Już naprawione (dzięki)
- fastlanding.io: OutreachPilot opisany jako własny produkt, nie realizacja dla klienta.
- fastlanding.io: portfolio zaktualizowane (Stomatologia Mikroskopowa, Hello Home, Casa Flamingo), stare miniatury usunięte.
- fastlanding.io/o-nas: poprawiona gramatyka.
- fastlanding.io/us/about: cena spójna (2 900 USD).
- fastlanding.io: „zero spotkań” zastąpione uczciwym „nie musisz, ale możesz” z rozmową z Justyną.

## Nadal do zrobienia, od największego wpływu
1. **Spięcie encji z kacper.biz (oba serwisy).** Dodaj `https://kacper.biz` do `sameAs` osoby założyciela
   (`outreachpilot.pl/o-redakcji#kacper`, `fastlanding.io/#founder`) i widoczny link „Kacper Rękawek” w stopkach z `rel="me"`.
   kacper.biz linkuje już do obu. Dopóki linki nie idą w dwie strony, Google i modele AI mają słabszy sygnał, że to jedna osoba.
2. **Ujednolić adres LinkedIn:** OutreachPilot używa `/in/kacper-r%C4%99kawek/`, FastLanding `/in/kacper-rekawek`.
3. **Casa Flamingo (schema, ryzyko kary w Google):** `AggregateRating.reviewCount = 6`, a w markupie są 3 recenzje; jedna podpisana
   „Kacper R.” (recenzja od wykonawcy strony narusza wytyczne o recenzjach); w schema jest fikcyjny telefon `+34600000000`.
   Najbezpieczniej usunąć AggregateRating do czasu prawdziwych recenzji gości i podać prawdziwy numer.
4. **OutreachPilot.pl:** autor artykułów bloga to „Zespół OutreachPilot” bez `dateModified`. Zmień na Person Kacper (link do kacper.biz)
   i dodaj `dateModified`.
5. **OutreachPilot.pl:** zwykły `curl` dostaje 403 („edge guard”). Część narzędzi i agentów AI korzysta z takich klientów, więc warto
   przepuścić znane boty wyszukiwarek AI.
6. **FastLanding.io:** 15 stron „miasto × branża” dla USA przy „no US office” to ryzyko doorway pages. Rozważ `noindex` albo realną treść.
