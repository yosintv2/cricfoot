import { MetadataRoute } from 'next';
import { fetchMatches } from '@/lib/api';
import { todayYMD, toSlug, toYMD } from '@/lib/utils';

export const dynamic = 'force-static';

const SITE_URL = 'https://www.cricfoot.net';

const STATIC_LEAGUES = [
  'Premier League', 'UEFA Champions League', 'La Liga', 'Serie A',
  'Bundesliga', 'Ligue 1', 'UEFA Europa League', 'FA Cup', 'Copa del Rey',
  'Eredivisie', 'MLS', 'Liga MX', 'Brazilian Série A', 'Turkish Süper Lig',
  'Scottish Premiership',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i); return toYMD(d);
  });
  const allMatches = (await Promise.all(days.map(fetchMatches))).flat();

  const channels = new Set<string>();
  const leagues = new Set<string>(STATIC_LEAGUES);

  allMatches.forEach(m => {
    if (m.league) leagues.add(m.league);
    (m.tv_channels ?? []).forEach(tv => (tv.channels ?? []).forEach(ch => channels.add(ch)));
  });

  const now = new Date();

  const channelUrls: MetadataRoute.Sitemap = [...channels].map(ch => ({
    url: `${SITE_URL}/channel/${toSlug(ch)}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  const leagueUrls: MetadataRoute.Sitemap = [...leagues].map(l => ({
    url: `${SITE_URL}/league/${toSlug(l)}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  return [
    { url: SITE_URL, lastModified: now, changeFrequency: 'hourly', priority: 1 },
    { url: `${SITE_URL}/channels`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    ...leagueUrls,
    ...channelUrls,
  ];
}
