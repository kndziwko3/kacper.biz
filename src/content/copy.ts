/**
 * All page copy, PL + EN. Facts come from ./site.ts and from the public pages of
 * outreachpilot.pl / fastlanding.io (checked 2026-09-28). Headings may contain <em> (rendered with set:html).
 * Anything that is a judgement call for the owner is listed in docs/owner-todo.md.
 */
import { FASTLANDING_OFFERS, PRODUCTS, SALES, CONTACT, LEGAL_NOTE, PERSON, SITE } from './site';

const pl = {
  ui: {
    skip: 'Przejdź do treści',
    menu: 'Menu',
    write: 'Napisz do mnie',
    langSwitch: 'EN',
    langLabel: 'Read this page in English',
    updated: 'Zaktualizowano',
    home: 'Strona główna',
    scroll: 'Przewiń',
    readMore: 'Zobacz więcej',
    visit: 'Otwórz stronę',
    footer: {
      tagline: 'Kacper Rękawek — założyciel OutreachPilot.pl i FastLanding.io. Gliwice, Polska.',
      products: 'Produkty',
      site: 'Na stronie',
      contact: 'Kontakt i prawne',
      privacy: 'Polityka prywatności',
      linkedin: 'LinkedIn',
      aiPhone: 'Telefon (asystent AI 24/7)',
      fine: `© 2026 ${PERSON.business.legalName} · NIP ${PERSON.business.nip} · Gliwice, Polska`,
      disambig: 'Nie mylić z dr. Kacprem Rękawkiem, badaczem bezpieczeństwa międzynarodowego. OutreachPilot.pl nie jest powiązany z outreachpilot.co, outreachpilot.ai ani useoutreachpilot.com.',
    },
  },

  home: {
    title: 'Kacper Rękawek — założyciel OutreachPilot.pl i FastLanding.io',
    description: 'Kacper Rękawek z Gliwic buduje produkty, które sprowadzają klientów: OutreachPilot.pl (cold mailing na polskich danych) i FastLanding.io (strony, chatboty AI, aplikacje).',
    nameplate: 'Kacper Rękawek · Gliwice, Polska',
    h1: 'Buduję maszyny do zdobywania <em>klientów</em>.',
    lead: 'Jestem założycielem <strong>OutreachPilot.pl</strong> — cold mailingu na polskich danych — oraz <strong>FastLanding.io</strong> — stron, chatbotów AI i aplikacji w dniach, nie miesiącach.',
    router: {
      op: { kicker: 'Szukam klientów', name: 'OutreachPilot.pl', text: 'Firmy z CEIDG i Google Maps, kampania po polsku, odpowiedzi w jednym miejscu.' },
      fl: { kicker: 'Potrzebuję strony lub bota', name: 'FastLanding.io', text: 'Strony, chatboty AI i aplikacje. Stała cena, zero spotkań.' },
    },
    talk: `Umów 30 minut z ${SALES.firstName}`,
    origin: {
      eyebrow: '00 — Punkt startu',
      h2: 'Z Gliwic do całej <em>Polski</em>.',
      p: 'Buduję produkty, które robią jedną rzecz: sprowadzają klientów. Każda kropka na mapie to firma z rejestru CEIDG albo z Google Maps — potencjalny klient dla kogoś, kto ma dobrą ofertę i nie ma czasu jej szukać.',
      proofLabel: 'Liczby z moich produktów',
    },
    op: {
      eyebrow: '01 — OutreachPilot.pl',
      h2: 'Od branży i miasta do <em>odpowiedzi</em>.',
      lead: 'Wpisujesz branżę i miasto. W 1–2 minuty masz firmy z adresami e-mail. AI pisze kampanię po polsku, wysyłka idzie z Twojej skrzynki, a gdy ktoś odpisze — sekwencja zatrzymuje się sama.',
      steps: [
        { b: 'Firmy na żywo', t: 'Google Maps, PKT.pl, OpenStreetMap i rejestr CEIDG. Filtr „bez www” pokazuje firmy, których wpis nie podaje strony.' },
        { b: 'Kampania po polsku', t: 'Sekwencja 3 maili z poprawną odmianą imion i miast. AI nie dopisuje faktów, których nie podałeś.' },
        { b: 'Odpowiedzi pod kontrolą', t: 'IMAP co 15 minut, klasyfikacja AI (zainteresowany, pytanie, odmowa) i automatyczny stop sekwencji.' },
        { b: 'Podłączony do Claude i ChatGPT', t: 'Serwer MCP z 39 narzędziami: leady, kampanie i skrzynka odbiorcza z poziomu Twojego asystenta AI.' },
      ],
      cta: 'Załóż darmowe konto',
      ctaAlt: 'Zobacz cennik',
      note: 'Od 0 zł na zawsze, 14 dni planu Pro bez karty. Ceny w PLN.',
      more: 'Więcej o OutreachPilot',
    },
    fl: {
      eyebrow: '02 — FastLanding.io',
      h2: 'Strona w 7 dni. Bez <em>spotkań</em>.',
      lead: 'FastLanding to moje studio: projekt, teksty i kod robimy sami. Stała cena, płatność 50/50, kod i prawa zostają u klienta. Szybkość (PageSpeed 95+) i techniczne SEO są w cenie.',
      note: 'Ceny netto, jak na fastlanding.io (stan na 28.09.2026). Płatność 50/50: połowa na start, połowa po wdrożeniu.',
      cta: 'Bezpłatna wycena w 24 h',
      ctaAlt: 'Zobacz ofertę',
      more: 'Więcej o FastLanding',
    },
    bot: {
      eyebrow: '03 — FastBot',
      h2: 'Bot, który odpowiada, gdy <em>śpisz</em>.',
      lead: 'FastBot zna Twoją ofertę i cennik, odpowiada klientom w sekundę o każdej porze, dopytuje o budżet i termin, a kontakty razem z transkryptem rozmowy wysyła Ci mailem.',
      points: ['Wdrożenie w 3–5 dni', 'Działa na każdej stronie, nie tylko zbudowanej przez FastLanding', 'Od 1 990 zł netto + 190 zł/mies. (hosting i model AI)'],
      note: 'Możesz porozmawiać z FastBotem na fastlanding.io — to ten sam bot, który sprzedaje.',
      cta: 'Poznaj FastBota',
    },
    work: {
      eyebrow: '04 — Realizacje',
      h2: 'Żywe strony, nie <em>makiety</em>.',
      lead: 'Wdrożenia klientów FastLanding. OutreachPilot.pl to z kolei mój własny produkt, nie zlecenie.',
      all: 'Wszystkie realizacje',
    },
    rules: {
      eyebrow: '05 — Jak pracuję',
      h2: 'Cztery <em>zasady</em>.',
      items: [
        { b: 'Stała cena i termin', t: 'Cena z oferty to cena z faktury. Termin liczy się od kompletu materiałów.' },
        { b: 'Bez spotkań', t: 'Brief online, nagrania wideo zamiast telefonów, poprawki mailem w 24–48 godzin.' },
        { b: 'Kod jest Twój', t: 'Pliki źródłowe i prawa przechodzą na klienta. Wyjątek: chatbot ma miesięczny abonament na hosting i model AI.' },
        { b: 'Używam tego, co sprzedaję', t: 'Landing OutreachPilot powstał we FastLanding, a treści produktu prowadzę sam. Najpierw testuję na sobie.' },
      ],
    },
    talk2: {
      eyebrow: '06 — Rozmowa',
      h2: 'Wolisz porozmawiać? <em>30 minut.</em>',
      p: `${SALES.firstName}, Head of Sales w OutreachPilot, prowadzi rozmowy sprzedażowe: pokaz OutreachPilot na Twojej branży, dobór planu albo indywidualna wycena. Spotkanie trwa ${SALES.duration.pl}, online.`,
      cta: `Umów rozmowę z ${SALES.firstName}`,
      phoneTitle: 'Wolisz telefon?',
      phone: `${CONTACT.aiPhone.display} — odbiera asystent AI (24/7, po polsku). Na początku rozmowy mówi, że jest AI, i umawia rozmowy z zespołem sprzedaży.`,
    },
    faq: { eyebrow: '07 — Pytania', h2: 'Krótkie odpowiedzi.' },
    contact: {
      eyebrow: '08 — Kontakt',
      h2: 'Powiedz, co <em>budujemy</em>.',
      p: 'Kilka pól i gotowe. Odpowiadam zwykle w ciągu 24 godzin w dni robocze.',
      direct: 'Wolisz mail?',
    },
    marquee: ['OutreachPilot.pl', 'FastLanding.io', 'Cold mailing', 'Strony w 7 dni', 'Chatboty AI', 'Serwer MCP', 'Gliwice'],
  },

  op: {
    title: 'OutreachPilot.pl — cold mailing na polskich danych | Kacper Rękawek',
    description: 'OutreachPilot.pl to moje narzędzie do cold outreachu B2B: firmy z Google Maps, PKT.pl i CEIDG, kampania AI po polsku, odpowiedzi w jednym miejscu. Od 0 zł.',
    eyebrow: 'Mój produkt · OutreachPilot.pl',
    h1: 'Cold mailing na <em>polskich</em> danych.',
    lead: 'OutreachPilot.pl to polskie narzędzie SaaS do cold outreachu B2B. Wpisujesz branżę i miasto, AI pisze sekwencję 3 maili po polsku, a wysyłka idzie z Twojej własnej skrzynki.',
    what: {
      h2: 'Co to jest i dla kogo',
      p1: 'OutreachPilot łączy w jednym przepływie pięć etapów, które zwykle sklejasz z trzech narzędzi i arkusza: wyszukiwanie firm, kampanię, wysyłkę, skrzynkę odpowiedzi i statystyki. Jest zbudowany pod polskie firmy: dane z CEIDG i Google Maps, AI z poprawną polską odmianą, ceny w złotówkach i wsparcie po polsku.',
      p2: 'Kierowany jest do freelancerów, małych firm i agencji, które sprzedają usługi innym firmom w Polsce.',
    },
    forWho: {
      h2: 'Strony dla konkretnych branż',
      items: [
        ['Agencje stron WWW', 'https://outreachpilot.pl/dla-agencji-stron'],
        ['Agencje marketingowe', 'https://outreachpilot.pl/dla-agencji-marketingowych'],
        ['Software house i IT', 'https://outreachpilot.pl/dla-software-house'],
        ['Biura rachunkowe', 'https://outreachpilot.pl/dla-biur-rachunkowych'],
        ['Kancelarie prawne', 'https://outreachpilot.pl/dla-kancelarii'],
        ['Firmy budowlane', 'https://outreachpilot.pl/dla-firm-budowlanych'],
        ['Firmy sprzątające', 'https://outreachpilot.pl/dla-firm-sprzatajacych'],
      ] as [string, string][],
    },
    plans: {
      h2: 'Plany',
      rows: [
        ['Free', '0 zł', '50 leadów / mies. · 10 wiadomości łącznie'],
        ['Starter', '99 zł / mies.', '250 leadów / mies. · 100 maili dziennie'],
        ['Pro', '199 zł / mies.', '1000 leadów / mies. · 300 maili dziennie'],
        ['Business', '399 zł / mies.', '3000 leadów / mies. · 1000 maili dziennie'],
        ['Agencja', '799 zł / mies.', '6000 leadów / mies. · 2000 maili dziennie'],
      ] as [string, string, string][],
      note: 'Ceny końcowe w PLN (zwolnienie z VAT, art. 113 ust. 1), stan na 28.09.2026. Każde nowe konto dostaje 14 dni planu Pro bez karty. Aktualny cennik jest zawsze na outreachpilot.pl.',
    },
    proof: {
      h2: 'Dane, które możesz sprawdzić',
      p: 'W opublikowanym benchmarku OutreachPilot: 211 kampanii, z czego 177 z wysyłką, łącznie 20 418 maili; 42 kampanie miały co najmniej 50 wysłanych wiadomości. Dane zamrożono 31.08.2026, a raport zawiera zastrzeżenie o braku reprezentatywności i opis metody.',
      link: 'Zobacz metodologię',
      mcp: 'Serwer MCP (39 narzędzi, OAuth 2.1) pozwala sterować leadami, kampaniami i skrzynką odbiorczą z Claude, a także z ChatGPT przez Custom GPT Actions.',
      mcpLink: 'Jak podłączyć asystenta AI',
    },
    legal: LEGAL_NOTE.pl,
    disambig: {
      h2: 'Nie mylić z innymi „OutreachPilot”',
      p: 'OutreachPilot.pl to polski produkt z Gliwic (Kacper Rękawek FastLanding, NIP 6312736932). Domeny outreachpilot.co, outreachpilot.ai i useoutreachpilot.com należą do innych, niepowiązanych podmiotów.',
    },
    cta: { h2: 'Zacznij za darmo', btn: 'Załóż konto na outreachpilot.pl', alt: 'Umów rozmowę z Justyną' },
    crumb: 'OutreachPilot',
  },

  fl: {
    title: 'FastLanding.io — strony, chatboty AI i aplikacje w dniach | Kacper Rękawek',
    description: 'FastLanding.io to moje studio z Gliwic: landing page od 1 499 zł w 7 dni, chatboty AI, automatyzacje i aplikacje MVP. Stała cena, płatność 50/50, zero spotkań.',
    eyebrow: 'Moje studio · FastLanding.io',
    h1: 'Strony i boty w <em>dniach</em>, nie miesiącach.',
    lead: 'FastLanding.io to studio z Gliwic działające zdalnie w całej Polsce. Projektujemy, piszemy teksty i kodujemy strony internetowe, chatboty AI, automatyzacje i aplikacje MVP. Stała cena, płatność 50/50, kod i prawa dla klienta.',
    offers: { h2: 'Oferta i ceny', note: 'Ceny netto, stan na 28.09.2026, zgodnie z fastlanding.io. Oferty na rynki USA i Wielkiej Brytanii mają osobne ceny w USD i GBP — nie przeliczam ich.' },
    process: {
      h2: 'Cztery kroki, zero spotkań',
      steps: [
        { b: 'Brief (dzień 0)', t: 'Wypełniasz formularz online i wpłacasz 50% zaliczki. Rezerwujemy termin i analizujemy branżę oraz konkurencję.' },
        { b: 'Projekt (dni 1–7)', t: 'Dostajesz działający link i wideo z omówieniem zamiast PDF-ów z makietami.' },
        { b: 'Poprawki (dni 7–12)', t: 'Uwagi zgłaszasz mailem, wdrażamy je w 24–48 godzin. W cenie 2–3 rundy poprawek.' },
        { b: 'Start (dni 7–14)', t: 'Wdrażamy projekt: domena, analityka, SEO albo start bota. Dopiero teraz płacisz drugą połowę.' },
      ],
    },
    promises: {
      h2: 'Co jest w cenie',
      items: ['Gwarancja 30 dni na naprawę błędów', 'Kod źródłowy i prawa dla klienta, bez vendor lock-inu', 'Techniczne SEO: Core Web Vitals, dane strukturalne schema.org, mapa strony', 'Opcjonalne utrzymanie i hosting od 200 zł/mies.'],
    },
    cta: { h2: 'Wycena w 24 godziny', btn: 'Poproś o wycenę na fastlanding.io', alt: 'Zobacz portfolio' },
    crumb: 'FastLanding',
  },

  work: {
    title: 'Realizacje — strony wdrożone przez FastLanding | Kacper Rękawek',
    description: 'Trzy żywe strony klientów FastLanding: agencja nieruchomości Hello Home, firma instalacyjna Soleil Energia i willa wakacyjna Casa Flamingo. Plus moje własne produkty.',
    eyebrow: 'Realizacje',
    h1: 'Żywe strony, nie <em>makiety</em>.',
    lead: 'Poniżej publiczne strony klientów FastLanding — otwórz i poklikaj. Jeśli opisuję wyniki, robię to tylko za zgodą klienta.',
    clients: 'Klienci FastLanding',
    own: { h2: 'Moje własne produkty', items: 'Nie zlecenia, tylko firmy, które prowadzę sam.' },
    crumb: 'Realizacje',
  },

  about: {
    title: 'O mnie — Kacper Rękawek, założyciel OutreachPilot.pl i FastLanding.io',
    description: 'Kacper Rękawek: przedsiębiorca z Gliwic, założyciel OutreachPilot.pl i FastLanding.io. Fakty, produkty, dane firmy i rozróżnienie od innych osób o tym samym nazwisku.',
    eyebrow: 'O mnie',
    h1: 'Kacper <em>Rękawek</em>.',
    lead: 'Przedsiębiorca z Gliwic. Zakładam i prowadzę OutreachPilot.pl — narzędzie do cold mailingu B2B na polskich danych — oraz FastLanding.io — studio stron internetowych, chatbotów AI, automatyzacji i aplikacji MVP.',
    facts: {
      h2: 'Fakty',
      rows: [
        ['Imię i nazwisko', 'Kacper Rękawek (także: Kacper Rekawek, Kasper Rękawek)'],
        ['Rola', PERSON.jobTitle.pl],
        ['Miasto', 'Gliwice, Śląskie, Polska'],
        ['Działalność', `${PERSON.business.legalName} · NIP ${PERSON.business.nip} · REGON ${PERSON.business.regon}`],
        ['Produkt 1', 'OutreachPilot.pl — cold mailing B2B na polskich danych (CEIDG, Google Maps)'],
        ['Produkt 2', 'FastLanding.io — strony internetowe, chatboty AI, automatyzacje, aplikacje MVP'],
        ['Języki', 'polski, angielski'],
      ] as [string, string][],
    },
    disambig: { h2: 'Nie mylić z', p: PERSON.disambiguation.pl },
    notClaim: {
      h2: 'Czego nie twierdzę',
      items: [
        'Nie podaję tu tytułów, nagród ani wystąpień, których nie mogę wskazać źródłem.',
        'OutreachPilot nie gwarantuje zgodności kampanii z RODO ani Prawem komunikacji elektronicznej; ocena należy do nadawcy. To informacja o produkcie, nie porada prawna.',
        'Ceny i terminy FastLanding są takie, jak na fastlanding.io w dniu aktualizacji tej strony.',
      ],
    },
    find: { h2: 'Znajdź mnie', items: 'Profile i strony, które mnie opisują:' },
    crumb: 'O mnie',
  },

  contact: {
    title: 'Kontakt — Kacper Rękawek | OutreachPilot.pl i FastLanding.io',
    description: 'Napisz do Kacpra Rękawka, umów 30-minutową rozmowę z Justyną (Head of Sales) albo poproś o wycenę strony, chatbota lub aplikacji. Odpowiedź zwykle w 24 godziny.',
    eyebrow: 'Kontakt',
    h1: 'Powiedz, co <em>budujemy</em>.',
    lead: 'Formularz, mail albo rozmowa — wybierz, co Ci wygodniej.',
    emails: { h2: 'Wprost', studio: 'Strony, chatboty, aplikacje (FastLanding)', product: 'OutreachPilot' },
    call: { h2: 'Rozmowa sprzedażowa' },
    crumb: 'Kontakt',
  },

  privacy: {
    title: 'Polityka prywatności | kacper.biz',
    description: 'Jak kacper.biz przetwarza dane z formularza kontaktowego: administrator, cel, podstawa prawna, odbiorcy, czas przechowywania i Twoje prawa.',
    h1: 'Polityka prywatności',
    crumb: 'Polityka prywatności',
    sections: [
      { h: 'Administrator', p: [`Administratorem danych jest ${PERSON.business.legalName} (Kacper Rękawek), NIP ${PERSON.business.nip}, Gliwice, Polska. Kontakt: ${CONTACT.studioEmail}.`] },
      { h: 'Jakie dane i po co', p: ['Formularz kontaktowy: imię, adres e-mail, wybrany rodzaj potrzeby oraz — jeśli je podasz — adres strony firmy i treść wiadomości. Wykorzystuję je, aby odpowiedzieć na zapytanie i przygotować ofertę (art. 6 ust. 1 lit. b i f RODO).', 'Razem z formularzem zapisuję parametry źródła wizyty (UTM, język, strona, z której przyszedłeś), aby wiedzieć, który kanał przyniósł zapytanie (art. 6 ust. 1 lit. f RODO — prawnie uzasadniony interes).'] },
      { h: 'Cookies i analityka', p: ['Strona kacper.biz nie używa plików cookie, pikseli reklamowych ani zewnętrznej analityki. Parametry UTM są przechowywane wyłącznie w pamięci sesji Twojej przeglądarki (sessionStorage) i znikają po zamknięciu karty.', 'Fonty są hostowane na tej samej domenie — Twoja przeglądarka nie łączy się z serwerami fontów Google.'] },
      { h: 'Odbiorcy danych', p: ['Dane przetwarzają dostawcy niezbędni do działania strony: hosting (Vercel Inc.) oraz usługa wysyłki wiadomości e-mail, przez którą trafia do mnie zapytanie. Linki do outreachpilot.pl i fastlanding.io prowadzą do osobnych serwisów z własnymi politykami prywatności.'] },
      { h: 'Jak długo', p: ['Dane z zapytania przechowuję przez czas potrzebny na obsługę zapytania i ewentualną współpracę, a następnie nie dłużej niż 24 miesiące od ostatniego kontaktu, chyba że przepisy wymagają dłuższego okresu (np. dokumentacja rozliczeniowa).'] },
      { h: 'Twoje prawa', p: ['Masz prawo dostępu do danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia oraz sprzeciwu wobec przetwarzania opartego na prawnie uzasadnionym interesie. Napisz na adres z sekcji „Administrator”.', 'Masz też prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych.'] },
      { h: 'Dobrowolność', p: ['Podanie danych jest dobrowolne, ale bez imienia i adresu e-mail nie mogę odpowiedzieć na zapytanie.'] },
    ],
  },

  notFound: { title: 'Nie ma takiej strony | kacper.biz', h1: 'Tu nic nie <em>ma</em>.', p: 'Tej strony nie znalazłem. Wróć na stronę główną albo napisz, czego szukasz.', btn: 'Strona główna' },

  faq: [
    {
      q: 'Kim jest Kacper Rękawek?',
      a: 'Kacper Rękawek to przedsiębiorca z Gliwic, założyciel OutreachPilot.pl — narzędzia do cold mailingu B2B na polskich danych z CEIDG i Google Maps — oraz FastLanding.io, studia stron internetowych, chatbotów AI, automatyzacji i aplikacji MVP. To inna osoba niż dr Kacper Rękawek, badacz bezpieczeństwa międzynarodowego.',
    },
    {
      q: 'Czym jest OutreachPilot.pl?',
      a: 'OutreachPilot.pl to polskie narzędzie SaaS do cold outreachu B2B. Wpisujesz branżę i miasto, dostajesz firmy z Google Maps, PKT.pl i CEIDG, AI pisze sekwencję 3 maili po polsku, a wysyłka idzie z Twojej skrzynki (Gmail, Outlook lub SMTP). Plan Free kosztuje 0 zł, płatne plany od 99 do 799 zł miesięcznie.',
    },
    {
      q: 'Czym zajmuje się FastLanding.io?',
      a: `FastLanding.io to studio z Gliwic, które projektuje, pisze teksty i koduje: landing page (od 1 499 zł netto, 7 dni), strony firmowe z CMS (2 899 zł, 14 dni), chatboty AI (od 1 990 zł + 190 zł/mies.), automatyzacje AI (od 990 zł) i aplikacje MVP (od 9 990 zł). Stała cena, płatność 50/50, zero spotkań.`,
    },
    {
      q: 'Czy OutreachPilot.pl ma związek z outreachpilot.co, outreachpilot.ai lub useoutreachpilot.com?',
      a: 'Nie. OutreachPilot.pl to polski produkt Kacpra Rękawka z Gliwic (NIP 6312736932). Domeny outreachpilot.co, outreachpilot.ai i useoutreachpilot.com należą do innych, niepowiązanych podmiotów. Nazwę zapisuję zawsze jako „OutreachPilot.pl”.',
    },
    {
      q: 'Jak zamówić stronę lub chatbota?',
      a: 'Opisz projekt w formularzu na tej stronie albo na fastlanding.io. Konkretną wycenę i proponowany termin dostajesz mailem w 24 godziny w dni robocze. Po akceptacji wypełniasz brief i wpłacasz 50% zaliczki, a drugą połowę płacisz po wdrożeniu.',
    },
    {
      q: 'Jak umówić rozmowę sprzedażową?',
      a: `Rozmowy o OutreachPilot prowadzi ${SALES.firstName}, Head of Sales. Wybierz termin na stronie rezerwacji (${SALES.duration.pl}, online) albo zadzwoń pod ${CONTACT.aiPhone.display} — odbiera asystent AI, który na początku informuje, że jest AI, i umawia rozmowę.`,
    },
  ],
};

export type Copy = typeof pl;

const en: Copy = {
  ui: {
    skip: 'Skip to content',
    menu: 'Menu',
    write: 'Write to me',
    langSwitch: 'PL',
    langLabel: 'Ta strona po polsku',
    updated: 'Updated',
    home: 'Home',
    scroll: 'Scroll',
    readMore: 'Read more',
    visit: 'Open the site',
    footer: {
      tagline: 'Kacper Rękawek — founder of OutreachPilot.pl and FastLanding.io. Gliwice, Poland.',
      products: 'Products',
      site: 'On this site',
      contact: 'Contact & legal',
      privacy: 'Privacy policy',
      linkedin: 'LinkedIn',
      aiPhone: 'Phone (AI assistant 24/7)',
      fine: `© 2026 ${PERSON.business.legalName} · NIP ${PERSON.business.nip} · Gliwice, Poland`,
      disambig: 'Not to be confused with Dr Kacper Rękawek, an international-security researcher. OutreachPilot.pl is not affiliated with outreachpilot.co, outreachpilot.ai or useoutreachpilot.com.',
    },
  },

  home: {
    title: 'Kacper Rękawek — founder of OutreachPilot.pl and FastLanding.io',
    description: 'Kacper Rękawek from Gliwice, Poland builds products that bring in customers: OutreachPilot.pl (cold outreach on Polish data) and FastLanding.io (websites, AI chatbots, apps).',
    nameplate: 'Kacper Rękawek · Gliwice, Poland',
    h1: 'I build machines that win <em>customers</em>.',
    lead: "I'm the founder of <strong>OutreachPilot.pl</strong> — cold outreach on Polish company data — and <strong>FastLanding.io</strong> — websites, AI chatbots and apps in days, not months.",
    router: {
      op: { kicker: 'I need customers', name: 'OutreachPilot.pl', text: 'Businesses from CEIDG and Google Maps, campaigns in Polish, replies in one place.' },
      fl: { kicker: 'I need a site or a bot', name: 'FastLanding.io', text: 'Websites, AI chatbots and apps. Fixed price, zero meetings.' },
    },
    talk: `Book 30 minutes with ${SALES.firstName}`,
    origin: {
      eyebrow: '00 — Starting point',
      h2: 'From Gliwice to all of <em>Poland</em>.',
      p: 'I build products that do one thing: bring in customers. Every dot on the map is a company from the CEIDG registry or Google Maps — a prospect for someone with a good offer and no time to find them.',
      proofLabel: 'Numbers from my products',
    },
    op: {
      eyebrow: '01 — OutreachPilot.pl',
      h2: 'From industry and city to a <em>reply</em>.',
      lead: 'Type an industry and a city. In 1–2 minutes you have companies with email addresses. AI writes the campaign in Polish, mail goes out from your own mailbox, and when someone replies the sequence stops by itself.',
      steps: [
        { b: 'Live company data', t: 'Google Maps, PKT.pl, OpenStreetMap and the CEIDG registry. The “no website” filter shows companies whose listing has no site.' },
        { b: 'Campaigns in Polish', t: 'A 3-email sequence with correct Polish inflection of names and cities. AI never adds facts you did not give it.' },
        { b: 'Replies under control', t: 'IMAP every 15 minutes, AI classification (interested, question, refusal) and automatic sequence stop.' },
        { b: 'Connected to Claude and ChatGPT', t: 'An MCP server with 39 tools: leads, campaigns and inbox from your own AI assistant.' },
      ],
      cta: 'Create a free account',
      ctaAlt: 'See pricing',
      note: 'From PLN 0 forever, 14 days of Pro with no card. Prices in PLN. Polish-market product.',
      more: 'More about OutreachPilot',
    },
    fl: {
      eyebrow: '02 — FastLanding.io',
      h2: 'A site in 7 days. No <em>meetings</em>.',
      lead: 'FastLanding is my studio: we do design, copy and code ourselves. Fixed price, 50/50 payment, code and rights stay with the client. Speed (PageSpeed 95+) and technical SEO are included.',
      note: 'Net prices for the Polish offer as on fastlanding.io (as of 28 Sep 2026). US and UK offers have separate USD and GBP pricing on fastlanding.io/us and /uk.',
      cta: 'Free quote in 24 h',
      ctaAlt: 'See the offer',
      more: 'More about FastLanding',
    },
    bot: {
      eyebrow: '03 — FastBot',
      h2: 'A bot that answers while you <em>sleep</em>.',
      lead: 'FastBot knows your offer and pricing, answers customers in seconds at any hour, asks about budget and timing, and emails you the lead together with the chat transcript.',
      points: ['Live in 3–5 days', 'Works on any site, not only ones built by FastLanding', 'From PLN 1,990 net + PLN 190/mo (hosting and AI model)'],
      note: 'You can talk to FastBot on fastlanding.io — it is the same bot that does the selling.',
      cta: 'Meet FastBot',
    },
    work: {
      eyebrow: '04 — Work',
      h2: 'Live sites, not <em>mockups</em>.',
      lead: 'Client projects delivered by FastLanding. OutreachPilot.pl is different: it is my own product, not client work.',
      all: 'All projects',
    },
    rules: {
      eyebrow: '05 — How I work',
      h2: 'Four <em>rules</em>.',
      items: [
        { b: 'Fixed price and deadline', t: 'The price in the offer is the price on the invoice. The clock starts when all materials are in.' },
        { b: 'No meetings', t: 'Online brief, video walkthroughs instead of calls, feedback by email turned around in 24–48 hours.' },
        { b: 'The code is yours', t: 'Source files and rights pass to the client. Exception: the chatbot has a monthly fee covering hosting and the AI model.' },
        { b: 'I use what I sell', t: 'The OutreachPilot landing page was built at FastLanding, and I write the product content myself. I test on myself first.' },
      ],
    },
    talk2: {
      eyebrow: '06 — Talk',
      h2: 'Prefer to talk? <em>30 minutes.</em>',
      p: `${SALES.firstName}, Head of Sales at OutreachPilot, runs the sales conversations: a demo of OutreachPilot for your industry, plan selection or a custom quote. The call is ${SALES.duration.en}, online. OutreachPilot is a Polish-market product.`,
      cta: `Book a call with ${SALES.firstName}`,
      phoneTitle: 'Prefer the phone?',
      phone: `${CONTACT.aiPhone.display} — answered by an AI assistant (24/7, in Polish). It says it is an AI at the start of the call and books calls with the sales team.`,
    },
    faq: { eyebrow: '07 — Questions', h2: 'Short answers.' },
    contact: {
      eyebrow: '08 — Contact',
      h2: 'Tell me what we are <em>building</em>.',
      p: 'A few fields and done. I usually reply within 24 hours on business days.',
      direct: 'Prefer email?',
    },
    marquee: ['OutreachPilot.pl', 'FastLanding.io', 'Cold outreach', 'Sites in 7 days', 'AI chatbots', 'MCP server', 'Gliwice'],
  },

  op: {
    title: 'OutreachPilot.pl — cold outreach on Polish data | Kacper Rękawek',
    description: 'OutreachPilot.pl is my B2B cold-outreach tool for the Polish market: businesses from Google Maps, PKT.pl and CEIDG, AI campaigns in Polish, replies in one inbox. From PLN 0.',
    eyebrow: 'My product · OutreachPilot.pl',
    h1: 'Cold outreach on <em>Polish</em> data.',
    lead: 'OutreachPilot.pl is a Polish SaaS for B2B cold outreach. Type an industry and a city, AI writes a 3-email sequence in Polish, and mail goes out from your own mailbox.',
    what: {
      h2: 'What it is and who it is for',
      p1: 'OutreachPilot puts five stages into one flow that you would normally stitch together from three tools and a spreadsheet: company search, campaign, sending, reply inbox and statistics. It is built for Polish companies: CEIDG and Google Maps data, AI with correct Polish inflection, prices in złoty and support in Polish.',
      p2: 'It targets freelancers, small businesses and agencies that sell services to other companies in Poland. The product interface and campaigns are in Polish.',
    },
    forWho: {
      h2: 'Pages for specific industries',
      items: [
        ['Web agencies', 'https://outreachpilot.pl/dla-agencji-stron'],
        ['Marketing agencies', 'https://outreachpilot.pl/dla-agencji-marketingowych'],
        ['Software houses and IT', 'https://outreachpilot.pl/dla-software-house'],
        ['Accounting firms', 'https://outreachpilot.pl/dla-biur-rachunkowych'],
        ['Law firms', 'https://outreachpilot.pl/dla-kancelarii'],
        ['Construction companies', 'https://outreachpilot.pl/dla-firm-budowlanych'],
        ['Cleaning companies', 'https://outreachpilot.pl/dla-firm-sprzatajacych'],
      ],
    },
    plans: {
      h2: 'Plans',
      rows: [
        ['Free', 'PLN 0', '50 leads / month · 10 messages in total'],
        ['Starter', 'PLN 99 / mo', '250 leads / month · 100 emails a day'],
        ['Pro', 'PLN 199 / mo', '1,000 leads / month · 300 emails a day'],
        ['Business', 'PLN 399 / mo', '3,000 leads / month · 1,000 emails a day'],
        ['Agency', 'PLN 799 / mo', '6,000 leads / month · 2,000 emails a day'],
      ],
      note: 'Final prices in PLN (VAT-exempt, art. 113(1)), as of 28 Sep 2026. Every new account gets 14 days of Pro with no card. The current price list is always on outreachpilot.pl.',
    },
    proof: {
      h2: 'Data you can check',
      p: 'The published OutreachPilot benchmark covers 211 campaigns, 177 of them with sends, 20,418 emails in total; 42 campaigns had at least 50 emails sent. The data was frozen on 31 Aug 2026, and the report carries a non-representativeness disclaimer and a description of the method.',
      link: 'Read the methodology',
      mcp: 'The MCP server (39 tools, OAuth 2.1) lets you drive leads, campaigns and the inbox from Claude, and from ChatGPT through Custom GPT Actions.',
      mcpLink: 'How to connect an AI assistant',
    },
    legal: LEGAL_NOTE.en,
    disambig: {
      h2: 'Not to be confused with other “OutreachPilot” products',
      p: 'OutreachPilot.pl is a Polish product from Gliwice (Kacper Rękawek FastLanding, NIP 6312736932). The domains outreachpilot.co, outreachpilot.ai and useoutreachpilot.com belong to other, unrelated companies.',
    },
    cta: { h2: 'Start for free', btn: 'Create an account on outreachpilot.pl', alt: 'Book a call with Justyna' },
    crumb: 'OutreachPilot',
  },

  fl: {
    title: 'FastLanding.io — websites, AI chatbots and apps in days | Kacper Rękawek',
    description: 'FastLanding.io is my Gliwice studio: landing pages in 7 days, AI chatbots, automations and MVP apps. Fixed price, 50/50 payment, zero meetings. US and UK offers available.',
    eyebrow: 'My studio · FastLanding.io',
    h1: 'Sites and bots in <em>days</em>, not months.',
    lead: 'FastLanding.io is a Gliwice studio working remotely. We design, write the copy and code websites, AI chatbots, automations and MVP apps. Fixed price, 50/50 payment, code and rights go to the client.',
    offers: { h2: 'Offer and prices', note: 'Net prices for the Polish offer, as of 28 Sep 2026, as published on fastlanding.io. The US and UK offers have their own USD and GBP pricing — I do not convert between markets.' },
    process: {
      h2: 'Four steps, zero meetings',
      steps: [
        { b: 'Brief (day 0)', t: 'You fill in an online form and pay 50% upfront. We reserve the slot and study your industry and competitors.' },
        { b: 'Design (days 1–7)', t: 'You get a working link and a video walkthrough instead of PDF mockups.' },
        { b: 'Revisions (days 7–12)', t: 'You send feedback by email, we ship it in 24–48 hours. 2–3 revision rounds included.' },
        { b: 'Launch (days 7–14)', t: 'We deploy: domain, analytics, SEO or bot launch. Only now do you pay the second half.' },
      ],
    },
    promises: {
      h2: 'What is included',
      items: ['30-day bug-fix guarantee', 'Source code and rights for the client, no vendor lock-in', 'Technical SEO: Core Web Vitals, schema.org structured data, sitemap', 'Optional maintenance and hosting from PLN 200/mo'],
    },
    cta: { h2: 'A quote in 24 hours', btn: 'Request a quote on fastlanding.io', alt: 'See the portfolio' },
    crumb: 'FastLanding',
  },

  work: {
    title: 'Work — sites delivered by FastLanding | Kacper Rękawek',
    description: 'Three live client sites delivered by FastLanding: real-estate agency Hello Home, installer Soleil Energia and holiday villa Casa Flamingo. Plus my own products.',
    eyebrow: 'Work',
    h1: 'Live sites, not <em>mockups</em>.',
    lead: 'Below are public client sites delivered by FastLanding — open them and click around. If I describe results, I do it only with the client’s consent.',
    clients: 'FastLanding clients',
    own: { h2: 'My own products', items: 'Not client work — companies I run myself.' },
    crumb: 'Work',
  },

  about: {
    title: 'About — Kacper Rękawek, founder of OutreachPilot.pl and FastLanding.io',
    description: 'Kacper Rękawek: entrepreneur from Gliwice, Poland, founder of OutreachPilot.pl and FastLanding.io. Facts, products, company data and how to tell him apart from other people with the same name.',
    eyebrow: 'About',
    h1: 'Kacper <em>Rękawek</em>.',
    lead: 'Entrepreneur from Gliwice, Poland. I found and run OutreachPilot.pl — a B2B cold-outreach tool on Polish company data — and FastLanding.io — a studio for websites, AI chatbots, automations and MVP apps.',
    facts: {
      h2: 'Facts',
      rows: [
        ['Name', 'Kacper Rękawek (also written Kacper Rekawek, Kasper Rękawek)'],
        ['Role', PERSON.jobTitle.en],
        ['Location', 'Gliwice, Silesia, Poland'],
        ['Business', `${PERSON.business.legalName} · NIP ${PERSON.business.nip} · REGON ${PERSON.business.regon}`],
        ['Product 1', 'OutreachPilot.pl — B2B cold outreach on Polish data (CEIDG, Google Maps)'],
        ['Product 2', 'FastLanding.io — websites, AI chatbots, automations, MVP apps'],
        ['Languages', 'Polish, English'],
      ],
    },
    disambig: { h2: 'Not to be confused with', p: PERSON.disambiguation.en },
    notClaim: {
      h2: 'What I do not claim',
      items: [
        'I do not list titles, awards or talks here that I cannot back with a source.',
        'OutreachPilot does not guarantee GDPR or Polish electronic-communications-law compliance of campaigns; the sender assesses it. This is product information, not legal advice.',
        'FastLanding prices and lead times are those on fastlanding.io on the day this page was updated.',
      ],
    },
    find: { h2: 'Find me elsewhere', items: 'Profiles and pages that describe me:' },
    crumb: 'About',
  },

  contact: {
    title: 'Contact — Kacper Rękawek | OutreachPilot.pl and FastLanding.io',
    description: 'Write to Kacper Rękawek, book a 30-minute call with Justyna (Head of Sales) or ask for a quote for a website, chatbot or app. Usually a reply within 24 hours.',
    eyebrow: 'Contact',
    h1: 'Tell me what we are <em>building</em>.',
    lead: 'A form, an email or a call — whichever suits you.',
    emails: { h2: 'Directly', studio: 'Websites, chatbots, apps (FastLanding)', product: 'OutreachPilot' },
    call: { h2: 'Sales call' },
    crumb: 'Contact',
  },

  privacy: {
    title: 'Privacy policy | kacper.biz',
    description: 'How kacper.biz processes contact-form data: controller, purpose, legal basis, recipients, retention and your rights.',
    h1: 'Privacy policy',
    crumb: 'Privacy policy',
    sections: [
      { h: 'Controller', p: [`The data controller is ${PERSON.business.legalName} (Kacper Rękawek), NIP ${PERSON.business.nip}, Gliwice, Poland. Contact: ${CONTACT.studioEmail}.`] },
      { h: 'What data and why', p: ['Contact form: name, email address, the kind of need you selected and — if you provide them — your company website and message. I use them to reply to your enquiry and prepare an offer (Art. 6(1)(b) and (f) GDPR).', 'Together with the form I store visit-source parameters (UTM, language, the page you came from) to know which channel produced the enquiry (Art. 6(1)(f) GDPR — legitimate interest).'] },
      { h: 'Cookies and analytics', p: ['kacper.biz uses no cookies, advertising pixels or third-party analytics. UTM parameters are kept only in your browser’s session memory (sessionStorage) and disappear when you close the tab.', 'Fonts are self-hosted on this domain — your browser does not connect to Google Fonts servers.'] },
      { h: 'Recipients', p: ['Data is processed by providers needed to run the site: hosting (Vercel Inc.) and the email-delivery service through which your enquiry reaches me. Links to outreachpilot.pl and fastlanding.io lead to separate services with their own privacy policies.'] },
      { h: 'How long', p: ['I keep enquiry data for as long as needed to handle the enquiry and any cooperation, then no longer than 24 months after the last contact, unless the law requires a longer period (for example accounting records).'] },
      { h: 'Your rights', p: ['You have the right of access, rectification, erasure, restriction of processing, portability and the right to object to processing based on legitimate interest. Write to the address in the “Controller” section.', 'You may also lodge a complaint with the President of the Polish Personal Data Protection Office (UODO).'] },
      { h: 'Voluntary', p: ['Providing data is voluntary, but without a name and email address I cannot reply to your enquiry.'] },
    ],
  },

  notFound: { title: 'Page not found | kacper.biz', h1: 'Nothing <em>here</em>.', p: 'I could not find that page. Head back home or tell me what you were looking for.', btn: 'Home' },

  faq: [
    {
      q: 'Who is Kacper Rękawek?',
      a: 'Kacper Rękawek is an entrepreneur from Gliwice, Poland, founder of OutreachPilot.pl — a B2B cold-outreach tool built on Polish CEIDG and Google Maps data — and of FastLanding.io, a studio for websites, AI chatbots, automations and MVP apps. He is a different person from Dr Kacper Rękawek, an international-security researcher.',
    },
    {
      q: 'What is OutreachPilot.pl?',
      a: 'OutreachPilot.pl is a Polish SaaS for B2B cold outreach. You enter an industry and a city, get companies from Google Maps, PKT.pl and CEIDG, AI writes a 3-email sequence in Polish, and mail is sent from your own mailbox (Gmail, Outlook or SMTP). The Free plan costs PLN 0; paid plans run from PLN 99 to PLN 799 per month.',
    },
    {
      q: 'What does FastLanding.io do?',
      a: 'FastLanding.io is a Gliwice studio that designs, writes and codes: landing pages (from PLN 1,499 net, 7 days), business sites with CMS (PLN 2,899, 14 days), AI chatbots (from PLN 1,990 + PLN 190/mo), AI automations (from PLN 990) and MVP apps (from PLN 9,990). Fixed price, 50/50 payment, zero meetings.',
    },
    {
      q: 'Is OutreachPilot.pl related to outreachpilot.co, outreachpilot.ai or useoutreachpilot.com?',
      a: 'No. OutreachPilot.pl is a Polish product by Kacper Rękawek from Gliwice (NIP 6312736932). The domains outreachpilot.co, outreachpilot.ai and useoutreachpilot.com belong to other, unrelated companies. I always write the name as “OutreachPilot.pl”.',
    },
    {
      q: 'How do I order a website or a chatbot?',
      a: 'Describe the project in the form on this page or on fastlanding.io. You get a concrete quote and proposed start date by email within 24 hours on business days. After you accept, you fill in a brief and pay 50% upfront; the second half is due after launch.',
    },
    {
      q: 'How do I book a sales call?',
      a: `${SALES.firstName}, Head of Sales, runs the OutreachPilot conversations. Pick a slot on the booking page (${SALES.duration.en}, online) or call ${CONTACT.aiPhone.display} — an AI assistant answers, says at the start that it is an AI, and books the call.`,
    },
  ],
};

export const copy = { pl, en } as const;

/** Shared helpers so components stay dumb. */
export const offerLabel = (lang: 'pl' | 'en', o: (typeof FASTLANDING_OFFERS)[number]) => ({
  name: o.name[lang],
  price: lang === 'pl' ? o.price : o.priceEn,
  time: o.time[lang],
});

export const formatDate = (lang: 'pl' | 'en') =>
  new Date(SITE.lastModified).toLocaleDateString(lang === 'pl' ? 'pl-PL' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

export { PRODUCTS };
