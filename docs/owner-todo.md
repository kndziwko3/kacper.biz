# Co musisz dostarczyć / potwierdzić

Strona jest zbudowana wyłącznie z faktów publicznie potwierdzonych na outreachpilot.pl i fastlanding.io
(stan 2026-09-28). Nic poniżej nie blokuje publikacji, ale każdy punkt poprawia wiarygodność albo jest decyzją, którą muszę zostawić Tobie.

## Do decyzji (5 minut)
1. **Rozróżnienie od imiennika.** Na frazę „Kacper Rękawek" dominuje inna osoba (badacz bezpieczeństwa międzynarodowego). Strona to
   mówi wprost (FAQ, /o-mnie, stopka, schema `disambiguatingDescription`). Sformułowanie jest w `src/content/site.ts` → `PERSON.disambiguation`.
   Zatwierdź albo zmień ton.
2. **Justyna.** Na stronie występuje tylko jako „Justyna, Head of Sales w OutreachPilot" z linkiem do istniejącej rezerwacji
   (`outreachpilot.pl/umow-demo`). Bez nazwiska, zdjęcia i schema Person. Potwierdź, że jest OK, i że jest osobą (strona OutreachPilot
   nazywa ją tak, ale nie mówi tego wprost; numer telefonu to osobny asystent AI i jest tak opisany).
3. **Zdania w pierwszej osobie, które są Twoimi deklaracjami:** „Odpowiadam zwykle w ciągu 24 godzin w dni robocze",
   „Najpierw testuję na sobie", „Jeśli opisuję wyniki, robię to tylko za zgodą klienta". Usuń, jeśli nie chcesz ich obiecywać (`src/content/copy.ts`).
4. **Klienci w sekcji Realizacje** (Hello Home, Soleil Energia, Casa Flamingo): FastLanding już ich publicznie wymienia, ale nazwane
   case studies z wynikami wymagają zgody klienta. Casa Flamingo: nie wiem, czy to klient czy powiązany podmiot — dostosuj opis.

## Do dostarczenia
- **Zdjęcie** (opcjonalnie). Bez zdjęcia strona opiera się na typografii i 3D. Zdjęcie + krótka historia „skąd OutreachPilot i FastLanding"
  to największy pojedynczy zysk dla E-E-A-T (obie strony produktowe mają dziś zero zdjęć i zero biogramu).
- **Inne publiczne profile** (X, YouTube, Product Hunt, Crunchbase…): dopisz do `PERSON.extraSameAs`. GitHub celowo NIE jest podlinkowany.
- **Odbiór formularza:** ustaw zmienne z `.env.example` (Resend albo webhook). Bez tego formularz otwiera mailto z gotową treścią.
- **Analityka:** domyślnie brak (bez cookies, bez banera). Chcesz mierzyć? Umami/Plausible — wtedy zaktualizuj politykę prywatności.

## Do sprawdzenia przez prawnika/księgową
- Polityka prywatności (`copy.ts` → `privacy`): okres przechowywania (24 mies. to moja propozycja), podstawy prawne, notka art. 13.
- FastLanding podaje ceny „netto" i `vatID` w schema, a OutreachPilot deklaruje zwolnienie z VAT (art. 113) na ten sam NIP — to wymaga spójności.
- Notka o cold mailingu (`LEGAL_NOTE`) jest przepisana z outreachpilot.pl, żeby nie obiecywać zgodności z RODO/PKE.
