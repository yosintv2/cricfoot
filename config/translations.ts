export const SUPPORTED_LANGS = ['es', 'fr', 'de', 'pt', 'it'] as const;
export type Lang = typeof SUPPORTED_LANGS[number];

export interface LangStrings {
  // Meta
  siteTitle: string;
  siteDesc: string;
  // Page hero
  h1: string;
  sub: string;
  // Nav/UI
  back: string;
  today: string;
  tomorrow: string;
  tonight: string;
  thisWeekend: string;
  allChannels: string;
  allCountries: string;
  matches: string;         // "matches" (plural label)
  match: string;           // "match" (singular label)
  schedule: string;        // "schedule"
  kickoff: string;         // "Kick-off"
  channel: string;         // "channel"
  channels: string;        // "channels"
  country: string;         // "country"
  noMatches: string;       // empty state
  // Watch page
  watchTitle: (league: string) => string;
  watchTitleCountry: (league: string, country: string) => string;
  watchDesc: (league: string) => string;
  watchDescCountry: (league: string, country: string) => string;
  whereToWatch: string;    // "Where to watch"
  broadcaster: string;     // "Broadcaster / Streaming"
  upcomingFixtures: string;
  viewFullSchedule: string;
  disclaimer: string;
  // FAQ
  faq1q: (league: string) => string;
  faq1a: (league: string, channels: string) => string;
  faq2q: (league: string) => string;
  faq2a: string;
  faq3q: string;
  faq3a: string;
  // SEO section
  seoH2: string;
  seoPara: string;
}

export interface LangConfig {
  name: string;
  nativeName: string;
  flag: string;
  locale: string;
  t: LangStrings;
}

export const LANG_CONFIG: Record<Lang, LangConfig> = {
  es: {
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    locale: 'es',
    t: {
      siteTitle: 'Fútbol en Vivo Hoy por TV – Partidos y Canales | CricFoot',
      siteDesc: 'Partidos de fútbol en vivo hoy por TV con horarios en tu zona horaria local y los canales que transmiten cada partido en directo en todo el mundo. Guía TV gratuita.',
      h1: 'Fútbol en Vivo Hoy por TV',
      sub: 'Todos los partidos, horarios y canales de televisión de hoy.',
      back: '← Atrás',
      today: 'Hoy',
      tomorrow: 'Mañana',
      tonight: 'Esta noche',
      thisWeekend: 'Este fin de semana',
      allChannels: 'Todos los canales',
      allCountries: 'Todos los países',
      matches: 'partidos',
      match: 'partido',
      schedule: 'horario',
      kickoff: 'Inicio',
      channel: 'canal',
      channels: 'canales',
      country: 'país',
      noMatches: 'No hay partidos programados hoy. Consulta mañana.',
      watchTitle: (l) => `¿Dónde ver ${l} en TV?`,
      watchTitleCountry: (l, c) => `¿Dónde ver ${l} en TV en ${c}?`,
      watchDesc: (l) => `Cómo ver ${l} en directo por TV: canales en todos los países, servicios de streaming, horarios y la programación completa de los próximos 30 días.`,
      watchDescCountry: (l, c) => `Cómo ver ${l} en ${c}: todos los canales de televisión, plataformas de streaming y horarios en tu zona horaria local.`,
      whereToWatch: '¿Dónde ver?',
      broadcaster: 'Canales TV / Streaming',
      upcomingFixtures: 'Próximos partidos',
      viewFullSchedule: 'Ver calendario completo →',
      disclaimer: 'Los derechos de transmisión varían según el partido y el territorio. CricFoot es una guía TV y no emite ni retransmite ningún contenido.',
      faq1q: (l) => `¿En qué canal se ve ${l}?`,
      faq1a: (l, ch) => `${l} se puede ver en ${ch}. Haz clic en cualquier partido para ver la lista completa de canales por país.`,
      faq2q: (l) => `¿Se puede ver ${l} por internet?`,
      faq2a: 'Sí, la mayoría de los canales oficiales ofrecen una app o servicio de streaming. CricFoot es solo una guía de TV y no ofrece streams ni retransmisiones.',
      faq3q: '¿Los horarios están en mi zona horaria?',
      faq3a: 'Sí, todos los horarios de inicio en CricFoot se convierten automáticamente a la zona horaria de tu dispositivo.',
      seoH2: 'Fútbol en directo por TV hoy',
      seoPara: 'CricFoot es tu guía de televisión para el fútbol en vivo. Consulta todos los partidos de hoy con horarios locales y los canales que los emiten en tu país. Cobertura mundial: Champions League, Premier League, La Liga, Serie A, Bundesliga, Ligue 1 y más.',
    },
  },

  fr: {
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    locale: 'fr',
    t: {
      siteTitle: 'Football en Direct à la TV Aujourd\'hui – Matchs et Chaînes | CricFoot',
      siteDesc: 'Tous les matchs de football en direct à la TV aujourd\'hui avec les horaires dans votre fuseau horaire et les chaînes qui diffusent chaque rencontre dans le monde entier.',
      h1: 'Football en Direct à la TV Aujourd\'hui',
      sub: 'Tous les matchs, horaires et chaînes TV du jour.',
      back: '← Retour',
      today: 'Aujourd\'hui',
      tomorrow: 'Demain',
      tonight: 'Ce soir',
      thisWeekend: 'Ce week-end',
      allChannels: 'Toutes les chaînes',
      allCountries: 'Tous les pays',
      matches: 'matchs',
      match: 'match',
      schedule: 'programme',
      kickoff: 'Coup d\'envoi',
      channel: 'chaîne',
      channels: 'chaînes',
      country: 'pays',
      noMatches: 'Aucun match prévu aujourd\'hui. Revenez demain.',
      watchTitle: (l) => `Où voir ${l} à la TV ?`,
      watchTitleCountry: (l, c) => `Où voir ${l} à la TV en ${c} ?`,
      watchDesc: (l) => `Comment regarder ${l} en direct à la TV : chaînes dans tous les pays, services de streaming, horaires et le programme complet des 30 prochains jours.`,
      watchDescCountry: (l, c) => `Comment regarder ${l} en ${c} : toutes les chaînes TV, plateformes de streaming et horaires dans votre fuseau horaire local.`,
      whereToWatch: 'Où regarder ?',
      broadcaster: 'Chaînes TV / Streaming',
      upcomingFixtures: 'Prochains matchs',
      viewFullSchedule: 'Voir le calendrier complet →',
      disclaimer: 'Les droits de diffusion varient selon le match et le territoire. CricFoot est un guide TV uniquement et ne diffuse aucun contenu.',
      faq1q: (l) => `Sur quelle chaîne passe ${l} ?`,
      faq1a: (l, ch) => `${l} est diffusé sur ${ch}. Cliquez sur n'importe quel match pour voir la liste complète des chaînes par pays.`,
      faq2q: (l) => `Peut-on regarder ${l} en streaming ?`,
      faq2a: 'Oui, la plupart des diffuseurs officiels proposent une application ou un service de streaming. CricFoot est uniquement un guide TV et ne propose pas de flux ni de retransmissions.',
      faq3q: 'Les horaires sont-ils dans mon fuseau horaire ?',
      faq3a: 'Oui, tous les horaires de coup d\'envoi sur CricFoot sont automatiquement convertis dans le fuseau horaire de votre appareil.',
      seoH2: 'Football en direct à la TV aujourd\'hui',
      seoPara: 'CricFoot est votre guide TV pour le football en direct. Retrouvez tous les matchs du jour avec les horaires locaux et les chaînes qui les diffusent dans votre pays. Couverture mondiale : Champions League, Premier League, La Liga, Serie A, Bundesliga, Ligue 1 et plus encore.',
    },
  },

  de: {
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    locale: 'de',
    t: {
      siteTitle: 'Fußball Live Heute im TV – Spiele und Sender | CricFoot',
      siteDesc: 'Alle Fußballspiele live heute im TV mit Anstoßzeiten in deiner lokalen Zeitzone und den Sendern, die jedes Spiel weltweit übertragen. Kostenloser TV-Guide.',
      h1: 'Fußball Live Heute im TV',
      sub: 'Alle Spiele, Anstoßzeiten und TV-Sender von heute.',
      back: '← Zurück',
      today: 'Heute',
      tomorrow: 'Morgen',
      tonight: 'Heute Abend',
      thisWeekend: 'Dieses Wochenende',
      allChannels: 'Alle Sender',
      allCountries: 'Alle Länder',
      matches: 'Spiele',
      match: 'Spiel',
      schedule: 'Spielplan',
      kickoff: 'Anstoß',
      channel: 'Sender',
      channels: 'Sender',
      country: 'Land',
      noMatches: 'Heute keine Spiele geplant. Schau morgen wieder vorbei.',
      watchTitle: (l) => `Wo läuft ${l} heute live im TV?`,
      watchTitleCountry: (l, c) => `Wo läuft ${l} heute live in ${c}?`,
      watchDesc: (l) => `So siehst du ${l} live im TV: Sender in allen Ländern, Streaming-Dienste, Anstoßzeiten und der komplette Spielplan der nächsten 30 Tage.`,
      watchDescCountry: (l, c) => `So siehst du ${l} in ${c}: alle TV-Sender, Streaming-Plattformen und Anstoßzeiten in deiner lokalen Zeitzone.`,
      whereToWatch: 'Wo schauen?',
      broadcaster: 'TV-Sender / Streaming',
      upcomingFixtures: 'Kommende Spiele',
      viewFullSchedule: 'Vollständigen Spielplan anzeigen →',
      disclaimer: 'Übertragungsrechte variieren je nach Spiel und Region. CricFoot ist nur ein TV-Guide und überträgt oder streamt keine Inhalte.',
      faq1q: (l) => `Auf welchem Sender läuft ${l}?`,
      faq1a: (l, ch) => `${l} wird auf ${ch} übertragen. Klicke auf ein beliebiges Spiel, um die vollständige Senderliste nach Land zu sehen.`,
      faq2q: (l) => `Kann man ${l} online streamen?`,
      faq2a: 'Ja, die meisten offiziellen Sender bieten eine App oder einen Streaming-Dienst an. CricFoot ist nur ein TV-Guide und bietet keine Streams oder Übertragungen an.',
      faq3q: 'Werden die Anstoßzeiten in meiner Zeitzone angezeigt?',
      faq3a: 'Ja, alle Anstoßzeiten auf CricFoot werden automatisch in die Zeitzone deines Geräts umgerechnet.',
      seoH2: 'Fußball live heute im TV',
      seoPara: 'CricFoot ist dein TV-Guide für Fußball live. Alle Spiele von heute auf einen Blick – mit lokalen Anstoßzeiten und den Sendern, die in deinem Land übertragen. Weltweite Abdeckung: Champions League, Premier League, La Liga, Serie A, Bundesliga, Ligue 1 und viele mehr.',
    },
  },

  pt: {
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇵🇹',
    locale: 'pt',
    t: {
      siteTitle: 'Futebol ao Vivo na TV Hoje – Jogos e Canais | CricFoot',
      siteDesc: 'Todos os jogos de futebol ao vivo na TV hoje com horários no seu fuso horário local e os canais que transmitem cada jogo em todo o mundo. Guia TV gratuito.',
      h1: 'Futebol ao Vivo na TV Hoje',
      sub: 'Todos os jogos, horários e canais de TV de hoje.',
      back: '← Voltar',
      today: 'Hoje',
      tomorrow: 'Amanhã',
      tonight: 'Esta noite',
      thisWeekend: 'Este fim de semana',
      allChannels: 'Todos os canais',
      allCountries: 'Todos os países',
      matches: 'jogos',
      match: 'jogo',
      schedule: 'calendário',
      kickoff: 'Início',
      channel: 'canal',
      channels: 'canais',
      country: 'país',
      noMatches: 'Nenhum jogo agendado hoje. Volte amanhã.',
      watchTitle: (l) => `Onde ver ${l} na TV?`,
      watchTitleCountry: (l, c) => `Onde ver ${l} na TV em ${c}?`,
      watchDesc: (l) => `Como assistir ${l} ao vivo na TV: canais em todos os países, serviços de streaming, horários e a programação completa dos próximos 30 dias.`,
      watchDescCountry: (l, c) => `Como assistir ${l} em ${c}: todos os canais de TV, plataformas de streaming e horários no seu fuso horário local.`,
      whereToWatch: 'Onde assistir?',
      broadcaster: 'Canais TV / Streaming',
      upcomingFixtures: 'Próximos jogos',
      viewFullSchedule: 'Ver calendário completo →',
      disclaimer: 'Os direitos de transmissão variam conforme o jogo e o território. CricFoot é apenas um guia de TV e não transmite nem exibe nenhum conteúdo.',
      faq1q: (l) => `Em que canal passa ${l}?`,
      faq1a: (l, ch) => `${l} é transmitido em ${ch}. Clique em qualquer jogo para ver a lista completa de canais por país.`,
      faq2q: (l) => `Dá para ver ${l} online?`,
      faq2a: 'Sim, a maioria dos transmissores oficiais oferece um aplicativo ou serviço de streaming. CricFoot é apenas um guia de TV e não oferece streams.',
      faq3q: 'Os horários estão no meu fuso horário?',
      faq3a: 'Sim, todos os horários de início no CricFoot são convertidos automaticamente para o fuso horário do seu dispositivo.',
      seoH2: 'Futebol ao vivo na TV hoje',
      seoPara: 'CricFoot é o seu guia de TV para futebol ao vivo. Veja todos os jogos de hoje com horários locais e os canais que transmitem no seu país. Cobertura mundial: Champions League, Premier League, La Liga, Serie A, Bundesliga, Ligue 1 e muito mais.',
    },
  },

  it: {
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    locale: 'it',
    t: {
      siteTitle: 'Calcio in Diretta TV Oggi – Partite e Canali | CricFoot',
      siteDesc: 'Tutte le partite di calcio in diretta TV oggi con gli orari nel tuo fuso orario locale e i canali che trasmettono ogni partita in tutto il mondo. Guida TV gratuita.',
      h1: 'Calcio in Diretta TV Oggi',
      sub: 'Tutte le partite, gli orari e i canali TV di oggi.',
      back: '← Indietro',
      today: 'Oggi',
      tomorrow: 'Domani',
      tonight: 'Stasera',
      thisWeekend: 'Questo fine settimana',
      allChannels: 'Tutti i canali',
      allCountries: 'Tutti i paesi',
      matches: 'partite',
      match: 'partita',
      schedule: 'calendario',
      kickoff: 'Calcio d\'inizio',
      channel: 'canale',
      channels: 'canali',
      country: 'paese',
      noMatches: 'Nessuna partita in programma oggi. Torna domani.',
      watchTitle: (l) => `Dove vedere ${l} in TV?`,
      watchTitleCountry: (l, c) => `Dove vedere ${l} in TV in ${c}?`,
      watchDesc: (l) => `Come guardare ${l} in diretta TV: canali in tutti i paesi, servizi di streaming, orari e il programma completo dei prossimi 30 giorni.`,
      watchDescCountry: (l, c) => `Come guardare ${l} in ${c}: tutti i canali TV, piattaforme di streaming e orari nel tuo fuso orario locale.`,
      whereToWatch: 'Dove guardare?',
      broadcaster: 'Canali TV / Streaming',
      upcomingFixtures: 'Prossime partite',
      viewFullSchedule: 'Vedi calendario completo →',
      disclaimer: 'I diritti di trasmissione variano in base alla partita e al territorio. CricFoot è solo una guida TV e non trasmette né diffonde alcun contenuto.',
      faq1q: (l) => `Su quale canale va ${l}?`,
      faq1a: (l, ch) => `${l} viene trasmesso su ${ch}. Clicca su qualsiasi partita per vedere l'elenco completo dei canali per paese.`,
      faq2q: (l) => `Si può vedere ${l} in streaming?`,
      faq2a: 'Sì, la maggior parte dei broadcaster ufficiali offre un\'app o un servizio di streaming. CricFoot è solo una guida TV e non offre stream o trasmissioni.',
      faq3q: 'Gli orari sono nel mio fuso orario?',
      faq3a: 'Sì, tutti gli orari di calcio d\'inizio su CricFoot vengono convertiti automaticamente nel fuso orario del tuo dispositivo.',
      seoH2: 'Calcio in diretta TV oggi',
      seoPara: 'CricFoot è la tua guida TV per il calcio in diretta. Trova tutte le partite di oggi con gli orari locali e i canali che le trasmettono nel tuo paese. Copertura mondiale: Champions League, Premier League, La Liga, Serie A, Bundesliga, Ligue 1 e molto altro.',
    },
  },
};

// Map of lang → translated "where to watch" path segment
export const WATCH_SEGMENT: Record<Lang, string> = {
  es: 'ver',
  fr: 'voir',
  de: 'sehen',
  pt: 'ver',
  it: 'vedere',
};
