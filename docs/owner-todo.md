# Co musisz dostarczyć albo potwierdzić

Strona jest zbudowana wyłącznie z faktów opublikowanych na outreachpilot.pl i fastlanding.io (sprawdzone 2026-09-29).
Nic poniżej nie blokuje publikacji, ale każdy punkt podnosi wiarygodność albo jest decyzją, którą zostawiam Tobie.

## Największy zysk
- **Zdjęcie i krótka historia (4–5 zdań).** /o-mnie ma na nie miejsce. Dziś żadna z trzech stron nie pokazuje Twojej twarzy ani historii
  („skąd OutreachPilot i FastLanding”). To najmocniejszy brakujący sygnał E-E-A-T i najczęstsza rzecz, której szuka jury Awwwards.
- **Linki zwrotne do kacper.biz** z obu produktów: szczegóły w `docs/product-site-fixes.md`, punkt 1.

## Do potwierdzenia
1. Zdanie o imienniku (`src/content/site.ts`, `PERSON.disambiguation`): występuje raz, na /o-mnie, oraz w danych strukturalnych.
2. Deklaracje w pierwszej osobie: „Odpowiadam w 24 godziny w dni robocze”, „Na pytania klientów odpowiadam osobiście”,
   „W OutreachPilot sam prowadzę treści”, „Ja zajmuję się produktem i realizacją” (/o-mnie). Zmień w `src/content/copy.ts`, jeśli któreś nie jest prawdą.
3. Justyna Lajca: pokazana z imieniem, nazwiskiem i rolą (tak jak na fastlanding.io), bez zdjęcia. Link prowadzi do jej Calendly.
4. Czat FastBota to przykładowa rozmowa przepisana z fastlanding.io (firma i klient fikcyjni, tak jest podpisana).

## Do ustawienia przy wdrożeniu
- Odbiór formularza: zmienne z `.env.example` (Resend albo webhook). Bez nich formularz otwiera mailto z gotową treścią.
- Analityka: domyślnie brak (zero cookies, zero banera). Jeśli dodasz Umami lub Plausible, zaktualizuj politykę prywatności.
- Firecrawl (narzędzie do researchu używane w tej sesji) skończyło kredyty; to nie wpływa na stronę.

## Do sprawdzenia przez prawnika lub księgową
- Polityka prywatności: okres przechowywania (24 miesiące to propozycja), podstawy prawne, notka z art. 13.
- FastLanding podaje ceny netto i `vatID`, a OutreachPilot deklaruje zwolnienie z VAT (art. 113) na ten sam NIP.
