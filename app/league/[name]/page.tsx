import type { Metadata } from 'next';
import { fetchMatches } from '@/lib/api';
import { fromSlug, toSlug, toYMD, todayYMD } from '@/lib/utils';
import LeaguePageClient from '@/components/LeaguePageClient';

const STATIC_LEAGUES = [
  'Premier League', 'UEFA Champions League', 'La Liga', 'Serie A',
  'Bundesliga', 'Ligue 1', 'UEFA Europa League', 'FA Cup', 'Copa del Rey',
  'Eredivisie', 'MLS', 'Liga MX', 'Brazilian Série A', 'Turkish Süper Lig',
  'Scottish Premiership',
];

export async function generateStaticParams() {
  const matches = await fetchMatches(todayYMD());
  const leagues = new Set<string>(STATIC_LEAGUES);
  matches.forEach(m => { if (m.league) leagues.add(m.league); });
  return [...leagues].map(l => ({ name: toSlug(l) }));
}

interface Props {
  params: Promise<{ name: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const leagueName = fromSlug(name);

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
  const leagueName = fromSlug(name);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return toYMD(d);
  });

  const upcomingDays = (
    await Promise.all(
      days.map(async (ymd) => {
        const all = await fetchMatches(ymd);
        const matches = all.filter(m => (m.league ?? '') === leagueName);
        return { ymd, matches };
      })
    )
  ).filter(d => d.matches.length > 0);

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
