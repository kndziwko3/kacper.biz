/**
 * All page copy, PL + EN. Rules: docs/art-direction.md ("Copy rules"). No em dashes; every number has a source.
 * Facts come from ./site.ts, ./ceidg.ts and the public pages of outreachpilot.pl / fastlanding.io (checked 2026-09-29).
 * Strings are passed through typoDeep() for Polish micro-typography (no-break spaces) at build time.
 */
import { typoDeep } from '../lib/typo';
import { CONTACT, PERSON, SALES, SITE, LEGAL_NOTE } from './site';

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
      lead: 'Buduję narzędzia, dzięki którym polskie firmy zdobywają klientów.',
      products: 'Produkty',
      site: 'Na tej stronie',
      contact: 'Kontakt',
      privacy: 'Polityka prywatności',
      linkedin: 'LinkedIn',
      company: `${PERSON.business.legalName} · NIP ${PERSON.business.nip} · REGON ${PERSON.business.regon}`,
      disambig: 'OutreachPilot.pl nie jest powiązany z outreachpilot.co, outreachpilot.ai ani useoutreachpilot.com.',
    },
  },

  home: {
    title: 'Kacper Rękawek | założyciel OutreachPilot.pl i FastLanding.io',
    description: 'Kacper Rękawek z Gliwic buduje narzędzia do zdobywania klientów: OutreachPilot.pl (cold mailing na danych z CEIDG) i FastLanding.io (strony, chatboty AI, SEO).',
    role: 'Założyciel OutreachPilot.pl i FastLanding.io',
    lead: 'Buduję narzędzia, dzięki którym polskie firmy zdobywają klientów. <strong>OutreachPilot.pl</strong> znajduje firmy w CEIDG i Google Maps i pisze do nich po polsku. <strong>FastLanding.io</strong> robi strony i chatboty, które zamieniają wizytę w zapytanie.',
    index: [
      { name: 'OutreachPilot.pl', text: 'Cold mailing na danych z CEIDG', href: '#outreachpilot' },
      { name: 'FastLanding.io', text: 'Strony, chatboty i widoczność w AI', href: '#fastlanding' },
    ],

    thesis: {
      numeral: '3',
      of: 'na 100',
      h2: 'Tylko 3 na 100 mikrofirm podaje adres strony w swoim wpisie w CEIDG.',
      p: 'To nie znaczy, że pozostałe 97 nie ma strony. Część ma, tylko jej nie zgłosiła. Jeśli jednak sprzedajesz strony, marketing albo usługi dla firm, te wpisy to lista ludzi, do których możesz napisać pierwszy.',
      source: 'Raport OutreachPilot, próba 4 700 wpisów z CEIDG, stan na 7 lipca 2026. Mierzy brak adresu www we wpisie, a nie brak strony.',
    },

    demo: {
      label: 'Dane z rejestru',
      h2: 'Sprawdź swój rynek w CEIDG.',
      p: 'Wybierz branżę i miasto. Liczby to aktywne jednoosobowe działalności z publicznych statystyk OutreachPilot.',
      sector: 'Branża',
      city: 'Miasto',
      sectorCount: 'aktywnych firm w tej branży w całej Polsce',
      cityCount: 'aktywnych firm w 30 branżach razem',
      mailLabel: 'Pierwsze zdanie maila, z odmianą miasta',
      mail: 'Dzień dobry Panie Tomaszu, widzę, że prowadzi Pan firmę {in}.',
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
      h2: 'Od branży i miasta do odpowiedzi w skrzynce.',
      p: 'Wpisujesz branżę i miasto. Po 1–2 minutach masz listę firm z adresami e-mail. AI pisze po polsku sekwencję trzech maili, wysyłka idzie z Twojej skrzynki, a kiedy ktoś odpisze, kolejne maile do niego się zatrzymują.',
      steps: [
        {
          title: 'Lista firm',
          text: 'Google Maps, PKT.pl, OpenStreetMap i CEIDG przeszukiwane na żywo. Filtr „bez www” zawęża listę do wpisów bez adresu strony.',
          panel: { kind: 'query', query: 'biura rachunkowe · Kraków', result: '50 firm', detail: '46 z adresem e-mail', note: 'Przykład z outreachpilot.pl' },
        },
        {
          title: 'Mail po polsku',
          text: 'AI odmienia imiona i miasta, pisze temat i dwa follow-upy. Nie dopisuje faktów, których nie podałeś.',
          panel: { kind: 'declension', pairs: [['Tomasz', 'Panie Tomaszu'], ['Monika', 'Pani Moniko'], ['Bytom', 'z Bytomia'], ['Gliwice', 'w Gliwicach']] },
        },
        {
          title: 'Wysyłka z Twojej skrzynki',
          text: 'Gmail, Outlook albo dowolny SMTP. Losowe odstępy, dzienny limit i link do wypisu w każdym mailu.',
          panel: { kind: 'log', rows: ['09:14', '09:21', '09:26', '09:38'], status: 'wysłano', limit: 'limit dzienny 184 / 300', note: 'Przykład z outreachpilot.pl' },
        },
        {
          title: 'Odpowiedzi',
          text: 'Skrzynka sprawdzana co 15 minut. AI oznacza odpowiedź jako zainteresowanie, pytanie albo odmowę, a sekwencja do tej osoby staje.',
          panel: { kind: 'replies', rows: [['Tomasz L.', 'zainteresowany', 'Brzmi ciekawie, może telefon w czwartek?'], ['Anna M.', 'pytanie', 'Proszę o więcej szczegółów i cennik.'], ['Biuro', 'odmowa', 'Dziękuję, obecnie nie korzystamy.']] },
        },
      ],
      benchmark: {
        h3: 'Wyniki kampanii użytkowników',
        stats: [['28,5%', 'otwarć'], ['1,7%', 'odpowiedzi'], ['0,8%', 'odbić']],
        note: '20 418 maili ze 177 kampanii z wysyłką, dane zamrożone 31 sierpnia 2026. Próba nie jest reprezentatywna dla całego rynku, a metodę opisuje raport.',
        link: 'Metodologia',
      },
      plans: 'Plan Free za 0 zł bez limitu czasu. Każde nowe konto dostaje 14 dni planu Pro bez karty. Płatne plany kosztują od 99 do 799 zł miesięcznie.',
      mcp: 'Serwer MCP z 39 narzędziami: leady, kampanie i skrzynkę obsłużysz z Claude albo ChatGPT.',
      cta: 'Załóż darmowe konto',
      ctaAlt: 'Cennik',
      more: 'Więcej o OutreachPilot',
      legal: LEGAL_NOTE.pl,
    },

    fl: {
      label: 'FastLanding.io',
      h2: 'Landing page w 7 dni, strona firmowa w 14.',
      p: 'FastLanding to moje studio. Robimy projekt, teksty i ręcznie pisany kod, podpinamy domenę i analitykę. Połowę płacisz na start, drugą połowę wtedy, gdy strona działa pod Twoją domeną.',
      showcase: {
        h3: 'Strony, które możesz otworzyć',
        note: 'Opisane tak, jak wyglądają dziś, bez dopisanych wyników.',
        checked: 'sprawdzone',
        langs: 'Języki',
        own: 'Mój własny produkt. Landing zaprojektowany w FastLanding.',
        ownKind: 'Landing produktu SaaS',
      },
      prices: {
        h3: 'Cennik',
        recurring: 'SEO i widoczność w AI',
        note: 'Ceny netto z fastlanding.io, stan na 29 września 2026. Wycena jest bezpłatna, odpowiedź przychodzi w 24 godziny w dni robocze.',
      },
      clauses: {
        h3: 'Co wpisujemy do umowy',
        items: [
          'Cena z oferty jest ceną z faktury.',
          'Termin startu i oddania strony jest zapisany w umowie.',
          'Zaliczka 50% rezerwuje termin. Drugą połowę płacisz, gdy strona działa.',
          'Po zapłacie całości przenosimy na Ciebie autorskie prawa majątkowe do projektu, kodu i tekstów.',
          'Przez 30 dni po starcie poprawiamy błędy bez dopłat.',
        ],
      },
      process: {
        h3: 'Jak to przebiega',
        steps: [
          ['Brief albo rozmowa', 'Krótki formularz online albo 30 minut rozmowy z Justyną.'],
          ['Wycena w 24 h', 'Cena, zakres i data startu na piśmie.'],
          ['Pierwsza wersja', 'Działający link i nagranie wideo z omówieniem każdego ekranu.'],
          ['Poprawki', '2–3 rundy w cenie, każda wdrożona w 24–48 h.'],
          ['Start', 'Domena, certyfikat SSL, analityka, SEO techniczne i pomiar PageSpeed.'],
        ],
      },
      ai: {
        h3: 'Widoczność w Google i w odpowiedziach AI',
        p: 'Sprawdzamy, jak Twoją firmę widzą Google, ChatGPT, Gemini i Perplexity, i poprawiamy technikę, treści oraz dane o firmie. Zmiany mierzymy w Search Console i Bing. Bez gwarancji pozycji, z raportem co miesiąc. Ta strona powstała według tych samych zasad.',
      },
      cta: 'Wycena w 24 h',
      ctaAlt: 'Porozmawiaj z Justyną',
      more: 'Więcej o FastLanding',
    },

    bot: {
      time: '22:14',
      label: 'FastBot',
      h2: 'Klient pyta o cenę o 22:14, a FastBot odpowiada od razu.',
      p: 'Bot zna Twoją ofertę i cennik, dopytuje o budżet i termin, a kontakt razem z całą rozmową wysyła na maila firmy. Działa na każdej stronie, nie tylko zbudowanej przez FastLanding.',
      chat: {
        company: 'Kowalski Remonty',
        status: 'Asystent AI, online',
        day: 'Dziś, 22:14',
        q1: 'Dzień dobry, ile kosztuje remont łazienki? Ma ok. 5 m².',
        a1: 'Dobry wieczór! Według cennika remont łazienki do 6 m² kosztuje od 18 000 zł z robocizną. Na kiedy planuje Pan remont?',
        chips: ['W tym roku', 'Wiosną', 'Jeszcze nie wiem'],
        pick: 'Wiosną',
        a2: 'Zapisane. Zostaw e-mail, a jutro rano odezwiemy się z terminem oględzin.',
        q2: 'marek.nowak@example.com',
        done: 'Kontakt i cała rozmowa są już na mailu firmy.',
        replay: 'Odtwórz jeszcze raz',
        note: 'Przykładowa rozmowa z fastlanding.io. Firma i klient są fikcyjni.',
      },
      price: 'Od 1 990 zł netto plus 190 zł miesięcznie za hosting i model AI. Wdrożenie w 3–5 dni.',
      cta: 'Porozmawiaj z FastBotem na fastlanding.io',
    },

    talk: {
      label: 'Kontakt',
      h2: 'Porozmawiajmy o Twojej firmie.',
      justyna: {
        role: 'Head of Sales',
        p: '30 minut online. Omówicie zakres, termin i cenę strony albo pokaz OutreachPilot na Twojej branży. Decyzję podejmujesz po rozmowie.',
        pick: 'Wybierz dzień',
        full: 'Pełny kalendarz',
      },
      write: {
        h3: 'Wolisz napisać?',
        p: 'Dwa zdania wystarczą. Odpowiadam w 24 godziny w dni robocze.',
      },
      phone: `${CONTACT.aiPhone.display} odbiera asystent AI, po polsku, całą dobę. Na początku rozmowy mówi, że jest AI, i umawia rozmowę z zespołem.`,
      emails: { studio: 'Strony, chatboty, SEO', product: 'OutreachPilot' },
    },

    faq: { label: 'Pytania', h2: 'Krótko o mnie i o obu firmach.' },
  },

  op: {
    title: 'OutreachPilot.pl: cold mailing do firm z CEIDG | Kacper Rękawek',
    description: 'OutreachPilot.pl to moje narzędzie do cold mailingu B2B: firmy z CEIDG i Google Maps, maile po polsku pisane przez AI, wysyłka z Twojej skrzynki. Od 0 zł.',
    kicker: 'OutreachPilot.pl · mój produkt',
    h1: 'Cold mailing do firm z CEIDG i Google Maps.',
    lead: 'Polskie narzędzie SaaS do cold outreachu B2B. Wpisujesz branżę i miasto, AI pisze sekwencję trzech maili po polsku, a wysyłka idzie z Twojej własnej skrzynki.',
    what: {
      h2: 'Co to jest i dla kogo',
      p1: 'OutreachPilot łączy w jednym przepływie pięć etapów, które zwykle skleja się z trzech narzędzi i arkusza: wyszukiwanie firm, kampanię, wysyłkę, skrzynkę odpowiedzi i statystyki. Dane pochodzą z CEIDG, Google Maps, PKT.pl i OpenStreetMap, a AI pisze z poprawną polską odmianą.',
      p2: 'Korzystają z niego freelancerzy, małe firmy i agencje, które sprzedają usługi innym firmom w Polsce. Interfejs i kampanie są po polsku, ceny w złotówkach.',
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
        ['Free', '0 zł', '50 leadów miesięcznie, 10 wiadomości łącznie'],
        ['Starter', '99 zł / mies.', '250 leadów miesięcznie, 100 maili dziennie'],
        ['Pro', '199 zł / mies.', '1000 leadów miesięcznie, 300 maili dziennie'],
        ['Business', '399 zł / mies.', '3000 leadów miesięcznie, 1000 maili dziennie'],
        ['Agencja', '799 zł / mies.', '6000 leadów miesięcznie, 2000 maili dziennie'],
      ] as [string, string, string][],
      note: 'Ceny końcowe w PLN (zwolnienie z VAT, art. 113 ust. 1), stan na 29 września 2026. Każde nowe konto dostaje 14 dni planu Pro bez karty. Aktualny cennik jest zawsze na outreachpilot.pl.',
    },
    mcp: {
      h2: 'Podłączony do Twojego asystenta AI',
      p: 'Serwer MCP z 39 narzędziami (OAuth 2.1) pozwala prowadzić leady, kampanie i skrzynkę odpowiedzi z Claude, a przez Custom GPT Actions także z ChatGPT.',
      link: 'Jak podłączyć',
    },
    disambig: {
      h2: 'Który OutreachPilot',
      p: 'OutreachPilot.pl to polski produkt z Gliwic (Kacper Rękawek FastLanding, NIP 6312736932). Domeny outreachpilot.co, outreachpilot.ai i useoutreachpilot.com należą do innych, niepowiązanych firm.',
    },
    cta: { h2: 'Zacznij od planu Free.', btn: 'Załóż konto na outreachpilot.pl', alt: 'Pokaz z Justyną, 30 minut' },
    crumb: 'OutreachPilot',
  },

  fl: {
    title: 'FastLanding.io: strony i chatboty AI w 7–14 dni | Kacper Rękawek',
    description: 'FastLanding.io to moje studio z Gliwic: landing page za 1 499 zł w 7 dni, strona firmowa w 14, chatboty AI, automatyzacje i widoczność w wyszukiwarkach AI.',
    kicker: 'FastLanding.io · moje studio',
    h1: 'Strony, chatboty i widoczność w AI dla małych firm.',
    lead: 'Studio z Gliwic, które pracuje zdalnie z firmami z całej Polski. Projekt, teksty i ręcznie pisany kod za stałą cenę, z terminem wpisanym do umowy.',
    usUk: 'Oferty na rynek amerykański i brytyjski mają osobne ceny w USD i GBP.',
    cta: { h2: 'Wycena przychodzi mailem w 24 godziny.', btn: 'Poproś o wycenę na fastlanding.io', alt: 'Porozmawiaj z Justyną' },
    crumb: 'FastLanding',
  },

  work: {
    title: 'Realizacje FastLanding: strony klientów | Kacper Rękawek',
    description: 'Strony klientów FastLanding, które możesz otworzyć: gabinet Stomatologia Mikroskopowa, agencja nieruchomości Hello Home i willa wakacyjna Casa Flamingo.',
    kicker: 'Realizacje',
    h1: 'Strony klientów, które możesz otworzyć.',
    lead: 'Każdą opisuję tak, jak wygląda dziś, bez dopisanych wyników. Zrzuty ekranu pochodzą z portfolio FastLanding.',
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
    own: { h2: 'Moje własne produkty', p: 'To nie zlecenia. Te dwie firmy prowadzę sam.' },
    crumb: 'Realizacje',
  },

  about: {
    title: 'O mnie | Kacper Rękawek, OutreachPilot.pl i FastLanding.io',
    description: 'Kacper Rękawek, przedsiębiorca z Gliwic, założyciel OutreachPilot.pl i FastLanding.io. Czym się zajmuje, dane firmy i profile, które go opisują.',
    kicker: 'O mnie',
    h1: 'Kacper Rękawek',
    lead: 'Jestem przedsiębiorcą z Gliwic. Prowadzę OutreachPilot.pl, narzędzie do cold mailingu B2B na polskich danych, i FastLanding.io, studio stron, chatbotów AI i aplikacji.',
    body: [
      'W OutreachPilot sam prowadzę treści: poradniki, słownik i raporty na danych z CEIDG. Na pytania klientów też odpowiadam osobiście, po polsku.',
      'W FastLanding projektujemy i piszemy kod ręcznie, bez kreatorów i wtyczek. Każdą stronę mierzymy przed oddaniem, a standardem jest PageSpeed 95+.',
      'Rozmowy sprzedażowe w obu firmach prowadzi Justyna Lajca, Head of Sales. Ja zajmuję się produktem i realizacją.',
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
    disambig: { h2: 'Imiennik', p: PERSON.disambiguation.pl },
    find: { h2: 'Gdzie jeszcze mnie znajdziesz' },
    crumb: 'O mnie',
  },

  contact: {
    title: 'Kontakt | Kacper Rękawek, OutreachPilot.pl i FastLanding.io',
    description: 'Umów 30 minut z Justyną Lajcą (Head of Sales), napisz przez formularz albo mailem. Wycena strony, chatbota lub pokaz OutreachPilot. Odpowiedź w 24 godziny.',
    kicker: 'Kontakt',
    h1: 'Porozmawiajmy o Twojej firmie.',
    lead: 'Rozmowa, formularz albo mail. Wybierz to, co Ci pasuje.',
    crumb: 'Kontakt',
  },

  privacy: {
    title: 'Polityka prywatności | kacper.biz',
    description: 'Jak kacper.biz przetwarza dane z formularza kontaktowego: administrator, cel, podstawa prawna, odbiorcy, czas przechowywania i Twoje prawa.',
    h1: 'Polityka prywatności',
    crumb: 'Polityka prywatności',
    sections: [
      { h: 'Administrator', p: [`Administratorem danych jest ${PERSON.business.legalName} (Kacper Rękawek), NIP ${PERSON.business.nip}, Gliwice. Kontakt: ${CONTACT.studioEmail}.`] },
      { h: 'Jakie dane i po co', p: ['Formularz kontaktowy: imię, adres e-mail, wybrany rodzaj potrzeby oraz, jeśli je podasz, adres strony firmy i treść wiadomości. Używam ich, aby odpowiedzieć na zapytanie i przygotować ofertę (art. 6 ust. 1 lit. b i f RODO).', 'Razem z formularzem zapisuję parametry źródła wizyty (UTM, język, strona, z której przyszedłeś), aby wiedzieć, który kanał przyniósł zapytanie (art. 6 ust. 1 lit. f RODO, prawnie uzasadniony interes).'] },
      { h: 'Cookies i analityka', p: ['Strona kacper.biz nie używa plików cookie, pikseli reklamowych ani zewnętrznej analityki. Parametry UTM są przechowywane tylko w pamięci sesji Twojej przeglądarki (sessionStorage, klucz „kb_attr”), znikają po zamknięciu karty i trafiają do mnie tylko wtedy, gdy wyślesz formularz.', 'Fonty są hostowane na tej samej domenie, więc przeglądarka nie łączy się z serwerami Google Fonts.'] },
      { h: 'Odbiorcy danych', p: ['Dane przetwarzają dostawcy potrzebni do działania strony: hosting (Vercel Inc.) i usługa wysyłki e-maili (obecnie Resend), przez którą trafia do mnie zapytanie. Linki do outreachpilot.pl, fastlanding.io i kalendarza Calendly prowadzą do osobnych serwisów z własnymi politykami prywatności.'] },
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
      a: 'Landing page kosztuje 1 499 zł netto i powstaje w 7 dni, strona firmowa z panelem CMS 2 899 zł netto w 14 dni. Chatbot AI kosztuje od 1 990 zł plus 190 zł miesięcznie, automatyzacja od 990 zł, aplikacja MVP od 9 990 zł. Płatność dzielimy 50/50: połowa na start, połowa po uruchomieniu.',
    },
    {
      q: 'Czy muszę się spotykać albo dzwonić?',
      a: `Nie musisz, ale możesz. Domyślnie wszystko dzieje się online: brief, link do pierwszej wersji z nagraniem wideo i uwagi mailem. Jeśli wolisz rozmowę, ${SALES.fullName}, Head of Sales, umówi z Tobą 30 minut w terminie z kalendarza.`,
    },
    {
      q: 'Czy OutreachPilot.pl ma związek z outreachpilot.co, outreachpilot.ai albo useoutreachpilot.com?',
      a: 'Nie. OutreachPilot.pl to polski produkt Kacpra Rękawka z Gliwic (NIP 6312736932). Domeny outreachpilot.co, outreachpilot.ai i useoutreachpilot.com należą do innych, niepowiązanych firm.',
    },
    {
      q: 'Skąd pochodzą liczby na tej stronie?',
      a: 'Z publicznych stron OutreachPilot.pl: statystyk CEIDG z 29 września 2026 (outreachpilot.pl/firmy), raportu o stronach www mikrofirm (próba 4 700 wpisów, 7 lipca 2026) i benchmarku kampanii (20 418 maili, dane z 31 sierpnia 2026). Ceny FastLanding pochodzą z fastlanding.io. Przy każdej liczbie podaję źródło i datę.',
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
      lead: 'I build tools that help Polish companies win customers.',
      products: 'Products',
      site: 'On this site',
      contact: 'Contact',
      privacy: 'Privacy policy',
      linkedin: 'LinkedIn',
      company: `${PERSON.business.legalName} · NIP ${PERSON.business.nip} · REGON ${PERSON.business.regon}`,
      disambig: 'OutreachPilot.pl is not affiliated with outreachpilot.co, outreachpilot.ai or useoutreachpilot.com.',
    },
  },

  home: {
    title: 'Kacper Rękawek | founder of OutreachPilot.pl and FastLanding.io',
    description: 'Kacper Rękawek from Gliwice, Poland builds tools that win customers: OutreachPilot.pl (cold outreach on Polish data) and FastLanding.io (websites, AI chatbots).',
    role: 'Founder of OutreachPilot.pl and FastLanding.io',
    lead: 'I build tools that help Polish companies win customers. <strong>OutreachPilot.pl</strong> finds businesses in the CEIDG registry and Google Maps and writes to them in Polish. <strong>FastLanding.io</strong> builds websites and chatbots that turn a visit into an enquiry.',
    index: [
      { name: 'OutreachPilot.pl', text: 'Cold outreach on CEIDG data', href: '#outreachpilot' },
      { name: 'FastLanding.io', text: 'Websites, chatbots, AI visibility', href: '#fastlanding' },
    ],

    thesis: {
      numeral: '3',
      of: 'in 100',
      h2: 'Only 3 in 100 Polish micro-businesses list a website in their CEIDG registry entry.',
      p: 'That does not mean the other 97 have no website. Some do and never listed it. But if you sell websites, marketing or business services, those entries are a list of people you can write to first.',
      source: 'OutreachPilot report, sample of 4,700 CEIDG entries, 7 July 2026. It measures a missing website address in the entry, not a missing website.',
    },

    demo: {
      label: 'Registry data',
      h2: 'Check your market in CEIDG.',
      p: 'Pick a sector and a city. The numbers are active sole proprietorships from OutreachPilot’s public statistics of the Polish business registry.',
      sector: 'Sector',
      city: 'City',
      sectorCount: 'active businesses in this sector across Poland',
      cityCount: 'active businesses across all 30 sectors',
      mailLabel: 'First line of an email, with the city inflected (Polish)',
      mail: 'Dzień dobry Panie Tomaszu, widzę, że prowadzi Pan firmę {in}.',
      mailNote: 'An inflection example. In OutreachPilot the email itself is written by AI from your offer.',
      cta: 'See this sector on outreachpilot.pl',
      all: 'All 30 sectors',
      tableSector: 'Sector',
      tablePkd: 'PKD',
      tableCount: 'Active',
      source: 'CEIDG via outreachpilot.pl/firmy, as of 29 September 2026. 3,181,616 active sole proprietorships across 30 service sectors.',
    },

    op: {
      label: 'OutreachPilot.pl',
      h2: 'From a sector and a city to a reply in your inbox.',
      p: 'Type a sector and a city. In 1–2 minutes you have a list of companies with email addresses. AI writes a three-email sequence in Polish, it goes out from your own mailbox, and when someone replies, the follow-ups to them stop.',
      steps: [
        {
          title: 'A list of companies',
          text: 'Google Maps, PKT.pl, OpenStreetMap and CEIDG searched live. The “no website” filter narrows the list to entries without a website address.',
          panel: { kind: 'query', query: 'biura rachunkowe · Kraków', result: '50 companies', detail: '46 with an email address', note: 'Example from outreachpilot.pl' },
        },
        {
          title: 'Email in proper Polish',
          text: 'AI inflects first names and cities, writes the subject and two follow-ups, and never adds facts you did not give it.',
          panel: { kind: 'declension', pairs: [['Tomasz', 'Panie Tomaszu'], ['Monika', 'Pani Moniko'], ['Bytom', 'z Bytomia'], ['Gliwice', 'w Gliwicach']] },
        },
        {
          title: 'Sent from your mailbox',
          text: 'Gmail, Outlook or any SMTP. Random gaps, a daily limit and an unsubscribe link in every email.',
          panel: { kind: 'log', rows: ['09:14', '09:21', '09:26', '09:38'], status: 'sent', limit: 'daily limit 184 / 300', note: 'Example from outreachpilot.pl' },
        },
        {
          title: 'Replies',
          text: 'The inbox is checked every 15 minutes. AI tags each reply as interested, question or no, and the sequence to that person stops.',
          panel: { kind: 'replies', rows: [['Tomasz L.', 'interested', 'Sounds interesting, a call on Thursday?'], ['Anna M.', 'question', 'Please send more details and pricing.'], ['Office', 'no', 'Thank you, not at the moment.']] },
        },
      ],
      benchmark: {
        h3: 'Results from user campaigns',
        stats: [['28.5%', 'opens'], ['1.7%', 'replies'], ['0.8%', 'bounces']],
        note: '20,418 emails from 177 campaigns with sends, data frozen on 31 August 2026. The sample does not represent the whole market; the report describes the method.',
        link: 'Methodology',
      },
      plans: 'A Free plan at PLN 0 with no time limit. Every new account gets 14 days of Pro with no card. Paid plans cost PLN 99 to 799 a month.',
      mcp: 'An MCP server with 39 tools: run leads, campaigns and the inbox from Claude or ChatGPT.',
      cta: 'Create a free account',
      ctaAlt: 'Pricing',
      more: 'More about OutreachPilot',
      legal: LEGAL_NOTE.en,
    },

    fl: {
      label: 'FastLanding.io',
      h2: 'A landing page in 7 days, a business site in 14.',
      p: 'FastLanding is my studio. We do the design, the copy and hand-written code, and connect the domain and analytics. You pay half to start and the other half once the site runs on your domain.',
      showcase: {
        h3: 'Sites you can open',
        note: 'Described as they look today, with no invented results.',
        checked: 'checked',
        langs: 'Languages',
        own: 'My own product. Landing page designed at FastLanding.',
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
          'The price in the quote is the price on the invoice.',
          'The start and delivery dates are written into the contract.',
          'A 50% deposit books the slot. You pay the rest once the site is live.',
          'After full payment we transfer the economic copyright to the design, code and copy.',
          'For 30 days after launch we fix bugs at no extra cost.',
        ],
      },
      process: {
        h3: 'How it runs',
        steps: [
          ['Brief or a call', 'A short online form or 30 minutes with Justyna.'],
          ['Quote in 24 h', 'Price, scope and start date in writing.'],
          ['First version', 'A working link and a video walking through every screen.'],
          ['Revisions', '2–3 rounds included, each shipped in 24–48 h.'],
          ['Launch', 'Domain, SSL, analytics, technical SEO and a PageSpeed check.'],
        ],
      },
      ai: {
        h3: 'Visibility in Google and in AI answers',
        p: 'We check how Google, ChatGPT, Gemini and Perplexity see your company, then fix the technical side, the content and the company data. Changes are measured in Search Console and Bing. No ranking guarantees, a report every month. This site follows the same rules.',
      },
      cta: 'Quote in 24 h',
      ctaAlt: 'Talk to Justyna',
      more: 'More about FastLanding',
    },

    bot: {
      time: '22:14',
      label: 'FastBot',
      h2: 'A customer asks for a price at 22:14, and FastBot answers right away.',
      p: 'The bot knows your offer and prices, asks about budget and timing, and emails the contact to the business with the whole conversation. It works on any website, not only ones built by FastLanding.',
      chat: {
        company: 'Kowalski Remonty',
        status: 'AI assistant, online',
        day: 'Today, 22:14',
        q1: 'Hello, how much does a bathroom renovation cost? It is about 5 m².',
        a1: 'Good evening! According to the price list, a bathroom up to 6 m² starts at PLN 18,000 including labour. When are you planning the work?',
        chips: ['This year', 'In spring', 'Not sure yet'],
        pick: 'In spring',
        a2: 'Noted. Leave your email and we will get back to you tomorrow morning with a date for a site visit.',
        q2: 'marek.nowak@example.com',
        done: 'The contact and the whole conversation are already in the company’s inbox.',
        replay: 'Play again',
        note: 'Example conversation from fastlanding.io, translated. The company and the customer are fictional.',
      },
      price: 'From PLN 1,990 net plus PLN 190 a month for hosting and the AI model. Live in 3–5 days.',
      cta: 'Talk to FastBot on fastlanding.io',
    },

    talk: {
      label: 'Contact',
      h2: 'Let’s talk about your business.',
      justyna: {
        role: 'Head of Sales',
        p: '30 minutes online. Scope, timing and price of a website, or an OutreachPilot demo for your sector. You decide after the call. Calls are in Polish or English.',
        pick: 'Pick a day',
        full: 'Full calendar',
      },
      write: {
        h3: 'Prefer to write?',
        p: 'Two sentences are enough. I reply within 24 hours on working days.',
      },
      phone: `${CONTACT.aiPhone.display} is answered by an AI assistant, in Polish, around the clock. It says it is an AI at the start of the call and books a call with the team.`,
      emails: { studio: 'Websites, chatbots, SEO', product: 'OutreachPilot' },
    },

    faq: { label: 'Questions', h2: 'Short answers about me and both companies.' },
  },

  op: {
    title: 'OutreachPilot.pl: cold outreach in Poland | Kacper Rękawek',
    description: 'OutreachPilot.pl is my B2B cold-outreach tool for Poland: companies from CEIDG and Google Maps, AI-written emails in Polish, sent from your own mailbox. From PLN 0.',
    kicker: 'OutreachPilot.pl · my product',
    h1: 'Cold outreach to companies from CEIDG and Google Maps.',
    lead: 'A Polish SaaS for B2B cold outreach. Type a sector and a city, AI writes a three-email sequence in Polish, and it is sent from your own mailbox.',
    what: {
      h2: 'What it is and who it is for',
      p1: 'OutreachPilot puts five stages into one flow that people usually stitch together from three tools and a spreadsheet: company search, campaign, sending, reply inbox and statistics. Data comes from CEIDG, Google Maps, PKT.pl and OpenStreetMap, and the AI writes with correct Polish inflection.',
      p2: 'It is used by freelancers, small businesses and agencies that sell services to other companies in Poland. The interface and the campaigns are in Polish, prices in złoty.',
    },
    forWho: {
      h2: 'Pages for specific sectors (in Polish)',
      items: [
        ['Web agencies', 'https://outreachpilot.pl/dla-agencji-stron'],
        ['Marketing agencies', 'https://outreachpilot.pl/dla-agencji-marketingowych'],
        ['Software houses and IT', 'https://outreachpilot.pl/dla-software-house'],
        ['Accounting offices', 'https://outreachpilot.pl/dla-biur-rachunkowych'],
        ['Law offices', 'https://outreachpilot.pl/dla-kancelarii'],
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
      note: 'Final prices in PLN (VAT-exempt, art. 113(1)), as of 29 September 2026. Every new account gets 14 days of Pro with no card. The current price list is always on outreachpilot.pl.',
    },
    mcp: {
      h2: 'Connected to your AI assistant',
      p: 'An MCP server with 39 tools (OAuth 2.1) lets you run leads, campaigns and the reply inbox from Claude, and from ChatGPT through Custom GPT Actions.',
      link: 'How to connect',
    },
    disambig: {
      h2: 'Which OutreachPilot',
      p: 'OutreachPilot.pl is a Polish product from Gliwice (Kacper Rękawek FastLanding, NIP 6312736932). The domains outreachpilot.co, outreachpilot.ai and useoutreachpilot.com belong to other, unrelated companies.',
    },
    cta: { h2: 'Start with the Free plan.', btn: 'Create an account on outreachpilot.pl', alt: 'A 30-minute demo with Justyna' },
    crumb: 'OutreachPilot',
  },

  fl: {
    title: 'FastLanding.io: websites and AI chatbots | Kacper Rękawek',
    description: 'FastLanding.io is my Gliwice studio: a landing page for PLN 1,499 in 7 days, a business site in 14, AI chatbots, automations and visibility in AI search.',
    kicker: 'FastLanding.io · my studio',
    h1: 'Websites, chatbots and AI visibility for small businesses.',
    lead: 'A Gliwice studio working remotely with companies across Poland. Design, copy and hand-written code for a fixed price, with the deadline written into the contract.',
    usUk: 'US and UK offers have their own USD and GBP pricing.',
    cta: { h2: 'The quote arrives by email within 24 hours.', btn: 'Request a quote on fastlanding.io', alt: 'Talk to Justyna' },
    crumb: 'FastLanding',
  },

  work: {
    title: 'FastLanding work: client websites | Kacper Rękawek',
    description: 'Client websites delivered by FastLanding that you can open: Stomatologia Mikroskopowa dental clinic, Hello Home real estate and Casa Flamingo holiday villa.',
    kicker: 'Work',
    h1: 'Client websites you can open.',
    lead: 'Each one is described as it looks today, with no invented results. Screenshots come from the FastLanding portfolio.',
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
    own: { h2: 'My own products', p: 'Not client work. I run these two companies myself.' },
    crumb: 'Work',
  },

  about: {
    title: 'About | Kacper Rękawek, OutreachPilot.pl and FastLanding.io',
    description: 'Kacper Rękawek, entrepreneur from Gliwice, Poland, founder of OutreachPilot.pl and FastLanding.io. What he does, company details and profiles that describe him.',
    kicker: 'About',
    h1: 'Kacper Rękawek',
    lead: 'I am an entrepreneur from Gliwice, Poland. I run OutreachPilot.pl, a B2B cold-outreach tool on Polish company data, and FastLanding.io, a studio for websites, AI chatbots and apps.',
    body: [
      'At OutreachPilot I write the content myself: guides, a glossary and reports on CEIDG data. I also answer customer questions personally, in Polish.',
      'At FastLanding we design and write the code by hand, with no site builders or plugins. Every site is measured before handover, and PageSpeed 95+ is the standard.',
      'Sales conversations for both companies are run by Justyna Lajca, Head of Sales. I work on the product and the delivery.',
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
    disambig: { h2: 'Namesake', p: PERSON.disambiguation.en },
    find: { h2: 'Where else to find me' },
    crumb: 'About',
  },

  contact: {
    title: 'Contact | Kacper Rękawek, OutreachPilot.pl and FastLanding.io',
    description: 'Book 30 minutes with Justyna Lajca (Head of Sales), use the form or email. A quote for a website or chatbot, or an OutreachPilot demo. Reply within 24 hours.',
    kicker: 'Contact',
    h1: 'Let’s talk about your business.',
    lead: 'A call, the form or an email. Pick what suits you.',
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
      a: 'OutreachPilot.pl is a Polish SaaS for B2B cold outreach. You enter a sector and a city, get companies from Google Maps, PKT.pl and CEIDG, AI writes a three-email sequence in Polish, and it is sent from your own mailbox (Gmail, Outlook or SMTP). The Free plan costs PLN 0, paid plans PLN 99 to 799 a month, and every new account gets 14 days of Pro with no card.',
    },
    {
      q: 'How much does a website from FastLanding.io cost?',
      a: 'A landing page costs PLN 1,499 net and takes 7 days, a business site with a CMS PLN 2,899 net in 14 days. An AI chatbot starts at PLN 1,990 plus PLN 190 a month, an automation at PLN 990, an MVP app at PLN 9,990. Payment is split 50/50: half to start, half after launch.',
    },
    {
      q: 'Do I have to meet or call?',
      a: `No, but you can. By default everything happens online: a brief, a link to the first version with a video walkthrough and feedback by email. If you prefer to talk, ${SALES.fullName}, Head of Sales, will book 30 minutes with you from her calendar.`,
    },
    {
      q: 'Is OutreachPilot.pl related to outreachpilot.co, outreachpilot.ai or useoutreachpilot.com?',
      a: 'No. OutreachPilot.pl is a Polish product by Kacper Rękawek from Gliwice (NIP 6312736932). The domains outreachpilot.co, outreachpilot.ai and useoutreachpilot.com belong to other, unrelated companies.',
    },
    {
      q: 'Where do the numbers on this site come from?',
      a: 'From public OutreachPilot.pl pages: CEIDG statistics as of 29 September 2026 (outreachpilot.pl/firmy), a report on micro-business websites (4,700 entries, 7 July 2026) and a campaign benchmark (20,418 emails, data from 31 August 2026). FastLanding prices come from fastlanding.io. Every number on the site carries its source and date.',
    },
  ],
};

export const copy = { pl: typoDeep(pl, 'pl'), en: typoDeep(en, 'en') } as const;

export const formatDate = (lang: 'pl' | 'en', iso: string = SITE.lastModified) =>
  new Date(iso).toLocaleDateString(lang === 'pl' ? 'pl-PL' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
