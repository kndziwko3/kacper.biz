/**
 * All page copy, PL + EN. Rules: docs/art-direction.md ("Copy rules"). No em dashes; every number has a source.
 * Facts come from ./site.ts, ./ceidg.ts and the public pages of outreachpilot.pl / fastlanding.io (checked 2026-09-29).
 * Strings are passed through typoDeep() for Polish micro-typography (no-break spaces) at build time.
 */
import { typoDeep } from '../lib/typo';
import { BENCHMARK, CONTACT, PERSON, SALES, SITE, LEGAL_NOTE } from './site';

const pl = {
  ui: {
    skip: 'Przejdź do treści',
    menu: 'Menu',
    close: 'Zamknij',
    write: 'Napisz do mnie',
    langSwitch: 'EN',
    langLabel: 'Read this page in English',
    updated: 'Aktualizacja',
    home: 'Start',
    visit: 'Otwórz stronę',
    source: 'Źródło',
    example: 'Przykład',
    localTime: 'Czas w Gliwicach',
    place: 'Gliwice',
    coords: '50,29° N · 18,67° E',
    newTab: '(otwiera się w nowej karcie)',
    footer: {
      lead: 'Prowadzę OutreachPilot.pl i FastLanding.io z Gliwic.',
      products: 'Produkty',
      site: 'Na tej stronie',
      contact: 'Kontakt',
      privacy: 'Polityka prywatności',
      linkedin: 'LinkedIn',
      company: `${PERSON.business.legalName} · NIP ${PERSON.business.nip} · REGON ${PERSON.business.regon}`,
      disambig: 'OutreachPilot.pl nie jest powiązany z outreachpilot.co, outreachpilot.ai ani useoutreachpilot.com.',
    },
  },

  dir: {
    title: 'Kacper Rękawek',
    index: 'Spis',
    indexTitle: 'Spis treści',
    tabsLabel: 'Działy',
    book: 'Umów rozmowę',
    guide: { home: 'Wpis', three: 'Firmy bez www', lookup: 'Indeks branż', op: 'OutreachPilot.pl', fl: 'FastLanding.io', bot: 'FastBot', faq: 'Pytania', contact: 'Kontakt', work: 'Realizacje', about: 'O mnie', privacy: 'Polityka prywatności', notFound: 'Brak wpisu' },
    menuNotes: { '/outreachpilot': 'cold mailing', '/fastlanding': 'strony i chatboty', '/realizacje': 'strony klientów', '/o-mnie': 'fakty', '/kontakt': 'rozmowa i formularz' } as Record<string, string>,
    entry: {
      role: 'założyciel OutreachPilot.pl i FastLanding.io',
      place: 'Gliwice, woj. śląskie',
      phone: 'tel.',
      phoneNote: 'asystent AI, całą dobę',
      mail: 'e-mail',
      registerH: 'Rejestr CEIDG',
      registerTotal: 'aktywnych JDG w 30 branżach',
      registerSrc: 'CEIDG przez outreachpilot.pl/firmy, stan na 29 września 2026.',
      registerAll: 'Cały indeks branż',
      adOp: {
        h: 'Cold mailing do firm z CEIDG',
        bullets: ['Firmy z CEIDG, Google Maps i PKT.pl', 'AI pisze po polsku i odmienia imiona oraz miasta', 'Wysyłka z Twojej skrzynki, odpowiedzi w jednym miejscu'],
        price: '0 zł',
        priceNote: 'plan Free',
        cta: 'Załóż darmowe konto',
        more: 'Jak to działa',
      },
      adFl: {
        h: 'Landing page w 7 dni',
        bullets: ['Strona firmowa z CMS w 14 dni', 'Chatbot AI w 3–5 dni', 'Cena i termin wpisane do umowy'],
        price: '1 499 zł',
        priceNote: 'netto',
        cta: 'Poproś o wycenę',
        more: 'Cennik',
      },
      adCall: {
        h: 'Rozmowa 30 minut',
        who: 'Justyna Lajca, Head of Sales',
        text: 'Zakres, termin i cena strony albo pokaz OutreachPilot na Twojej branży.',
        cta: 'Wybierz termin',
      },
    },
    three: {
      ill: 'Ilustracja: 100 wpisów, z czego 3 z adresem strony, w proporcji z raportu. Nazwy firm są zakryte.',
      filterOn: 'Pokaż tylko wpisy bez www',
      filterOff: 'Pokaż wszystkie wpisy',
      filterNote: 'Filtr „bez www” w OutreachPilot robi to samo na prawdziwych danych z CEIDG.',
      www: 'www',
      tel: 'tel.',
    },
    lookup: { cat: 'Indeks branż', pickCity: 'Miasto', listLabel: 'Branże i liczba aktywnych JDG w całej Polsce' },
    op: { cat: 'OutreachPilot.pl', mapCap: 'Ilustracja: maile wychodzą z Twojej skrzynki do firm z listy, odpowiedzi wracają do Ciebie.', step: 'krok', of: 'z', bench: 'Wyniki kampanii użytkowników', rate: 'Plany', ctaH: 'Zacznij od planu Free', ctaP: 'Plan Free kosztuje 0 zł i nie ma limitu czasu. Każde nowe konto dostaje 14 dni planu Pro bez karty.' },
    fl: {
      cat: 'FastLanding.io',
      lead: 'W książce telefonicznej firma miała ramkę z numerem. Dziś jej ramką jest strona w internecie, a FastLanding robi ją w 7 dni.',
      proofs: 'Strony klientów',
      rate: 'Cennik',
      rateOnce: 'Jednorazowo',
    },
    bot: { cat: 'FastBot', hours: 'czynne pn–pt 8–16' },
    faq: { cat: 'Pytania' },
    contact: { cat: 'Kontakt', coupon: 'Zapytanie', calendar: 'Kalendarz Justyny' },
    colophon: {
      imprint: 'Wydawca',
      edition: 'Aktualizacja:',
      sources: 'Liczby: CEIDG przez outreachpilot.pl/firmy, raporty OutreachPilot, cennik fastlanding.io.',
      firms: 'Statystyki firm CEIDG',
    },
    notFound: { index: 'Spis działów' },
  },

  home: {
    title: 'Kacper Rękawek | założyciel OutreachPilot.pl i FastLanding.io',
    description: 'Kacper Rękawek z Gliwic, założyciel OutreachPilot.pl (cold mailing do firm z CEIDG i Google Maps) oraz FastLanding.io (strony, chatboty AI, SEO).',
    role: 'Założyciel OutreachPilot.pl i FastLanding.io',
    lead: '<strong>OutreachPilot.pl</strong> znajduje firmy w CEIDG i Google Maps i pisze do nich po polsku. <strong>FastLanding.io</strong> robi landing page w 7 dni i chatboty AI, które odpowiadają klientom także wieczorem.',
    index: [
      { name: 'OutreachPilot.pl', text: 'Cold mailing na danych z CEIDG', href: '#outreachpilot' },
      { name: 'FastLanding.io', text: 'Strony w 7–14 dni i chatboty AI', href: '#fastlanding' },
    ],

    thesis: {
      numeral: '3',
      of: 'na 100',
      h2: 'Tylko 3 na 100 mikrofirm podaje adres strony w swoim wpisie w CEIDG.',
      p: 'Część z pozostałych 97 ma stronę i nie wpisała jej do CEIDG. Jeśli sprzedajesz firmom strony, marketing albo inne usługi, wpisy bez adresu www to lista firm, do których możesz napisać jako pierwszy.',
      source: 'Raport OutreachPilot, próba 4 700 wpisów z CEIDG, stan na 7 lipca 2026. Liczy tylko adresy www wpisane w CEIDG.',
    },

    demo: {
      label: 'Dane z rejestru',
      h2: 'Sprawdź swój rynek w CEIDG.',
      p: 'Wybierz branżę i miasto. Liczby dotyczą aktywnych jednoosobowych działalności z publicznych statystyk OutreachPilot.',
      sector: 'Branża',
      city: 'Miasto',
      sectorCount: 'aktywnych JDG w tej branży w całej Polsce',
      cityCount: 'aktywnych JDG {in}, łącznie w 30 branżach',
      mailLabel: 'Pierwsze zdanie maila, z odmianą miasta',
      mail: 'Dzień dobry, Panie Tomaszu, widzę, że prowadzi Pan firmę {in}.',
      mailNote: 'Przykład odmiany. W OutreachPilot treść maila pisze AI na podstawie Twojej oferty.',
      cta: 'Zobacz tę branżę na outreachpilot.pl',
      all: 'Wszystkie 30 branż',
      tableSector: 'Branża',
      tablePkd: 'PKD',
      tableCount: 'Aktywne JDG',
      source: 'CEIDG przez outreachpilot.pl/firmy, stan na 29 września 2026. Łącznie 3 181 616 aktywnych JDG w 30 branżach usługowych.',
    },

    op: {
      label: 'OutreachPilot.pl',
      h2: 'Wpisujesz branżę i miasto, odpowiedzi czytasz w swojej skrzynce.',
      p: 'Lista firm z adresami e-mail jest gotowa po 1–2 minutach. AI pisze po polsku trzy maile, wysyłka idzie z Twojej skrzynki, a gdy ktoś odpisze, kolejne maile do tej osoby się zatrzymują.',
      steps: [
        {
          title: 'Lista firm',
          text: 'Google Maps, PKT.pl, OpenStreetMap i CEIDG przeszukiwane na żywo. Filtr „bez www” zawęża listę do wpisów bez adresu strony.',
          panel: { kind: 'query' as const, query: 'biura rachunkowe · Kraków', result: '50 firm', detail: '46 z adresem e-mail', note: 'Przykład z outreachpilot.pl' },
        },
        {
          title: 'Mail po polsku',
          text: 'AI odmienia imiona i miasta, pisze temat i dwa follow-upy. Nie dopisuje faktów spoza Twojej oferty.',
          panel: { kind: 'declension' as const, pairs: [['Tomasz', 'Panie Tomaszu'], ['Monika', 'Pani Moniko'], ['Bytom', 'z Bytomia'], ['Gliwice', 'w Gliwicach']] },
        },
        {
          title: 'Wysyłka z Twojej skrzynki',
          text: 'Gmail, Outlook albo dowolny SMTP. Losowe odstępy, dzienny limit i link do wypisu w każdym mailu.',
          panel: { kind: 'log' as const, rows: ['09:14', '09:21', '09:26', '09:38'], status: 'wysłano', limit: 'limit dzienny 184 / 300', note: 'Przykład z outreachpilot.pl' },
        },
        {
          title: 'Odpowiedzi',
          text: 'Skrzynka sprawdzana co 15 minut. AI oznacza każdą odpowiedź (zainteresowanie, pytanie, odmowa) i zatrzymuje sekwencję do tej osoby.',
          panel: { kind: 'replies' as const, rows: [['Tomasz L.', 'zainteresowanie', 'Brzmi ciekawie, może telefon w czwartek?'], ['Anna M.', 'pytanie', 'Proszę o więcej szczegółów i cennik.'], ['Biuro', 'odmowa', 'Dziękuję, obecnie nie korzystamy.']] },
        },
      ],
      benchmark: {
        h3: 'Wyniki kampanii użytkowników',
        stats: [['28,5%', 'otwarć'], ['1,7%', 'odpowiedzi'], ['0,8%', 'odbić']],
        note: '20 418 maili ze 177 kampanii, w których poszła wysyłka, dane z 31 sierpnia 2026. Próba nie jest reprezentatywna dla całego rynku, a metodę opisuje raport.',
        link: 'Metodologia',
      },
      plans: 'Plan Free kosztuje 0 zł i nie ma limitu czasu. Każde nowe konto dostaje 14 dni planu Pro bez karty. Płatne plany kosztują od 99 do 799 zł miesięcznie.',
      mcp: 'Serwer MCP z 39 narzędziami: leadami, kampaniami i skrzynką zarządzasz z Claude albo ChatGPT.',
      cta: 'Załóż darmowe konto',
      ctaAlt: 'Cennik',
      more: 'Więcej o OutreachPilot',
      legal: LEGAL_NOTE.pl,
    },

    fl: {
      label: 'FastLanding.io',
      h2: 'Landing page w 7 dni, strona firmowa w 14.',
      p: 'FastLanding to moje studio. Robimy projekt graficzny, teksty i kod pisany ręcznie, podpinamy domenę i analitykę. Połowę płacisz na start prac, resztę po uruchomieniu strony pod Twoją domeną.',
      showcase: {
        h3: 'Strony, które możesz otworzyć',
        note: 'Każdą opisuję tak, jak wygląda dziś. Wyników klientów nie podaję.',
        checked: 'sprawdzone',
        langs: 'Języki',
        own: 'Mój własny produkt. Landing zaprojektowany w FastLanding.',
        ownKind: 'Landing produktu SaaS',
      },
      prices: {
        h3: 'Cennik',
        recurring: 'SEO i widoczność w AI',
        note: 'Ceny netto z fastlanding.io, stan na 29 września 2026. Wycena jest bezpłatna i przychodzi w ciągu 24 godzin w dni robocze.',
      },
      clauses: {
        h3: 'Co wpisujemy do umowy',
        items: [
          'Kwota netto z oferty jest kwotą netto na fakturze.',
          'Data rozpoczęcia prac i oddania strony jest zapisana w umowie.',
          'Zaliczka 50% rezerwuje termin. Resztę płacisz po uruchomieniu strony.',
          'Po zapłacie całości przenosimy na Ciebie autorskie prawa majątkowe do projektu, kodu i tekstów.',
          'Przez 30 dni po uruchomieniu poprawiamy błędy bez dopłat.',
        ],
      },
      process: {
        h3: 'Jak to przebiega',
        steps: [
          ['Brief albo rozmowa', 'Krótki formularz online albo 30 minut rozmowy z Justyną.'],
          ['Wycena', 'Cena, zakres i data rozpoczęcia prac na piśmie, w ciągu 24 godzin w dni robocze.'],
          ['Pierwsza wersja', 'Działający link i nagranie wideo z omówieniem każdego ekranu.'],
          ['Poprawki', '2–3 rundy w cenie, każda wdrożona w 24–48 h.'],
          ['Uruchomienie', 'Domena, certyfikat SSL, analityka, SEO techniczne i pomiar PageSpeed.'],
        ],
      },
      ai: {
        h3: 'Widoczność w Google i w odpowiedziach AI',
        p: 'Sprawdzamy, jak Twoją firmę widzą Google, ChatGPT, Gemini i Perplexity, a potem poprawiamy stronę techniczną, treści i dane o firmie. Zmiany mierzymy w Google Search Console i Bing Webmaster Tools, raport dostajesz co miesiąc. Pozycji nie gwarantujemy. Tę stronę zrobiłem tak samo: dane strukturalne schema.org, llms.txt i facts.json.',
      },
      cta: 'Poproś o wycenę',
      ctaAlt: 'Umów rozmowę z Justyną',
      more: 'Więcej o FastLanding',
    },

    bot: {
      time: '22:14',
      label: 'FastBot',
      h2: 'Klient pyta o cenę o 22:14, a FastBot odpowiada od razu.',
      p: 'Bot zna Twoją ofertę i cennik, dopytuje o budżet i termin, a dane kontaktowe razem z całą rozmową wysyła na adres e-mail firmy. Wdrożenie to jedna linijka kodu na WordPressie, Wixie, Shopify albo stronie od innej agencji.',
      chat: {
        company: 'Kowalski Remonty',
        status: 'Asystent AI, online',
        day: 'Dziś, 22:14',
        q1: 'Dzień dobry, ile kosztuje remont łazienki? Łazienka ma ok. 5 m².',
        a1: 'Dobry wieczór! Według cennika remont łazienki do 6 m² kosztuje od 18 000 zł z robocizną. Na kiedy planuje Pan remont?',
        chips: ['W tym roku', 'Wiosną', 'Jeszcze nie wiem'],
        pick: 'Wiosną',
        a2: 'Zapisane. Proszę zostawić adres e-mail, a jutro rano odezwiemy się z terminem oględzin.',
        q2: 'marek.nowak@example.com',
        done: 'Kontakt i cała rozmowa są już w skrzynce firmy.',
        replay: 'Odtwórz jeszcze raz',
        note: 'Przykładowa rozmowa z fastlanding.io. Firma i klient są fikcyjni.',
      },
      price: 'Od 1 990 zł netto za wdrożenie plus 190 zł miesięcznie za hosting i model AI. Bot działa po 3–5 dniach.',
      cta: 'Porozmawiaj z FastBotem na fastlanding.io',
    },

    talk: {
      label: 'Kontakt',
      h2: 'Umów 30 minut albo napisz.',
      justyna: {
        role: 'Head of Sales',
        p: '30 minut online. Omawiasz z Justyną zakres, termin i cenę strony albo oglądasz pokaz OutreachPilot na przykładzie swojej branży. Rozmowa po polsku lub angielsku. Decyzję podejmujesz po rozmowie.',
        pick: 'Wybierz dzień',
        full: 'Pełny kalendarz',
      },
      write: {
        h3: 'Albo napisz do mnie',
        p: 'Dwa zdania wystarczą. Odpowiadam w ciągu 24 godzin w dni robocze.',
      },
      phone: `${CONTACT.aiPhone.display} odbiera asystent AI, po polsku, całą dobę. Na początku rozmowy mówi, że jest AI, i umawia rozmowę z zespołem.`,
      emails: { studio: 'Strony, chatboty, SEO', product: 'OutreachPilot' },
    },

    faq: { label: 'Pytania', h2: 'Pytania o mnie, OutreachPilot i FastLanding' },
  },

  op: {
    title: 'OutreachPilot.pl: cold mailing do firm z CEIDG | Kacper Rękawek',
    description: 'OutreachPilot.pl to moje narzędzie do cold mailingu B2B: firmy z CEIDG i Google Maps, maile po polsku pisane przez AI, wysyłka z Twojej skrzynki. Od 0 zł.',
    kicker: 'OutreachPilot.pl · mój produkt',
    h1: 'Cold mailing do firm z CEIDG i Google Maps.',
    lead: 'Polskie narzędzie SaaS do cold mailingu B2B. Wpisujesz branżę i miasto, AI pisze po polsku sekwencję trzech maili, a wysyłka idzie z Twojej własnej skrzynki.',
    what: {
      h2: 'Co to jest i dla kogo',
      p1: 'OutreachPilot łączy w jednym panelu pięć etapów: wyszukiwanie firm, kampanię, wysyłkę, skrzynkę odpowiedzi i statystyki. Dane pochodzą z CEIDG, Google Maps, PKT.pl i OpenStreetMap, a AI pisze z poprawną polską odmianą.',
      p2: `Jest zrobiony dla freelancerów, małych firm i agencji, które sprzedają usługi innym firmom w Polsce. Do 31 sierpnia 2026 użytkownicy uruchomili w nim ${BENCHMARK.campaignsTotal} kampanii. Interfejs i kampanie są po polsku, ceny w złotówkach.`,
    },
    forWho: {
      h2: 'Podstrony dla konkretnych branż',
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
        ['Free', '0 zł', '50 leadów miesięcznie, 10 wiadomości łącznie'],
        ['Starter', '99 zł/mies.', '250 leadów miesięcznie, 100 maili dziennie'],
        ['Pro', '199 zł/mies.', '1 000 leadów miesięcznie, 300 maili dziennie'],
        ['Business', '399 zł/mies.', '3 000 leadów miesięcznie, 1 000 maili dziennie'],
        ['Agencja', '799 zł/mies.', '6 000 leadów miesięcznie, 2 000 maili dziennie'],
      ] as [string, string, string][],
      note: 'Ceny końcowe w zł (zwolnienie z VAT, art. 113 ust. 1 ustawy o VAT), stan na 29 września 2026. Każde nowe konto dostaje 14 dni planu Pro bez karty. Aktualny cennik jest zawsze na outreachpilot.pl.',
    },
    mcp: {
      h2: 'Obsługa z Claude i ChatGPT przez MCP',
      p: 'Serwer MCP z 39 narzędziami (OAuth 2.1) pozwala zarządzać leadami, kampaniami i skrzynką odpowiedzi z Claude, a przez Custom GPT Actions także z ChatGPT.',
      link: 'Jak podłączyć',
    },
    disambig: {
      h2: 'Nie mylić z innymi serwisami o tej nazwie',
      p: `OutreachPilot.pl to polski produkt z Gliwic (${PERSON.business.legalName}, NIP ${PERSON.business.nip}). Domeny outreachpilot.co, outreachpilot.ai i useoutreachpilot.com należą do innych, niepowiązanych firm.`,
    },
    cta: { h2: 'Zacznij od planu Free.', btn: 'Załóż darmowe konto', alt: 'Umów pokaz z Justyną' },
    crumb: 'OutreachPilot',
  },

  fl: {
    title: 'FastLanding.io: strony w 7–14 dni, chatboty AI | Kacper Rękawek',
    description: 'FastLanding.io to moje studio z Gliwic: landing page za 1 499 zł netto w 7 dni, strona firmowa w 14, chatboty AI, automatyzacje i widoczność w wyszukiwarkach AI.',
    kicker: 'FastLanding.io · moje studio',
    h1: 'Strona w 7–14 dni, chatbot w 3–5. Termin jest w umowie.',
    lead: 'Studio z Gliwic, które pracuje zdalnie z firmami z całej Polski. Projekt graficzny, teksty i kod pisany ręcznie za stałą cenę.',
    usUk: 'Oferty na rynek amerykański i brytyjski mają osobne ceny w USD i GBP.',
    cta: { h2: 'Wycena przychodzi mailem w ciągu 24 godzin w dni robocze.', btn: 'Poproś o wycenę na fastlanding.io', alt: 'Umów rozmowę z Justyną' },
    crumb: 'FastLanding',
  },

  work: {
    title: 'Realizacje FastLanding: strony klientów | Kacper Rękawek',
    description: 'Strony klientów FastLanding, które możesz otworzyć: gabinet Stomatologia Mikroskopowa, agencja nieruchomości Hello Home i willa wakacyjna Casa Flamingo.',
    kicker: 'Realizacje',
    h1: 'Strony klientów, które możesz otworzyć.',
    lead: 'Każdą opisuję tak, jak wygląda dziś. Wyników klientów nie podaję. Zrzuty ekranu pochodzą z portfolio FastLanding.',
    onPage: 'Na stronie',
    type: 'Typ',
    industry: 'Branża',
    langs: 'Języki',
    checked: 'Sprawdzone',
    features: {
      stomatologia: ['Pierwszy ekran i lekarz przy mikroskopie', 'Siedem usług gabinetu', 'Lekarz, sprzęt i FAQ', 'Kontakt i godziny przyjęć'],
      hellohome: ['Pierwszy ekran i partnerzy', 'O agencji z licencją RAICV', 'Kategorie nieruchomości', 'Jak kupić w Hiszpanii'],
      casaflamingo: ['Pierwszy ekran i dane willi', 'Galeria willi', 'Wyposażenie', 'Sekcja z filmem'],
    } as Record<string, string[]>,
    own: { h2: 'Moje własne produkty', p: 'Sprzedaż w obu prowadzi Justyna Lajca, Head of Sales.' },
    crumb: 'Realizacje',
  },

  about: {
    title: 'O mnie | Kacper Rękawek, OutreachPilot.pl i FastLanding.io',
    description: 'Kacper Rękawek, przedsiębiorca z Gliwic, założyciel OutreachPilot.pl i FastLanding.io. Czym się zajmuje, dane firmy i profile, które potwierdzają jego tożsamość.',
    kicker: 'O mnie',
    h1: 'Kacper Rękawek',
    lead: 'Jestem przedsiębiorcą z Gliwic. Prowadzę OutreachPilot.pl, narzędzie do cold mailingu B2B na polskich danych, i FastLanding.io, studio stron, chatbotów AI i aplikacji.',
    body: [
      'W OutreachPilot sam piszę poradniki, słownik i raporty na danych z CEIDG. Na pytania klientów też odpowiadam osobiście, po polsku.',
      'W FastLanding projektujemy i piszemy kod ręcznie, bez kreatorów i wtyczek. Przed oddaniem mierzymy każdą stronę w PageSpeed, a naszym standardem jest wynik 95+.',
      'Rozmowy sprzedażowe w OutreachPilot i FastLanding prowadzi Justyna Lajca, Head of Sales. Ja zajmuję się produktem i realizacją.',
    ],
    facts: {
      h2: 'Fakty',
      rows: [
        ['Imię i nazwisko', 'Kacper Rękawek (także Kacper Rekawek, Kasper Rękawek)'],
        ['Rola', PERSON.jobTitle.pl],
        ['Miasto', 'Gliwice, województwo śląskie'],
        ['Działalność', `${PERSON.business.legalName}, NIP ${PERSON.business.nip}, REGON ${PERSON.business.regon}`],
        ['Języki', 'polski, angielski'],
      ] as [string, string][],
    },
    disambig: { h2: 'Inna osoba o tym samym imieniu i nazwisku', p: PERSON.disambiguation.pl },
    find: { h2: 'Gdzie jeszcze mnie znajdziesz' },
    crumb: 'O mnie',
  },

  contact: {
    title: 'Kontakt | Kacper Rękawek, OutreachPilot.pl i FastLanding.io',
    description: 'Umów 30 minut z Justyną Lajcą (Head of Sales) albo napisz. Wycena strony, chatbota lub pokaz OutreachPilot. Odpowiedź w ciągu 24 godzin w dni robocze.',
    kicker: 'Kontakt',
    h1: 'Umów rozmowę albo napisz.',
    lead: 'Rozmowę z Justyną umówisz w kalendarzu. Na formularz i maile odpowiadam w ciągu 24 godzin w dni robocze.',
    crumb: 'Kontakt',
  },

  privacy: {
    title: 'Polityka prywatności | kacper.biz',
    description: 'Jak kacper.biz przetwarza dane z formularza kontaktowego: administrator, cel, podstawa prawna, odbiorcy, czas przechowywania i Twoje prawa.',
    h1: 'Polityka prywatności',
    crumb: 'Polityka prywatności',
    sections: [
      { h: 'Administrator', p: [`Administratorem danych jest ${PERSON.business.legalName} (Kacper Rękawek), NIP ${PERSON.business.nip}, Gliwice. Kontakt: ${CONTACT.studioEmail}.`] },
      { h: 'Jakie dane i po co', p: ['Formularz kontaktowy: imię, adres e-mail, wybrany rodzaj potrzeby oraz, jeśli je podasz, adres strony firmy i treść wiadomości. Używam ich, aby odpowiedzieć na zapytanie i przygotować ofertę (art. 6 ust. 1 lit. b i f RODO).', 'Razem z formularzem zapisuję parametry źródła wizyty (UTM, język, strona odsyłająca), aby wiedzieć, który kanał przyniósł zapytanie (art. 6 ust. 1 lit. f RODO, prawnie uzasadniony interes).'] },
      { h: 'Cookies i analityka', p: ['Strona kacper.biz nie używa plików cookie, pikseli reklamowych ani zewnętrznej analityki. Parametry UTM są przechowywane tylko w pamięci sesji Twojej przeglądarki (sessionStorage, klucz „kb_attr”), znikają po zamknięciu karty i trafiają do mnie tylko wtedy, gdy wyślesz formularz.', 'Czcionki ładują się z tej samej domeny, więc przeglądarka nie łączy się z serwerami Google Fonts.'] },
      { h: 'Odbiorcy danych', p: ['Dane przetwarzają dostawcy potrzebni do działania strony: hosting (Vercel Inc.) i usługa wysyłki poczty e-mail (obecnie Resend), przez którą trafia do mnie zapytanie. Linki do outreachpilot.pl, fastlanding.io i kalendarza Calendly prowadzą do osobnych serwisów z własnymi politykami prywatności.'] },
      { h: 'Jak długo', p: ['Dane z zapytania przechowuję przez czas potrzebny do jego obsługi i ewentualnej współpracy, a potem nie dłużej niż 24 miesiące od ostatniego kontaktu, chyba że przepisy wymagają dłuższego okresu (na przykład dokumentacja rozliczeniowa).'] },
      { h: 'Twoje prawa', p: ['Masz prawo dostępu do danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia oraz sprzeciwu wobec przetwarzania opartego na prawnie uzasadnionym interesie. Napisz na adres z sekcji „Administrator”.', 'Możesz też złożyć skargę do Prezesa Urzędu Ochrony Danych Osobowych.'] },
      { h: 'Dobrowolność', p: ['Podanie danych jest dobrowolne, ale bez imienia i adresu e-mail nie mogę odpowiedzieć na zapytanie.'] },
    ],
  },

  notFound: {
    title: 'Nie ma takiej strony | kacper.biz',
    h1: 'Tej strony nie ma na mapie.',
    p: 'Adres mógł się zmienić. Wróć na start albo napisz, czego szukasz.',
    btn: 'Wróć na start',
  },

  faq: [
    {
      q: 'Kim jest Kacper Rękawek?',
      a: 'Kacper Rękawek to przedsiębiorca z Gliwic. Założył i prowadzi OutreachPilot.pl, narzędzie do cold mailingu B2B na danych z CEIDG i Google Maps, oraz FastLanding.io, studio stron internetowych, chatbotów AI i aplikacji. To inna osoba niż Kacper Rękawek, badacz bezpieczeństwa międzynarodowego.',
    },
    {
      q: 'Czym jest OutreachPilot.pl?',
      a: 'OutreachPilot.pl to polskie narzędzie SaaS do cold mailingu B2B. Wpisujesz branżę i miasto, dostajesz firmy z Google Maps, PKT.pl i CEIDG, AI pisze sekwencję trzech maili po polsku, a wysyłka idzie z Twojej skrzynki (Gmail, Outlook albo SMTP). Plan Free kosztuje 0 zł, płatne plany od 99 do 799 zł miesięcznie, a każde nowe konto dostaje 14 dni planu Pro bez karty.',
    },
    {
      q: 'Ile kosztuje strona w FastLanding.io?',
      a: 'Landing page kosztuje 1 499 zł netto i powstaje w 7 dni, strona firmowa z panelem CMS 2 899 zł netto w 14 dni. Chatbot AI kosztuje od 1 990 zł netto plus 190 zł miesięcznie, automatyzacja od 990 zł netto, aplikacja MVP od 9 990 zł netto. Płatność dzielimy 50/50: połowa na start prac, połowa po uruchomieniu.',
    },
    {
      q: 'Czy muszę się spotykać albo dzwonić?',
      a: `Nie musisz, ale możesz. Domyślnie wszystko dzieje się online: brief, link do pierwszej wersji z nagraniem wideo i uwagi mailem. Jeśli wolisz rozmowę, ${SALES.fullName}, Head of Sales, umówi Cię na 30 minut w terminie wybranym w kalendarzu.`,
    },
    {
      q: 'Czy OutreachPilot.pl ma związek z outreachpilot.co, outreachpilot.ai albo useoutreachpilot.com?',
      a: `Nie. OutreachPilot.pl to polski produkt Kacpra Rękawka z Gliwic (NIP ${PERSON.business.nip}). Domeny outreachpilot.co, outreachpilot.ai i useoutreachpilot.com należą do innych, niepowiązanych firm.`,
    },
    {
      q: 'Skąd pochodzą liczby na tej stronie?',
      a: 'Z publicznych stron OutreachPilot.pl: statystyk CEIDG z 29 września 2026 (outreachpilot.pl/firmy), raportu o stronach www mikrofirm (próba 4 700 wpisów, 7 lipca 2026) i benchmarku kampanii (20 418 maili, dane z 31 sierpnia 2026). Ceny FastLanding pochodzą z fastlanding.io. Liczby o rynku i wynikach podaję ze źródłem i datą.',
    },
  ],
};

export type Copy = typeof pl;

const en: Copy = {
  ui: {
    skip: 'Skip to content',
    menu: 'Menu',
    close: 'Close',
    write: 'Write to me',
    langSwitch: 'PL',
    langLabel: 'Ta strona po polsku',
    updated: 'Updated',
    home: 'Home',
    visit: 'Open the site',
    source: 'Source',
    example: 'Example',
    localTime: 'Time in Gliwice',
    place: 'Gliwice',
    coords: '50.29° N · 18.67° E',
    newTab: '(opens in a new tab)',
    footer: {
      lead: 'I run OutreachPilot.pl and FastLanding.io from Gliwice.',
      products: 'Products',
      site: 'On this site',
      contact: 'Contact',
      privacy: 'Privacy policy',
      linkedin: 'LinkedIn',
      company: `${PERSON.business.legalName} · NIP ${PERSON.business.nip} · REGON ${PERSON.business.regon}`,
      disambig: 'OutreachPilot.pl is not affiliated with outreachpilot.co, outreachpilot.ai or useoutreachpilot.com.',
    },
  },

  dir: {
    title: 'Kacper Rękawek',
    index: 'Index',
    indexTitle: 'Contents',
    tabsLabel: 'Sections',
    book: 'Book a call',
    guide: { home: 'Entry', three: 'Firms without a website', lookup: 'Index of sectors', op: 'OutreachPilot.pl', fl: 'FastLanding.io', bot: 'FastBot', faq: 'Questions', contact: 'Contact', work: 'Work', about: 'About', privacy: 'Privacy policy', notFound: 'No entry' },
    menuNotes: { '/en/outreachpilot': 'cold outreach', '/en/fastlanding': 'websites and chatbots', '/en/work': 'client sites', '/en/about': 'facts', '/en/contact': 'call and form' } as Record<string, string>,
    entry: {
      role: 'founder of OutreachPilot.pl and FastLanding.io',
      place: 'Gliwice, Silesia, Poland',
      phone: 'tel.',
      phoneNote: 'AI assistant, around the clock, in Polish',
      mail: 'email',
      registerH: 'CEIDG register',
      registerTotal: 'active sole proprietorships in 30 sectors',
      registerSrc: 'CEIDG via outreachpilot.pl/firmy, as of 29 September 2026.',
      registerAll: 'Full index of sectors',
      adOp: {
        h: 'Cold email to Polish companies',
        bullets: ['Companies from CEIDG, Google Maps and PKT.pl', 'The AI writes in Polish, with names and cities in the right case', 'Sent from your own mailbox, replies in one place'],
        price: 'PLN 0',
        priceNote: 'Free plan',
        cta: 'Create a free account',
        more: 'How it works',
      },
      adFl: {
        h: 'A landing page in 7 days',
        bullets: ['Business site with a CMS in 14 days', 'AI chatbot in 3–5 days', 'Price and deadline written into the contract'],
        price: 'PLN 1,499',
        priceNote: 'net',
        cta: 'Request a quote',
        more: 'Pricing',
      },
      adCall: {
        h: '30-minute call',
        who: 'Justyna Lajca, Head of Sales',
        text: 'Scope, timing and price of a website, or an OutreachPilot demo on your sector.',
        cta: 'Pick a time',
      },
    },
    three: {
      ill: 'Illustration: 100 entries, 3 of them with a website address, in the report’s proportion. Company names are masked.',
      filterOn: 'Show only entries without a website',
      filterOff: 'Show all entries',
      filterNote: 'OutreachPilot’s “no website” filter does the same on real CEIDG data.',
      www: 'www',
      tel: 'tel.',
    },
    lookup: { cat: 'Index of sectors', pickCity: 'City', listLabel: 'Sectors and active sole proprietorships across Poland' },
    op: { cat: 'OutreachPilot.pl', mapCap: 'Illustration: emails leave your own mailbox for the companies on your list, replies come back to you.', step: 'step', of: 'of', bench: 'Results from user campaigns', rate: 'Plans', ctaH: 'Start with the Free plan', ctaP: 'The Free plan costs PLN 0 and has no time limit. Every new account gets 14 days of Pro with no card.' },
    fl: {
      cat: 'FastLanding.io',
      lead: 'In the phone book a business had a boxed ad with its number. Today its box is a website, and FastLanding builds one in 7 days.',
      proofs: 'Client sites',
      rate: 'Pricing',
      rateOnce: 'One-off',
    },
    bot: { cat: 'FastBot', hours: 'open Mon–Fri 8–16' },
    faq: { cat: 'Questions' },
    contact: { cat: 'Contact', coupon: 'Enquiry', calendar: 'Justyna’s calendar' },
    colophon: {
      imprint: 'Publisher',
      edition: 'Updated:',
      sources: 'Numbers: CEIDG via outreachpilot.pl/firmy, OutreachPilot reports, fastlanding.io pricing.',
      firms: 'CEIDG company statistics',
    },
    notFound: { index: 'Sections' },
  },

  home: {
    title: 'Kacper Rękawek | founder of OutreachPilot.pl and FastLanding.io',
    description: 'Kacper Rękawek, from Gliwice, Poland, founder of OutreachPilot.pl (cold outreach on Polish company data) and FastLanding.io (websites, AI chatbots).',
    role: 'Founder of OutreachPilot.pl and FastLanding.io',
    lead: '<strong>OutreachPilot.pl</strong> finds businesses in the CEIDG registry and Google Maps and writes to them in Polish. <strong>FastLanding.io</strong> builds landing pages in 7 days and AI chatbots that answer customers after hours.',
    index: [
      { name: 'OutreachPilot.pl', text: 'Cold outreach on CEIDG data', href: '#outreachpilot' },
      { name: 'FastLanding.io', text: 'Websites in 7–14 days and AI chatbots', href: '#fastlanding' },
    ],

    thesis: {
      numeral: '3',
      of: 'in 100',
      h2: 'Only 3 in 100 Polish micro-businesses list a website in their CEIDG registry entry.',
      p: 'Some of the other 97 have a site and never listed it. If you sell websites, marketing or other services to businesses, entries without a website address are a list of prospects you can contact first.',
      source: 'OutreachPilot report, sample of 4,700 CEIDG entries, 7 July 2026. It counts only website addresses entered in CEIDG.',
    },

    demo: {
      label: 'Registry data',
      h2: 'Check your market in CEIDG.',
      p: 'Pick a sector and a city. The figures count active sole proprietorships, from OutreachPilot’s public statistics of the Polish business registry.',
      sector: 'Sector',
      city: 'City',
      sectorCount: 'active sole proprietorships in this sector across Poland',
      cityCount: 'active sole proprietorships in {name}, all 30 sectors combined',
      mailLabel: 'First line of an email, with the city inflected (Polish)',
      mail: 'Dzień dobry, Panie Tomaszu, widzę, że prowadzi Pan firmę {in}.',
      mailNote: 'An inflection example. In OutreachPilot the email itself is written by AI from your offer.',
      cta: 'See this sector on outreachpilot.pl',
      all: 'All 30 sectors',
      tableSector: 'Sector',
      tablePkd: 'PKD',
      tableCount: 'Active sole proprietorships',
      source: 'CEIDG via outreachpilot.pl/firmy, as of 29 September 2026. 3,181,616 active sole proprietorships across 30 service sectors.',
    },

    op: {
      label: 'OutreachPilot.pl',
      h2: 'You enter a sector and a city. You read the replies in your own inbox.',
      p: 'The list of companies with email addresses is ready in 1–2 minutes. The AI writes three emails in Polish, they go out from your own mailbox, and when someone replies, the follow-ups to that person stop.',
      steps: [
        {
          title: 'A list of companies',
          text: 'Google Maps, PKT.pl, OpenStreetMap and CEIDG searched live. The “no website” filter narrows the list to entries without a website address.',
          panel: { kind: 'query' as const, query: 'biura rachunkowe · Kraków', result: '50 companies', detail: '46 with an email address', note: 'Example from outreachpilot.pl' },
        },
        {
          title: 'Email in proper Polish',
          text: 'The AI inflects first names and cities and writes the subject and two follow-ups. It adds no facts beyond your offer.',
          panel: { kind: 'declension' as const, pairs: [['Tomasz', 'Panie Tomaszu'], ['Monika', 'Pani Moniko'], ['Bytom', 'z Bytomia'], ['Gliwice', 'w Gliwicach']] },
        },
        {
          title: 'Sent from your mailbox',
          text: 'Gmail, Outlook or any SMTP. Random intervals, a daily limit and an unsubscribe link in every email.',
          panel: { kind: 'log' as const, rows: ['09:14', '09:21', '09:26', '09:38'], status: 'sent', limit: 'daily limit 184 / 300', note: 'Example from outreachpilot.pl' },
        },
        {
          title: 'Replies',
          text: 'The inbox is checked every 15 minutes. The AI labels each reply (interested, question, declined) and stops the sequence to that person.',
          panel: { kind: 'replies' as const, rows: [['Tomasz L.', 'interested', 'Sounds interesting, a call on Thursday?'], ['Anna M.', 'question', 'Please send more details and pricing.'], ['Office', 'declined', 'Thank you, not at the moment.']] },
        },
      ],
      benchmark: {
        h3: 'Results from user campaigns',
        stats: [['28.5%', 'opens'], ['1.7%', 'replies'], ['0.8%', 'bounces']],
        note: '20,418 emails from 177 campaigns that sent email, data as of 31 August 2026. The sample does not represent the whole market; the report describes the method.',
        link: 'Methodology',
      },
      plans: 'The Free plan costs PLN 0 and has no time limit. Every new account gets 14 days of Pro with no card. Paid plans cost PLN 99 to 799 a month.',
      mcp: 'An MCP server with 39 tools: manage leads, campaigns and the inbox from Claude or ChatGPT.',
      cta: 'Create a free account',
      ctaAlt: 'Pricing',
      more: 'More about OutreachPilot',
      legal: LEGAL_NOTE.en,
    },

    fl: {
      label: 'FastLanding.io',
      h2: 'A landing page in 7 days, a business site in 14.',
      p: 'FastLanding is my studio. We do the design, the copy and hand-written code, and connect the domain and analytics. You pay half when work starts and the rest once the site is live on your domain.',
      showcase: {
        h3: 'Sites you can open',
        note: 'Described as they look today. No client results are quoted.',
        checked: 'checked',
        langs: 'Languages',
        own: 'My own product. Landing page by FastLanding.',
        ownKind: 'SaaS product landing page',
      },
      prices: {
        h3: 'Pricing',
        recurring: 'SEO and AI visibility',
        note: 'Net prices for the Polish offer on fastlanding.io, as of 29 September 2026. Quotes are free and arrive within 24 hours on working days.',
      },
      clauses: {
        h3: 'What goes into the contract',
        items: [
          'The net amount in the quote is the net amount on the invoice.',
          'The start and delivery dates are written into the contract.',
          'A 50% deposit books the slot. You pay the rest after launch.',
          'After full payment we assign to you the copyright in the design, code and copy.',
          'For 30 days after launch we fix bugs at no extra cost.',
        ],
      },
      process: {
        h3: 'How it runs',
        steps: [
          ['Brief or a call', 'A short online form or 30 minutes with Justyna.'],
          ['Quote', 'Price, scope and start date in writing, within 24 hours on working days.'],
          ['First version', 'A working link and a video walking through every screen.'],
          ['Revisions', '2–3 rounds included, each shipped in 24–48 h.'],
          ['Launch', 'Domain, SSL, analytics, technical SEO and a PageSpeed check.'],
        ],
      },
      ai: {
        h3: 'Visibility in Google and in AI answers',
        p: 'We check how Google, ChatGPT, Gemini and Perplexity see your company, then fix the technical side, the content and the company data. Changes are measured in Google Search Console and Bing Webmaster Tools, and you get a report every month. We do not guarantee rankings. I built this site the same way: schema.org structured data, llms.txt and facts.json.',
      },
      cta: 'Request a quote',
      ctaAlt: 'Book a call with Justyna',
      more: 'More about FastLanding',
    },

    bot: {
      time: '22:14',
      label: 'FastBot',
      h2: 'A customer asks for a price at 22:14, and FastBot answers right away.',
      p: 'The bot knows your offer and prices, asks about budget and timing, and emails the lead, with the whole conversation, to your business address. It installs with one line of code on WordPress, Wix, Shopify or a site built by another agency.',
      chat: {
        company: 'Kowalski Remonty',
        status: 'AI assistant, online',
        day: 'Today, 22:14',
        q1: 'Hello, how much does a bathroom renovation cost? The bathroom is about 5 m².',
        a1: 'Good evening! According to the price list, a bathroom up to 6 m² starts at PLN 18,000 including labour. When are you planning the work?',
        chips: ['This year', 'In spring', 'Not sure yet'],
        pick: 'In spring',
        a2: 'Noted. Leave your email and we will get back to you tomorrow morning with a date for a site visit.',
        q2: 'marek.nowak@example.com',
        done: 'The contact and the whole conversation are already in the company’s inbox.',
        replay: 'Play again',
        note: 'Example conversation from fastlanding.io, translated. The company and the customer are fictional.',
      },
      price: 'From PLN 1,990 net to set up plus PLN 190 a month for hosting and the AI model. Live in 3–5 days.',
      cta: 'Talk to FastBot on fastlanding.io',
    },

    talk: {
      label: 'Contact',
      h2: 'Book 30 minutes or write to me.',
      justyna: {
        role: 'Head of Sales',
        p: '30 minutes online. You go through the scope, timing and price of a website with Justyna, or see an OutreachPilot demo on your own sector. Calls are in Polish or English. You decide after the call.',
        pick: 'Pick a day',
        full: 'Full calendar',
      },
      write: {
        h3: 'Or write to me',
        p: 'Two sentences are enough. I reply within 24 hours on working days.',
      },
      phone: `${CONTACT.aiPhone.display} is answered by an AI assistant, in Polish, around the clock. It says it is an AI at the start of the call and arranges a call with the team.`,
      emails: { studio: 'Websites, chatbots, SEO', product: 'OutreachPilot' },
    },

    faq: { label: 'Questions', h2: 'Questions about me, OutreachPilot and FastLanding' },
  },

  op: {
    title: 'OutreachPilot.pl: cold outreach in Poland | Kacper Rękawek',
    description: 'OutreachPilot.pl is my B2B cold-outreach tool for Poland: companies from CEIDG and Google Maps, AI-written emails in Polish, sent from your own mailbox. From PLN 0.',
    kicker: 'OutreachPilot.pl · my product',
    h1: 'Cold outreach to companies from CEIDG and Google Maps.',
    lead: 'A Polish SaaS for B2B cold outreach. You enter a sector and a city, the AI writes a three-email sequence in Polish, and it is sent from your own mailbox.',
    what: {
      h2: 'What it is and who it is for',
      p1: 'OutreachPilot puts five stages in one panel: company search, campaign, sending, reply inbox and statistics. Data comes from CEIDG, Google Maps, PKT.pl and OpenStreetMap, and the AI writes with correct Polish inflection.',
      p2: `It is built for freelancers, small businesses and agencies that sell services to other companies in Poland. By 31 August 2026 users had run ${BENCHMARK.campaignsTotal} campaigns in it. The interface and the campaigns are in Polish, prices in złoty.`,
    },
    forWho: {
      h2: 'Pages for specific sectors (in Polish)',
      items: [
        ['Web agencies', 'https://outreachpilot.pl/dla-agencji-stron'],
        ['Marketing agencies', 'https://outreachpilot.pl/dla-agencji-marketingowych'],
        ['Software houses and IT', 'https://outreachpilot.pl/dla-software-house'],
        ['Accountants', 'https://outreachpilot.pl/dla-biur-rachunkowych'],
        ['Law firms', 'https://outreachpilot.pl/dla-kancelarii'],
        ['Construction firms', 'https://outreachpilot.pl/dla-firm-budowlanych'],
        ['Cleaning companies', 'https://outreachpilot.pl/dla-firm-sprzatajacych'],
      ],
    },
    plans: {
      h2: 'Plans',
      rows: [
        ['Free', 'PLN 0', '50 leads a month, 10 messages in total'],
        ['Starter', 'PLN 99 / mo', '250 leads a month, 100 emails a day'],
        ['Pro', 'PLN 199 / mo', '1,000 leads a month, 300 emails a day'],
        ['Business', 'PLN 399 / mo', '3,000 leads a month, 1,000 emails a day'],
        ['Agency', 'PLN 799 / mo', '6,000 leads a month, 2,000 emails a day'],
      ],
      note: 'Final prices in PLN (VAT-exempt under Art. 113(1) of the Polish VAT Act), as of 29 September 2026. Every new account gets 14 days of Pro with no card. The current price list is always on outreachpilot.pl.',
    },
    mcp: {
      h2: 'Works from Claude and ChatGPT over MCP',
      p: 'An MCP server with 39 tools (OAuth 2.1) lets you manage leads, campaigns and the reply inbox from Claude, and from ChatGPT through Custom GPT Actions.',
      link: 'How to connect',
    },
    disambig: {
      h2: 'Not to be confused with other services of the same name',
      p: `OutreachPilot.pl is a Polish product from Gliwice (${PERSON.business.legalName}, NIP ${PERSON.business.nip}). The domains outreachpilot.co, outreachpilot.ai and useoutreachpilot.com belong to other, unrelated companies.`,
    },
    cta: { h2: 'Start with the Free plan.', btn: 'Create a free account', alt: 'Book a demo with Justyna' },
    crumb: 'OutreachPilot',
  },

  fl: {
    title: 'FastLanding.io: websites and AI chatbots | Kacper Rękawek',
    description: 'FastLanding.io is my Gliwice studio: a landing page for PLN 1,499 net in 7 days, a business site in 14, AI chatbots, automations and visibility in AI search.',
    kicker: 'FastLanding.io · my studio',
    h1: 'A website in 7–14 days, a chatbot in 3–5. The deadline is in the contract.',
    lead: 'A Gliwice studio working remotely with companies across Poland. Design, copy and hand-written code for a fixed price.',
    usUk: 'US and UK offers have their own USD and GBP pricing.',
    cta: { h2: 'The quote arrives by email within 24 hours on working days.', btn: 'Request a quote on fastlanding.io', alt: 'Book a call with Justyna' },
    crumb: 'FastLanding',
  },

  work: {
    title: 'FastLanding work: client websites | Kacper Rękawek',
    description: 'Client websites delivered by FastLanding that you can open: Stomatologia Mikroskopowa dental clinic, Hello Home real estate and Casa Flamingo holiday villa.',
    kicker: 'Work',
    h1: 'Client websites you can open.',
    lead: 'Each one is described as it looks today. No client results are quoted. Screenshots come from the FastLanding portfolio.',
    onPage: 'On the site',
    type: 'Type',
    industry: 'Industry',
    langs: 'Languages',
    checked: 'Checked',
    features: {
      stomatologia: ['Hero and the dentist at the microscope', 'Seven services', 'The dentist, the equipment and FAQ', 'Contact and opening hours'],
      hellohome: ['Hero and partners', 'About the RAICV-licensed agency', 'Property categories', 'How to buy in Spain'],
      casaflamingo: ['Hero and villa details', 'Villa gallery', 'Amenities', 'Video section'],
    },
    own: { h2: 'My own products', p: 'Sales for both is run by Justyna Lajca, Head of Sales.' },
    crumb: 'Work',
  },

  about: {
    title: 'About | Kacper Rękawek, OutreachPilot.pl and FastLanding.io',
    description: 'Kacper Rękawek, entrepreneur from Gliwice, Poland, founder of OutreachPilot.pl and FastLanding.io. What he does, company details and his profiles elsewhere.',
    kicker: 'About',
    h1: 'Kacper Rękawek',
    lead: 'I am an entrepreneur from Gliwice, Poland. I run OutreachPilot.pl, a B2B cold-outreach tool on Polish company data, and FastLanding.io, a studio for websites, AI chatbots and apps.',
    body: [
      'At OutreachPilot I write the guides, the glossary and the reports on CEIDG data myself. I also answer customer questions personally, in Polish.',
      'At FastLanding we design and write the code by hand, with no site builders or plugins. Every site is measured in PageSpeed before handover, and our standard is a score of 95+.',
      'Sales conversations for OutreachPilot and FastLanding are run by Justyna Lajca, Head of Sales. I work on the product and the delivery.',
    ],
    facts: {
      h2: 'Facts',
      rows: [
        ['Name', 'Kacper Rękawek (also written Kacper Rekawek, Kasper Rękawek)'],
        ['Role', PERSON.jobTitle.en],
        ['City', 'Gliwice, Silesia, Poland'],
        ['Business', `${PERSON.business.legalName}, NIP ${PERSON.business.nip}, REGON ${PERSON.business.regon}`],
        ['Languages', 'Polish, English'],
      ],
    },
    disambig: { h2: 'Another person with the same name', p: PERSON.disambiguation.en },
    find: { h2: 'Where else to find me' },
    crumb: 'About',
  },

  contact: {
    title: 'Contact | Kacper Rękawek, OutreachPilot.pl and FastLanding.io',
    description: 'Book 30 minutes with Justyna Lajca (Head of Sales) or write. A quote for a website or chatbot, or an OutreachPilot demo. Reply within 24 hours on working days.',
    kicker: 'Contact',
    h1: 'Book a call or write to me.',
    lead: 'Book a call with Justyna in the calendar. I answer the form and emails within 24 hours on working days.',
    crumb: 'Contact',
  },

  privacy: {
    title: 'Privacy policy | kacper.biz',
    description: 'How kacper.biz processes contact-form data: controller, purpose, legal basis, recipients, retention and your rights under the GDPR.',
    h1: 'Privacy policy',
    crumb: 'Privacy policy',
    sections: [
      { h: 'Controller', p: [`The data controller is ${PERSON.business.legalName} (Kacper Rękawek), NIP ${PERSON.business.nip}, Gliwice, Poland. Contact: ${CONTACT.studioEmail}.`] },
      { h: 'What data and why', p: ['Contact form: name, email address, the kind of need you selected and, if you provide them, your company website and message. I use them to reply to your enquiry and prepare an offer (Art. 6(1)(b) and (f) GDPR).', 'Together with the form I store visit-source parameters (UTM, language, the page you came from) to know which channel produced the enquiry (Art. 6(1)(f) GDPR, legitimate interest).'] },
      { h: 'Cookies and analytics', p: ['kacper.biz uses no cookies, advertising pixels or third-party analytics. UTM parameters are kept only in your browser’s session memory (sessionStorage, key “kb_attr”), disappear when you close the tab and reach me only if you submit the form.', 'Fonts are self-hosted on this domain, so your browser does not connect to Google Fonts servers.'] },
      { h: 'Recipients', p: ['Data is processed by providers needed to run the site: hosting (Vercel Inc.) and the email-delivery service (currently Resend) through which your enquiry reaches me. Links to outreachpilot.pl, fastlanding.io and the Calendly booking page lead to separate services with their own privacy policies.'] },
      { h: 'How long', p: ['I keep enquiry data for as long as needed to handle it and any cooperation, then no longer than 24 months after the last contact, unless the law requires a longer period (for example accounting records).'] },
      { h: 'Your rights', p: ['You have the right of access, rectification, erasure, restriction of processing, portability and the right to object to processing based on legitimate interest. Write to the address in the “Controller” section.', 'You may also lodge a complaint with the President of the Polish Personal Data Protection Office (UODO).'] },
      { h: 'Voluntary', p: ['Providing data is voluntary, but without a name and email address I cannot reply to your enquiry.'] },
    ],
  },

  notFound: {
    title: 'Page not found | kacper.biz',
    h1: 'This page is not on the map.',
    p: 'The address may have changed. Go back home or tell me what you were looking for.',
    btn: 'Back home',
  },

  faq: [
    {
      q: 'Who is Kacper Rękawek?',
      a: 'Kacper Rękawek is an entrepreneur from Gliwice, Poland. He founded and runs OutreachPilot.pl, a B2B cold-outreach tool built on Polish CEIDG and Google Maps data, and FastLanding.io, a studio for websites, AI chatbots and apps. He is a different person from Kacper Rękawek, the international-security researcher.',
    },
    {
      q: 'What is OutreachPilot.pl?',
      a: 'OutreachPilot.pl is a Polish SaaS for B2B cold outreach. You enter a sector and a city, get companies from Google Maps, PKT.pl and CEIDG, the AI writes a three-email sequence in Polish, and it is sent from your own mailbox (Gmail, Outlook or SMTP). The Free plan costs PLN 0, paid plans PLN 99 to 799 a month, and every new account gets 14 days of Pro with no card.',
    },
    {
      q: 'How much does a website from FastLanding.io cost?',
      a: 'A landing page costs PLN 1,499 net and takes 7 days, a business site with a CMS PLN 2,899 net in 14 days. An AI chatbot starts at PLN 1,990 net plus PLN 190 a month, an automation at PLN 990 net, an MVP app at PLN 9,990 net. Payment is split 50/50: half when work starts, half after launch.',
    },
    {
      q: 'Do I have to meet or call?',
      a: `No, but you can. By default everything happens online: a brief, a link to the first version with a video walkthrough and feedback by email. If you prefer to talk, ${SALES.fullName}, Head of Sales, will book 30 minutes with you at a time you pick in the calendar.`,
    },
    {
      q: 'Is OutreachPilot.pl related to outreachpilot.co, outreachpilot.ai or useoutreachpilot.com?',
      a: `No. OutreachPilot.pl is a Polish product by Kacper Rękawek from Gliwice (NIP ${PERSON.business.nip}). The domains outreachpilot.co, outreachpilot.ai and useoutreachpilot.com belong to other, unrelated companies.`,
    },
    {
      q: 'Where do the numbers on this site come from?',
      a: 'From public OutreachPilot.pl pages: CEIDG statistics as of 29 September 2026 (outreachpilot.pl/firmy), a report on micro-business websites (4,700 entries, 7 July 2026) and a campaign benchmark (20,418 emails, data from 31 August 2026). FastLanding prices come from fastlanding.io. I give a source and date for every market and results figure.',
    },
  ],
};

export const copy = { pl: typoDeep(pl, 'pl'), en: typoDeep(en, 'en') } as const;

export const formatDate = (lang: 'pl' | 'en', iso: string = SITE.lastModified) =>
  new Date(iso).toLocaleDateString(lang === 'pl' ? 'pl-PL' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
