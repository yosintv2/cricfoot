import type { Metadata } from 'next';
import { fetchMatches } from '@/lib/api';
import { fromSlug, toSlug, toYMD } from '@/lib/utils';
import LeaguePageClient from '@/components/LeaguePageClient';

const STATIC_LEAGUES = [
  'Premier League', 'UEFA Champions League', 'La Liga', 'Serie A',
  'Bundesliga', 'Ligue 1', 'UEFA Europa League', 'FA Cup', 'Copa del Rey',
  'Eredivisie', 'MLS', 'Liga MX', 'Brazilian Série A', 'Turkish Süper Lig',
  'Scottish Premiership',
];

function next7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return toYMD(d);
  });
}

export async function generateStaticParams() {
  const allMatches = (await Promise.all(next7Days().map(fetchMatches))).flat();
  const leagues = new Set<string>(STATIC_LEAGUES);
  allMatches.forEach(m => { if (m.league) leagues.add(m.league); });
  return [...leagues].map(l => ({ name: toSlug(l) }));
}

interface Props {
  params: Promise<{ name: string }>;
}

// Resolve the real league name from the API by slug comparison — slugs are
// lossy, so reconstructing the name from the URL breaks on special characters.
// Next dedupes the underlying fetches between generateMetadata and the page.
async function getLeagueData(nameParam: string) {
  const slug = decodeURIComponent(nameParam);
  const dayData = await Promise.all(
    next7Days().map(async (ymd) => ({ ymd, matches: await fetchMatches(ymd) }))
  );

  let leagueName: string | null = null;
  outer: for (const { matches } of dayData) {
    for (const m of matches) {
      if (m.league && toSlug(m.league) === slug) { leagueName = m.league; break outer; }
    }
  }
  if (!leagueName) {
    leagueName = STATIC_LEAGUES.find(l => toSlug(l) === slug) ?? null;
  }

  const upcomingDays = leagueName
    ? dayData
        .map(({ ymd, matches }) => ({
          ymd,
          matches: matches.filter(m => (m.league ?? '') === leagueName),
        }))
        .filter(d => d.matches.length > 0)
    : [];

  return { leagueName: leagueName ?? fromSlug(slug), upcomingDays };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const { leagueName } = await getLeagueData(name);

  return {
    title: `${leagueName} TV Schedule – Live Matches & Fixtures | CricFoot`,
    description: `Full 7-day ${leagueName} TV schedule on CricFoot. Every match, kick-off time, venue and which TV channels are broadcasting ${leagueName} fixtures live worldwide.`,
    openGraph: {
      title: `${leagueName} TV Schedule | CricFoot`,
      description: `Complete ${leagueName} fixture list with TV channel information for every match.`,
    },
    twitter: {
      title: `${leagueName} TV Guide – CricFoot`,
      description: `Find ${leagueName} matches, kick-off times and broadcasting channels.`,
    },
    alternates: {
      canonical: `/league/${toSlug(leagueName)}`,
    },
  };
}

export default async function LeaguePage({ params }: Props) {
  const { name } = await params;
  const { leagueName, upcomingDays } = await getLeagueData(name);

  const broadcastMap: Record<string, string[]> = {};
  upcomingDays.forEach(({ matches }) =>
    matches.forEach(m =>
      (m.tv_channels ?? []).forEach(tv => {
        const key = tv.country || 'International';
        if (!broadcastMap[key]) broadcastMap[key] = [];
        (tv.channels ?? []).forEach(ch => {
          if (!broadcastMap[key].includes(ch)) broadcastMap[key].push(ch);
        });
      })
    )
  );

  const totalMatches = upcomingDays.reduce((s, d) => s + d.matches.length, 0);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsOrganization',
    name: leagueName,
    sport: 'Football',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.cricfoot.net/' },
        { '@type': 'ListItem', position: 2, name: leagueName },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LeaguePageClient
        leagueName={leagueName}
        upcomingDays={upcomingDays}
        broadcastMap={broadcastMap}
        totalMatches={totalMatches}
      />
    </>
  );
}
