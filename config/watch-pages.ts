export interface WatchPageBroadcaster {
  country: string;
  channels: string[];
}

export interface WatchPageConfig {
  slug: string;
  leagueName: string;
  leagueSlug: string;
  leagueNameMatch?: string;   // exact API league name for filtering (when no leagueId)
  leagueId?: number;          // API league_id for aggregated leagues (e.g. World Cup)
  country?: string;           // if set, filter matches to this country's channels
  countrySlug?: string;
  keywords: string[];
  broadcasters: WatchPageBroadcaster[];
}

export const WATCH_PAGES: WatchPageConfig[] = [
  {
    slug: 'champions-league',
    leagueName: 'UEFA Champions League',
    leagueSlug: 'champions-l',
    leagueNameMatch: 'UEFA Champions League',
    keywords: ['where to watch champions league', 'champions league tv channel', 'champions league live tv', 'what channel is champions league on', 'champions league broadcast'],
    broadcasters: [
      { country: 'United States', channels: ['CBS Sports', 'Paramount+', 'TUDN', 'Univision'] },
      { country: 'United Kingdom', channels: ['TNT Sports', 'discovery+'] },
      { country: 'India', channels: ['Sony Ten', 'SonyLIV'] },
      { country: 'Australia', channels: ['Stan Sport', 'beIN Sports'] },
      { country: 'Canada', channels: ['DAZN'] },
      { country: 'Germany', channels: ['DAZN'] },
      { country: 'Spain', channels: ['Movistar+'] },
    ],
  },
  {
    slug: 'premier-league',
    leagueName: 'Premier League',
    leagueSlug: 'epl',
    leagueNameMatch: 'Premier League',
    keywords: ['where to watch premier league', 'premier league tv channel', 'premier league live tv', 'what channel is premier league on', 'epl tv channel'],
    broadcasters: [
      { country: 'United States', channels: ['USA Network', 'NBC Sports', 'Peacock', 'Telemundo'] },
      { country: 'United Kingdom', channels: ['Sky Sports', 'TNT Sports', 'Amazon Prime Video'] },
      { country: 'India', channels: ['Star Sports', 'Disney+ Hotstar'] },
      { country: 'Australia', channels: ['Optus Sport'] },
      { country: 'Canada', channels: ['Fubo TV', 'DAZN'] },
      { country: 'Ireland', channels: ['Sky Sports', 'Virgin Media'] },
      { country: 'Nigeria', channels: ['SuperSport'] },
    ],
  },
  {
    slug: 'world-cup-2026',
    leagueName: 'FIFA World Cup 2026',
    leagueSlug: 'world-cup',
    leagueId: 16,
    keywords: ['where to watch world cup 2026', 'world cup 2026 tv channel', 'world cup live tv', 'what channel is world cup on 2026', 'world cup 2026 broadcast'],
    broadcasters: [
      { country: 'United States', channels: ['Fox Sports', 'Fox', 'Telemundo', 'Peacock'] },
      { country: 'United Kingdom', channels: ['BBC', 'ITV'] },
      { country: 'India', channels: ['Sony Sports', 'SonyLIV', 'JioCinema'] },
      { country: 'Australia', channels: ['SBS', 'Optus Sport'] },
      { country: 'Canada', channels: ['TSN', 'CTV', 'RDS'] },
      { country: 'Germany', channels: ['ARD', 'ZDF', 'MagentaTV'] },
      { country: 'Spain', channels: ['RTVE', 'TVE'] },
      { country: 'Brazil', channels: ['Globo', 'SporTV', 'CazéTV'] },
    ],
  },
  {
    slug: 'la-liga',
    leagueName: 'La Liga',
    leagueSlug: 'la-liga',
    leagueNameMatch: 'La Liga',
    keywords: ['where to watch la liga', 'la liga tv channel', 'la liga live tv', 'what channel is la liga on', 'laliga broadcast'],
    broadcasters: [
      { country: 'United States', channels: ['ESPN', 'ESPN+', 'ABC', 'ESPN Deportes'] },
      { country: 'United Kingdom', channels: ['Premier Sports', 'LaLigaTV'] },
      { country: 'India', channels: ['GXR World'] },
      { country: 'Australia', channels: ['beIN Sports'] },
      { country: 'Canada', channels: ['TSN', 'beIN Sports Canada'] },
    ],
  },
  {
    slug: 'serie-a',
    leagueName: 'Serie A',
    leagueSlug: 'serie-a',
    leagueNameMatch: 'Serie A',
    keywords: ['where to watch serie a', 'serie a tv channel', 'serie a live tv', 'what channel is serie a on', 'italian football live'],
    broadcasters: [
      { country: 'United States', channels: ['Paramount+', 'CBS Sports Golazo'] },
      { country: 'United Kingdom', channels: ['Premier Sports', 'TNT Sports'] },
      { country: 'India', channels: ['Sony Sports', 'SonyLIV'] },
      { country: 'Australia', channels: ['beIN Sports'] },
      { country: 'Canada', channels: ['DAZN'] },
    ],
  },
  {
    slug: 'bundesliga',
    leagueName: 'Bundesliga',
    leagueSlug: 'bundesliga',
    leagueNameMatch: 'Bundesliga',
    keywords: ['where to watch bundesliga', 'bundesliga tv channel', 'bundesliga live tv', 'what channel is bundesliga on', 'german football live'],
    broadcasters: [
      { country: 'United States', channels: ['ESPN+'] },
      { country: 'United Kingdom', channels: ['TNT Sports', 'discovery+'] },
      { country: 'India', channels: ['Sony Sports', 'SonyLIV'] },
      { country: 'Australia', channels: ['beIN Sports'] },
      { country: 'Canada', channels: ['DAZN'] },
    ],
  },
  {
    slug: 'ligue-1',
    leagueName: 'Ligue 1',
    leagueSlug: 'ligue-1',
    leagueNameMatch: 'Ligue 1',
    keywords: ['where to watch ligue 1', 'ligue 1 tv channel', 'ligue 1 live tv', 'what channel is ligue 1 on', 'french football live'],
    broadcasters: [
      { country: 'United States', channels: ['beIN Sports', 'beIN Sports Connect'] },
      { country: 'United Kingdom', channels: ['beIN Sports'] },
      { country: 'India', channels: ['beIN Sports'] },
      { country: 'Australia', channels: ['beIN Sports'] },
      { country: 'Canada', channels: ['beIN Sports Canada'] },
    ],
  },
  {
    slug: 'champions-league-usa',
    leagueName: 'UEFA Champions League',
    leagueSlug: 'champions-l',
    leagueNameMatch: 'UEFA Champions League',
    country: 'United States',
    countrySlug: 'united-states',
    keywords: ['champions league tv usa', 'what channel is champions league on in usa', 'champions league american tv', 'watch champions league in america', 'ucl tv channel usa'],
    broadcasters: [
      { country: 'United States', channels: ['CBS Sports', 'Paramount+', 'TUDN', 'Univision'] },
    ],
  },
  {
    slug: 'premier-league-usa',
    leagueName: 'Premier League',
    leagueSlug: 'epl',
    leagueNameMatch: 'Premier League',
    country: 'United States',
    countrySlug: 'united-states',
    keywords: ['premier league tv usa', 'what channel is premier league on in usa', 'watch premier league in usa', 'epl usa channel', 'nbc premier league'],
    broadcasters: [
      { country: 'United States', channels: ['USA Network', 'NBC Sports', 'Peacock', 'Telemundo'] },
    ],
  },
  {
    slug: 'premier-league-india',
    leagueName: 'Premier League',
    leagueSlug: 'epl',
    leagueNameMatch: 'Premier League',
    country: 'India',
    countrySlug: 'india',
    keywords: ['premier league tv india', 'premier league channel india', 'watch premier league in india', 'epl india broadcast', 'hotstar premier league'],
    broadcasters: [
      { country: 'India', channels: ['Star Sports', 'Disney+ Hotstar'] },
    ],
  },
  {
    slug: 'world-cup-2026-usa',
    leagueName: 'FIFA World Cup 2026',
    leagueSlug: 'world-cup',
    leagueId: 16,
    country: 'United States',
    countrySlug: 'united-states',
    keywords: ['world cup 2026 tv usa', 'world cup channel usa', 'watch world cup in usa', 'fox sports world cup 2026', 'telemundo world cup 2026'],
    broadcasters: [
      { country: 'United States', channels: ['Fox Sports', 'Fox', 'Telemundo', 'Peacock'] },
    ],
  },
  {
    slug: 'world-cup-2026-uk',
    leagueName: 'FIFA World Cup 2026',
    leagueSlug: 'world-cup',
    leagueId: 16,
    country: 'United Kingdom',
    countrySlug: 'united-kingdom',
    keywords: ['world cup 2026 tv uk', 'world cup channel uk', 'watch world cup in uk', 'bbc world cup 2026', 'itv world cup 2026'],
    broadcasters: [
      { country: 'United Kingdom', channels: ['BBC', 'ITV'] },
    ],
  },
];
