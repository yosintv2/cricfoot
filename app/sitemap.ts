import { MetadataRoute } from 'next';
import { fetchMatches } from '@/lib/api';
import { toSlug, matchSlug, pairSlug, splitFixture, scheduleDays, allScheduleDays, isoFromYMD } from '@/lib/utils';
import { QUICK_LEAGUES } from '@/config/leagues';


export const dynamic = 'force-static';

const SITE_URL = 'https://www.cricfoot.net';

const STATIC_LEAGUES = [
  'Premier League', 'UEFA Champions League', 'La Liga', 'Serie A',
  'Bundesliga', 'Ligue 1', 'UEFA Europa League', 'FA Cup', 'Copa del Rey',
  'Eredivisie', 'MLS', 'Liga MX', 'Brazilian Série A', 'Turkish Süper Lig',
  'Scottish Premiership',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dayMatches = await Promise.all(
    scheduleDays().map(async ymd => ({ ymd, matches: await fetchMatches(ymd) }))
  );

  const channels = new Set<string>();
  const leagues = new Set<string>(STATIC_LEAGUES);
  const matchSlugs = new Set<string>();
  const teamSlugs = new Set<string>();
  const fixtureSlugs = new Set<string>();
  const countrySlugs = new Set<string>();
  const leagueCountryCombos = new Set<string>();
  const watchLeagueSlugs = new Set<string>();
  const watchLeagueCountryCombos = new Set<string>();

  dayMatches.forEach(({ ymd, matches }) =>
    matches.forEach(m => {
      if (m.league) leagues.add(m.league);
      if (m.fixture) matchSlugs.add(matchSlug(ymd, m.fixture));
      const teams = splitFixture(m.fixture);
      if (teams) {
        teamSlugs.add(toSlug(teams[0]));
        teamSlugs.add(toSlug(teams[1]));
        fixtureSlugs.add(pairSlug(teams[0], teams[1]));
      }
      // Determine the watch slug (QUICK_LEAGUES label slug takes priority over raw league slug)
      const cfg = m.league ? QUICK_LEAGUES.find(l => l.id != null && l.id === m.league_id) : null;
      const watchSlug = cfg ? toSlug(cfg.label) : (m.league ? toSlug(m.league) : null);
      if (watchSlug) watchLeagueSlugs.add(watchSlug);

      (m.tv_channels ?? []).forEach(tv => {
        if (tv.country && toSlug(tv.country)) {
          countrySlugs.add(toSlug(tv.country));
          if (m.league) leagueCountryCombos.add(`${toSlug(m.league)}|${toSlug(tv.country)}`);
          if (watchSlug) watchLeagueCountryCombos.add(`${watchSlug}|${toSlug(tv.country)}`);
        }
        (tv.channels ?? []).forEach(ch => channels.add(ch));
      });
    })
  );

  const now = new Date();

  const channelUrls: MetadataRoute.Sitemap = [...channels].map(ch => ({
    url: `${SITE_URL}/channel/${toSlug(ch)}/`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  const leagueUrls: MetadataRoute.Sitemap = [...leagues].map(l => ({
    url: `${SITE_URL}/league/${toSlug(l)}/`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  const matchUrls: MetadataRoute.Sitemap = [...matchSlugs].map(slug => ({
    url: `${SITE_URL}/match/${slug}/`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.6,
  }));

  const teamUrls: MetadataRoute.Sitemap = [...teamSlugs].map(slug => ({
    url: `${SITE_URL}/team/${slug}/`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  const fixtureUrls: MetadataRoute.Sitemap = [...fixtureSlugs].map(slug => ({
    url: `${SITE_URL}/fixtures/${slug}/`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.6,
  }));

  const countryUrls: MetadataRoute.Sitemap = [...countrySlugs].map(slug => ({
    url: `${SITE_URL}/country/${slug}/`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  const leagueCountryUrls: MetadataRoute.Sitemap = [...leagueCountryCombos].map(combo => {
    const [league, country] = combo.split('|');
    return {
      url: `${SITE_URL}/league/${league}/country/${country}/`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.75,
    };
  });

  const scheduleUrls: MetadataRoute.Sitemap = allScheduleDays().map(ymd => ({
    url: `${SITE_URL}/schedules/${isoFromYMD(ymd)}/`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'hourly', priority: 1 },
    ...scheduleUrls,
    { url: `${SITE_URL}/world-cup-2026/`, lastModified: now, changeFrequency: 'hourly', priority: 1 },
    { url: `${SITE_URL}/tonight/`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/tomorrow/`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/this-weekend/`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/watch/`, lastModified: now, changeFrequency: 'hourly', priority: 0.95 },
    { url: `${SITE_URL}/channels/`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/countries/`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/about/`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/privacy/`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    ...[...watchLeagueSlugs].map(slug => ({
      url: `${SITE_URL}/watch/${slug}/`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.85,
    })),
    ...[...watchLeagueCountryCombos].map(combo => {
      const [league, country] = combo.split('|');
      return {
        url: `${SITE_URL}/watch/${league}/${country}/`,
        lastModified: now,
        changeFrequency: 'daily' as const,
        priority: 0.8,
      };
    }),
    // Spanish (es) pages
    { url: `${SITE_URL}/es/`, lastModified: now, changeFrequency: 'hourly' as const, priority: 0.95 },
    { url: `${SITE_URL}/es/ver/`, lastModified: now, changeFrequency: 'hourly' as const, priority: 0.9 },
    ...[...watchLeagueSlugs].map(slug => ({
      url: `${SITE_URL}/es/ver/${slug}/`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),
    ...[...watchLeagueCountryCombos].map(combo => {
      const [league, country] = combo.split('|');
      return {
        url: `${SITE_URL}/es/ver/${league}/${country}/`,
        lastModified: now,
        changeFrequency: 'daily' as const,
        priority: 0.75,
      };
    }),
    ...leagueUrls,
    ...leagueCountryUrls,
    ...countryUrls,
    ...teamUrls,
    ...channelUrls,
    ...fixtureUrls,
    ...matchUrls,
  ];
}
