import type { Metadata } from 'next';
import { fetchMatches } from '@/lib/api';
import { fromSlug, toSlug, toYMD } from '@/lib/utils';
import { QUICK_LEAGUES } from '@/config/leagues';
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
  const ids = new Set<number>();
  QUICK_LEAGUES.forEach(l => { if (l.id != null) ids.add(l.id); });
  allMatches.forEach(m => {
    if (m.league) leagues.add(m.league);
    if (m.league_id != null) ids.add(m.league_id);
  });
  return [
    ...[...leagues].map(l => ({ name: toSlug(l) })),
    ...[...ids].map(id => ({ name: String(id) })),
  ];
}

interface Props {
  params: Promise<{ name: string }>;
}

// Resolve the league from the URL param. Numeric params are API league_ids
// (e.g. /league/16/ = FIFA World Cup) and aggregate every league name sharing
// that id ("FIFA World Cup, Group A", "Group B", …). Name params resolve the
// real name by slug comparison — slugs are lossy, so the name can't be
// reconstructed from the URL. Next dedupes the underlying fetches between
// generateMetadata and the page.
async function getLeagueData(nameParam: string) {
  const slug = decodeURIComponent(nameParam);
  const dayData = await Promise.all(
    next7Days().map(async (ymd) => ({ ymd, matches: await fetchMatches(ymd) }))
  );

  if (/^\d+$/.test(slug)) {
    const id = Number(slug);
    let leagueName: string | null = null;
    outer: for (const { matches } of dayData) {
      for (const m of matches) {
        if (m.league_id === id && m.league) {
          // strip group/stage suffix: "FIFA World Cup, Group A" → "FIFA World Cup"
          leagueName = m.league.split(',')[0].trim();
          break outer;
        }
      }
    }
    const upcomingDays = dayData
      .map(({ ymd, matches }) => ({ ymd, matches: matches.filter(m => m.league_id === id) }))
      .filter(d => d.matches.length > 0);
    const configName = QUICK_LEAGUES.find(l => l.id === id)?.label;
    return { leagueName: leagueName ?? configName ?? `League ${id}`, upcomingDays };
  }

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
      canonical: `/league/${/^\d+$/.test(decodeURIComponent(name)) ? name : toSlug(leagueName)}`,
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
