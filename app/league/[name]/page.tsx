import type { Metadata } from 'next';
import { fetchMatches } from '@/lib/api';
import { fromSlug, toSlug, scheduleDays } from '@/lib/utils';
import { QUICK_LEAGUES } from '@/config/leagues';
import LeaguePageClient from '@/components/LeaguePageClient';
import Faq from '@/components/Faq';

const STATIC_LEAGUES = [
  'Premier League', 'UEFA Champions League', 'La Liga', 'Serie A',
  'Bundesliga', 'Ligue 1', 'UEFA Europa League', 'FA Cup', 'Copa del Rey',
  'Eredivisie', 'MLS', 'Liga MX', 'Brazilian Série A', 'Turkish Süper Lig',
  'Scottish Premiership',
];

export async function generateStaticParams() {
  const allMatches = (await Promise.all(scheduleDays().map(fetchMatches))).flat();
  const slugs = new Set<string>();
  STATIC_LEAGUES.forEach(l => slugs.add(toSlug(l)));
  QUICK_LEAGUES.forEach(l => slugs.add(toSlug(l.label)));
  allMatches.forEach(m => { if (m.league) slugs.add(toSlug(m.league)); });
  return [...slugs].map(name => ({ name }));
}

interface Props {
  params: Promise<{ name: string }>;
}

// Resolve the league from the URL param. Config-label slugs (e.g.
// /league/world-cup/ for { label: 'World Cup', id: 16 }) aggregate every
// league name sharing that API league_id ("FIFA World Cup, Group A",
// "Group B", …). Other slugs resolve the real league name by slug
// comparison — slugs are lossy, so the name can't be reconstructed from
// the URL. Next dedupes the fetches between generateMetadata and the page.
async function getLeagueData(nameParam: string) {
  const slug = decodeURIComponent(nameParam);
  const dayData = await Promise.all(
    scheduleDays().map(async (ymd) => ({ ymd, matches: await fetchMatches(ymd) }))
  );

  const cfg = QUICK_LEAGUES.find(l => toSlug(l.label) === slug);

  if (cfg?.id != null) {
    const id = cfg.id;
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
    return { leagueName: leagueName ?? cfg.label, upcomingDays };
  }

  const targetName = cfg?.name ?? null;

  let leagueName: string | null = null;
  outer: for (const { matches } of dayData) {
    for (const m of matches) {
      if (m.league && (m.league === targetName || toSlug(m.league) === slug)) {
        leagueName = m.league;
        break outer;
      }
    }
  }
  if (!leagueName) {
    leagueName = targetName ?? STATIC_LEAGUES.find(l => toSlug(l) === slug) ?? null;
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
    description: `Full 14-day ${leagueName} TV schedule on CricFoot. Every match, kick-off time, venue and which TV channels are broadcasting ${leagueName} fixtures live worldwide.`,
    openGraph: {
      title: `${leagueName} TV Schedule | CricFoot`,
      description: `Complete ${leagueName} fixture list with TV channel information for every match.`,
    },
    twitter: {
      title: `${leagueName} TV Guide – CricFoot`,
      description: `Find ${leagueName} matches, kick-off times and broadcasting channels.`,
    },
    alternates: {
      canonical: `/league/${decodeURIComponent(name)}`,
    },
  };
}

export default async function LeaguePage({ params }: Props) {
  const { name } = await params;
  const { leagueName, upcomingDays } = await getLeagueData(name);
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
        totalMatches={totalMatches}
      />
      <Faq
        title={`${leagueName} — FAQs`}
        items={[
          {
            q: `Where can I watch ${leagueName} matches on TV?`,
            a: `Click any ${leagueName} fixture above to see the full list of broadcasting TV channels country by country. Every listed broadcaster holds official rights for its region.`,
          },
          {
            q: `How many ${leagueName} matches are scheduled this week?`,
            a: totalMatches > 0
              ? `There ${totalMatches === 1 ? 'is 1 match' : `are ${totalMatches} matches`} of ${leagueName} scheduled over the 14-day window. The day-by-day fixture list with kick-off times is shown above.`
              : `There are no ${leagueName} matches listed for the next 14 days. Schedules update daily, so check back soon.`,
          },
          {
            q: `Are ${leagueName} kick-off times shown in my local time?`,
            a: 'Yes — every kick-off time on CricFoot is automatically converted to your device’s local timezone.',
          },
        ]}
      />
    </>
  );
}
