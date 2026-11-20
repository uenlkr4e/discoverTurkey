// Interface text in every locale. English is the reference: every other locale must define
// every key (the type enforces it). Use {name} placeholders for values filled in at render time.
import { DEFAULT_LOCALE, LOCALES, type Locale } from './locales';

const en = {
  'site.tagline': 'Discover where to go and what to do in Turkey',
  'site.description':
    'Destination guides, itineraries and practical travel advice for planning a trip to Turkey, reviewed by our editors.',

  'nav.main': 'Main',
  'nav.menu': 'Menu',
  'nav.destinations': 'Destinations',
  'nav.interests': 'Experiences',
  'nav.itineraries': 'Itineraries',
  'nav.guides': 'Travel tips',
  'nav.search': 'Search',
  'nav.home': 'Home',
  'nav.skip': 'Skip to content',
  'nav.breadcrumb': 'Breadcrumb',
  'nav.language': 'Language',
  'nav.thisPageIn': 'This page in {language}',

  'footer.explore': 'Explore',
  'footer.aboutSite': 'About this site',
  'footer.about': 'About',
  'footer.editorialPolicy': 'Editorial policy',
  'footer.privacy': 'Privacy',
  'footer.cookies': 'Cookies',
  'footer.privacySettings': 'Privacy settings',

  'common.newTab': ' (opens in a new tab)',
  'common.photo': 'Photo:',
  'common.advertisement': 'Advertisement',
  'common.days.one': '{count} day',
  'common.days.other': '{count} days',
  'common.goodFor': 'Good for',
  'common.destinations': 'Destinations',
  'common.itineraries': 'Itineraries',
  'common.browseByRegion': 'Browse by region',
  'common.browseByInterest': 'Browse by interest',

  'type.destinations': 'Destination',
  'type.guides': 'Guide',
  'type.itineraries': 'Itinerary',

  'season.spring': 'Spring',
  'season.summer': 'Summer',
  'season.autumn': 'Autumn',
  'season.winter': 'Winter',

  'byline.by': 'By',
  'byline.reviewed': 'Last reviewed',
  'byline.reviewedBy': 'by',
  'byline.notReviewed': 'Not yet reviewed',
  'page.updated': 'Last updated',

  'share.heading': 'Share this page',
  'share.native': 'Share…',
  'share.copy': 'Copy link',
  'share.copied': 'Link copied',
  'share.copyFailed': 'Could not copy the link. Copy it from the address bar instead.',

  'related.heading': 'Keep planning',

  'newsletter.heading': 'Plan a better trip to Turkey',
  'newsletter.body':
    'One email a month with our new guides, seasonal tips and changes that affect travellers, such as new entry rules. No spam; unsubscribe any time.',
  'newsletter.label': 'Email address',
  'newsletter.submit': 'Subscribe',
  'newsletter.note': 'Emails are sent by {provider}.',
  'newsletter.privacy': 'Privacy policy',

  'search.label': 'Search destinations and guides',
  'search.submit': 'Search',
  'search.title': 'Search',
  'search.description': 'Search Discover Turkey destination guides, travel tips and itineraries.',
  'search.show': 'Show',
  'search.everything': 'Everything',
  'search.noscript': 'Search needs JavaScript. You can browse destinations or travel tips instead.',
  'search.searching': 'Searching…',
  'search.results.one': '{count} result for “{term}”',
  'search.results.other': '{count} results for “{term}”',
  'search.unavailable': 'Search is unavailable right now. Try browsing destinations instead.',

  'notFound.title': 'Page not found',
  'notFound.description': 'The page you were looking for could not be found.',
  'notFound.lede':
    'The page may have moved, or the address may be mistyped. Try searching, or start from one of these pages.',

  'home.lede':
    'Destination guides, day-by-day itineraries and practical advice for planning your trip, all reviewed by our editors.',
  'home.featured': 'Featured destinations',
  'home.seasonal.spring': 'Where to go in spring',
  'home.seasonal.summer': 'Where to go in summer',
  'home.seasonal.autumn': 'Where to go in autumn',
  'home.seasonal.winter': 'Where to go in winter',
  'home.plan': 'Plan your trip',
  'home.allGuides': 'All travel tips',
  'home.itineraries': 'Popular itineraries',
  'home.allItineraries': 'All itineraries',

  'destinations.title': 'Destinations in Turkey',
  'destinations.description':
    "Explore Turkey's top destinations by region and interest, from Istanbul and Cappadocia to the Aegean and Mediterranean coasts.",
  'destinations.lede': 'Where to go, what to see and how long to stay, with guides reviewed by our editors.',
  'destinations.all': 'All destinations',
  'destinations.empty': 'Our first destination guides are being reviewed and will appear here soon.',
  'destination.eyebrow': '{region} region',
  'destination.region': 'Region',
  'destination.bestTime': 'Best time to visit',
  'destination.stay': 'Suggested stay',
  'destination.attractions': 'Top attractions and things to do',
  'destination.gettingThere': 'Getting there',
  'destination.gettingAround': 'Getting around',
  'destination.food': 'Food and local experiences',
  'destination.map': 'Map',
  'destination.googleMaps': '{name} on Google Maps',
  'destination.osm': '{name} on OpenStreetMap',

  'guides.title': 'Turkey travel tips and planning guides',
  'guides.description':
    'Practical guides to planning a trip to Turkey: transport, money, mobile data, etiquette, safety and when to go.',
  'guides.heading': 'Travel tips',
  'guides.lede': 'Practical advice for planning your trip, checked against official sources by our editors.',
  'guides.empty': 'Our planning guides are being reviewed and will appear here soon.',
  'guides.categoryTitle': '{category} tips for Turkey',
  'guide.eyebrow': 'Travel tips · {category}',
  'guide.notice':
    'Prices, opening hours, fares and entry rules change. Check the official sources linked in this guide before you travel.',

  'itineraries.title': 'Turkey itineraries',
  'itineraries.description':
    'Sample itineraries for Turkey, from a classic week in Istanbul and Cappadocia to longer trips along the coast.',
  'itineraries.heading': 'Itineraries',
  'itineraries.lede': 'Day-by-day trip plans for different trip lengths and interests. Use them as a starting point and adapt.',
  'itineraries.empty': 'Our first itineraries are being reviewed and will appear here soon.',
  'itinerary.eyebrow': '{count}-day itinerary',
  'itinerary.length': 'Trip length',
  'itinerary.dayByDay': 'Day by day',
  'itinerary.day': 'Day {day}: {title}',
  'itinerary.readGuide': 'Read our {title} guide',

  'regions.title': 'Regions of Turkey',
  'regions.description':
    'Explore Turkey region by region, from Istanbul and the Marmara to the Aegean, the Mediterranean and Central Anatolia.',
  'regions.lede': 'Turkey is traditionally divided into seven geographical regions.',
  'regions.count.one': '{count} destination',
  'regions.count.other': '{count} destinations',
  'region.title': '{region} region',
  'region.pageTitle': 'Visiting the {region} region of Turkey',
  'region.itineraries': 'Itineraries through the region',

  'interests.title': 'Things to do in Turkey by interest',
  'interests.description':
    'Find destinations and itineraries in Turkey for history, beaches, nature, food, culture and family travel.',
  'interests.heading': 'Experiences',
  'interests.lede': "Choose what you love doing and we'll show you where to go.",
  'interest.title': '{interest} in Turkey',

  'author.writesAbout': 'Writes about:',
  'author.teamArticles': 'Our guides',
  'author.articles': 'Guides by {name}',
};

export type UiKey = keyof typeof en;

const de: Record<UiKey, string> = {
  'site.tagline': 'Wohin in der Türkei – und was Sie dort erleben können',
  'site.description':
    'Reiseführer, Reiserouten und praktische Tipps für Ihre Türkei-Reise, geprüft von unserer Redaktion.',

  'nav.main': 'Hauptnavigation',
  'nav.menu': 'Menü',
  'nav.destinations': 'Reiseziele',
  'nav.interests': 'Erlebnisse',
  'nav.itineraries': 'Reiserouten',
  'nav.guides': 'Reisetipps',
  'nav.search': 'Suche',
  'nav.home': 'Startseite',
  'nav.skip': 'Zum Inhalt springen',
  'nav.breadcrumb': 'Navigationspfad',
  'nav.language': 'Sprache',
  'nav.thisPageIn': 'Diese Seite auf {language}',

  'footer.explore': 'Entdecken',
  'footer.aboutSite': 'Über diese Website',
  'footer.about': 'Über uns',
  'footer.editorialPolicy': 'Redaktionelle Grundsätze',
  'footer.privacy': 'Datenschutz',
  'footer.cookies': 'Cookies',
  'footer.privacySettings': 'Datenschutzeinstellungen',

  'common.newTab': ' (öffnet in neuem Tab)',
  'common.photo': 'Foto:',
  'common.advertisement': 'Anzeige',
  'common.days.one': '{count} Tag',
  'common.days.other': '{count} Tage',
  'common.goodFor': 'Ideal für',
  'common.destinations': 'Reiseziele',
  'common.itineraries': 'Reiserouten',
  'common.browseByRegion': 'Nach Region',
  'common.browseByInterest': 'Nach Interesse',

  'type.destinations': 'Reiseziel',
  'type.guides': 'Ratgeber',
  'type.itineraries': 'Reiseroute',

  'season.spring': 'Frühling',
  'season.summer': 'Sommer',
  'season.autumn': 'Herbst',
  'season.winter': 'Winter',

  'byline.by': 'Von',
  'byline.reviewed': 'Zuletzt geprüft am',
  'byline.reviewedBy': 'von',
  'byline.notReviewed': 'Noch nicht geprüft',
  'page.updated': 'Zuletzt aktualisiert am',

  'share.heading': 'Diese Seite teilen',
  'share.native': 'Teilen…',
  'share.copy': 'Link kopieren',
  'share.copied': 'Link kopiert',
  'share.copyFailed': 'Der Link konnte nicht kopiert werden. Kopieren Sie ihn bitte aus der Adresszeile.',

  'related.heading': 'Weiter planen',

  'newsletter.heading': 'Besser in die Türkei reisen',
  'newsletter.body':
    'Einmal im Monat per E-Mail: neue Reiseführer, saisonale Tipps und Änderungen, die Reisende betreffen, etwa neue Einreiseregeln. Kein Spam; jederzeit abbestellbar.',
  'newsletter.label': 'E-Mail-Adresse',
  'newsletter.submit': 'Abonnieren',
  'newsletter.note': 'Die E-Mails werden über {provider} versendet.',
  'newsletter.privacy': 'Datenschutzerklärung',

  'search.label': 'Reiseziele und Ratgeber durchsuchen',
  'search.submit': 'Suchen',
  'search.title': 'Suche',
  'search.description': 'Reiseführer, Reisetipps und Reiserouten von Discover Turkey durchsuchen.',
  'search.show': 'Anzeigen',
  'search.everything': 'Alles',
  'search.noscript': 'Die Suche benötigt JavaScript. Sie können stattdessen die Reiseziele oder Reisetipps durchstöbern.',
  'search.searching': 'Suche läuft…',
  'search.results.one': '{count} Ergebnis für „{term}“',
  'search.results.other': '{count} Ergebnisse für „{term}“',
  'search.unavailable': 'Die Suche ist gerade nicht verfügbar. Stöbern Sie stattdessen in den Reisezielen.',

  'notFound.title': 'Seite nicht gefunden',
  'notFound.description': 'Die gesuchte Seite wurde nicht gefunden.',
  'notFound.lede':
    'Die Seite wurde vielleicht verschoben, oder die Adresse enthält einen Tippfehler. Nutzen Sie die Suche oder beginnen Sie auf einer dieser Seiten.',

  'home.lede':
    'Reiseführer, Reiserouten für jeden Tag und praktische Tipps für Ihre Reiseplanung, alle von unserer Redaktion geprüft.',
  'home.featured': 'Ausgewählte Reiseziele',
  'home.seasonal.spring': 'Reiseziele im Frühling',
  'home.seasonal.summer': 'Reiseziele im Sommer',
  'home.seasonal.autumn': 'Reiseziele im Herbst',
  'home.seasonal.winter': 'Reiseziele im Winter',
  'home.plan': 'Reise planen',
  'home.allGuides': 'Alle Reisetipps',
  'home.itineraries': 'Beliebte Reiserouten',
  'home.allItineraries': 'Alle Reiserouten',

  'destinations.title': 'Reiseziele in der Türkei',
  'destinations.description':
    'Die schönsten Reiseziele der Türkei nach Region und Interesse, von Istanbul und Kappadokien bis zur Ägäis- und Mittelmeerküste.',
  'destinations.lede': 'Wohin, was ansehen und wie lange bleiben: Reiseführer, geprüft von unserer Redaktion.',
  'destinations.all': 'Alle Reiseziele',
  'destinations.empty': 'Unsere ersten Reiseführer werden gerade geprüft und erscheinen bald hier.',
  'destination.eyebrow': 'Region {region}',
  'destination.region': 'Region',
  'destination.bestTime': 'Beste Reisezeit',
  'destination.stay': 'Empfohlene Aufenthaltsdauer',
  'destination.attractions': 'Sehenswürdigkeiten und Aktivitäten',
  'destination.gettingThere': 'Anreise',
  'destination.gettingAround': 'Unterwegs vor Ort',
  'destination.food': 'Essen und Erlebnisse',
  'destination.map': 'Karte',
  'destination.googleMaps': '{name} bei Google Maps',
  'destination.osm': '{name} bei OpenStreetMap',

  'guides.title': 'Türkei-Reisetipps und Ratgeber',
  'guides.description':
    'Praktische Ratgeber für Ihre Türkei-Reise: Verkehrsmittel, Geld, mobiles Internet, Umgangsformen, Sicherheit und Reisezeit.',
  'guides.heading': 'Reisetipps',
  'guides.lede': 'Praktische Tipps für Ihre Reiseplanung, von unserer Redaktion mit offiziellen Quellen abgeglichen.',
  'guides.empty': 'Unsere Ratgeber werden gerade geprüft und erscheinen bald hier.',
  'guides.categoryTitle': '{category}: Tipps für die Türkei',
  'guide.eyebrow': 'Reisetipps · {category}',
  'guide.notice':
    'Preise, Öffnungszeiten, Fahrpreise und Einreisebestimmungen ändern sich. Prüfen Sie vor der Reise die offiziellen Quellen, die in diesem Ratgeber verlinkt sind.',

  'itineraries.title': 'Reiserouten für die Türkei',
  'itineraries.description':
    'Beispielrouten für die Türkei, von der klassischen Woche in Istanbul und Kappadokien bis zu längeren Reisen entlang der Küste.',
  'itineraries.heading': 'Reiserouten',
  'itineraries.lede':
    'Tag-für-Tag-Pläne für unterschiedliche Reisedauern und Interessen. Nutzen Sie sie als Ausgangspunkt und passen Sie sie an.',
  'itineraries.empty': 'Unsere ersten Reiserouten werden gerade geprüft und erscheinen bald hier.',
  'itinerary.eyebrow': 'Reiseroute über {count} Tage',
  'itinerary.length': 'Reisedauer',
  'itinerary.dayByDay': 'Tag für Tag',
  'itinerary.day': 'Tag {day}: {title}',
  'itinerary.readGuide': 'Unser Reiseführer: {title}',

  'regions.title': 'Regionen der Türkei',
  'regions.description':
    'Die Türkei Region für Region entdecken, von Istanbul und Marmara über die Ägäis und das Mittelmeer bis Zentralanatolien.',
  'regions.lede': 'Die Türkei wird traditionell in sieben geografische Regionen eingeteilt.',
  'regions.count.one': '{count} Reiseziel',
  'regions.count.other': '{count} Reiseziele',
  'region.title': 'Region {region}',
  'region.pageTitle': 'Reisen in die Region {region}',
  'region.itineraries': 'Reiserouten durch die Region',

  'interests.title': 'Die Türkei nach Interessen entdecken',
  'interests.description':
    'Reiseziele und Reiserouten in der Türkei für Geschichte, Strände, Natur, Kulinarik, Kultur und Familienurlaub.',
  'interests.heading': 'Erlebnisse',
  'interests.lede': 'Wählen Sie, was Sie am liebsten tun, und wir zeigen Ihnen, wohin es gehen kann.',
  'interest.title': '{interest} in der Türkei',

  'author.writesAbout': 'Schreibt über:',
  'author.teamArticles': 'Unsere Artikel',
  'author.articles': 'Artikel von {name}',
};

const UI: Record<Locale, Record<UiKey, string>> = { en, de };

type Vars = Record<string, string | number>;
type PluralKey = { [K in UiKey]: K extends `${infer Base}.one` ? Base : never }[UiKey];

const fill = (text: string, vars: Vars = {}) =>
  text.replace(/\{(\w+)\}/g, (match, name: string) => (name in vars ? String(vars[name]) : match));

export interface Translator {
  (key: UiKey, vars?: Vars): string;
  /** Picks the ".one" or ".other" form for `count` and fills in {count}. */
  plural: (key: PluralKey, count: number, vars?: Vars) => string;
  locale: Locale;
}

export function useTranslations(locale: Locale): Translator {
  const strings = UI[locale] ?? UI[DEFAULT_LOCALE];
  const rules = new Intl.PluralRules(LOCALES[locale].htmlLang);
  const t = ((key: UiKey, vars?: Vars) => fill(strings[key], vars)) as Translator;
  t.plural = (key, count, vars) => {
    const form = rules.select(count) === 'one' ? 'one' : 'other';
    return fill(strings[`${key}.${form}` as UiKey], { count, ...vars });
  };
  t.locale = locale;
  return t;
}

/** All strings for a locale, e.g. to pass a subset to a client script. */
export const uiStrings = (locale: Locale) => UI[locale];
