import type { Metadata } from 'next';
import { fetchMatches } from '@/lib/api';
import { fromSlug, toSlug, scheduleDays, pastScheduleDays, todayYMD } from '@/lib/utils';
import { QUICK_LEAGUES } from '@/config/leagues';
import LeaguePageClient from '@/components/LeaguePageClient';
import Faq from '@/components/Faq';

const STATIC_LEAGUES = [
  'Premier League', 'UEFA Champions League', 'La Liga', 'Serie A',
  'Bundesliga', 'Ligue 1', 'UEFA Europa League', 'FA Cup', 'Copa del Rey',
  'Eredivisie', 'MLS', 'Liga MX', 'Brazilian Série A', 'Turkish Süper Lig',
  'Scottish Premiership',
];

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

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
  const today = todayYMD();

  const dayData = await Promise.all(
    scheduleDays().map(async (ymd) => ({ ymd, matches: await fetchMatches(ymd) }))
  );

  const cfg = QUICK_LEAGUES.find(l => toSlug(l.label) === slug);

  if (cfg?.id != null) {
    const id = cfg.id;

    // Resolve display name from any match with this league_id
    let leagueName: string | null = null;
    for (const { matches } of dayData) {
      const m = matches.find(m => m.league_id === id && m.league);
      if (m) { leagueName = m.league!.split(',')[0].trim(); break; }
    }

    // Prefer upcoming (today+) matches
    const upcomingDays = dayData
      .filter(({ ymd }) => ymd >= today)
      .map(({ ymd, matches }) => ({ ymd, matches: matches.filter(m => m.league_id === id) }))
      .filter(d => d.matches.length > 0);

    if (upcomingDays.length > 0) {
      return { leagueName: leagueName ?? cfg.label, upcomingDays, isPastFallback: false };
    }

    // No upcoming fixtures — fall back to recent past results
    const pastData = await Promise.all(
      pastScheduleDays(30).map(async (ymd) => ({ ymd, matches: await fetchMatches(ymd) }))
    );
    const recentDays = [...dayData.filter(({ ymd }) => ymd < today), ...pastData]
      .sort((a, b) => b.ymd.localeCompare(a.ymd)) // most recent first
      .map(({ ymd, matches }) => ({ ymd, matches: matches.filter(m => m.league_id === id) }))
      .filter(d => d.matches.length > 0)
      .slice(0, 10);

    // Resolve name from past data if still unknown
    if (!leagueName) {
      for (const { matches } of recentDays) {
        const m = matches.find(m => m.league_id === id && m.league);
        if (m) { leagueName = m.league!.split(',')[0].trim(); break; }
      }
    }

    return {
      leagueName: leagueName ?? cfg.label,
      upcomingDays: recentDays,
      isPastFallback: recentDays.length > 0,
    };
  }

  // Name-based matching for non-config leagues
  const targetName = cfg?.name ?? null;
  let leagueName: string | null = null;
  for (const { matches } of dayData) {
    const m = matches.find(m => m.league && (m.league === targetName || toSlug(m.league) === slug));
    if (m) { leagueName = m.league!; break; }
  }
  if (!leagueName) {
    leagueName = targetName ?? STATIC_LEAGUES.find(l => toSlug(l) === slug) ?? null;
  }

  const resolvedName = leagueName;
  if (!resolvedName) {
    return { leagueName: fromSlug(slug), upcomingDays: [], isPastFallback: false };
  }

  const upcomingDays = dayData
    .filter(({ ymd }) => ymd >= today)
    .map(({ ymd, matches }) => ({
      ymd,
      matches: matches.filter(m => m.league === resolvedName),
    }))
    .filter(d => d.matches.length > 0);

  if (upcomingDays.length > 0) {
    return { leagueName: resolvedName, upcomingDays, isPastFallback: false };
  }

  // No upcoming fixtures — fall back to recent past results
  const pastData = await Promise.all(
    pastScheduleDays(30).map(async (ymd) => ({ ymd, matches: await fetchMatches(ymd) }))
  );
  const recentDays = [...dayData.filter(({ ymd }) => ymd < today), ...pastData]
    .sort((a, b) => b.ymd.localeCompare(a.ymd))
    .map(({ ymd, matches }) => ({
      ymd,
      matches: matches.filter(m => m.league === resolvedName),
    }))
    .filter(d => d.matches.length > 0)
    .slice(0, 10);

  return {
    leagueName: resolvedName,
    upcomingDays: recentDays,
    isPastFallback: recentDays.length > 0,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const { leagueName } = await getLeagueData(name);

  return {
    title: `Watch Live ${leagueName} Football on TV – ${leagueName} TV Schedule | CricFoot`,
    description: `Watch live ${leagueName} football on TV: the full 30-day ${leagueName} TV schedule with every match, kick-off time in your local timezone, venue and the channels broadcasting each fixture worldwide.`,
    openGraph: {
      title: `Watch Live ${leagueName} Football on TV – ${leagueName} TV Schedule`,
      description: `Complete ${leagueName} fixture list with TV channel information for every match.`,
    },
    twitter: {
      title: `Watch Live ${leagueName} Football on TV – CricFoot`,
      description: `${leagueName} matches, kick-off times and broadcasting channels.`,
    },
    alternates: {
      canonical: `/league/${decodeURIComponent(name)}/`,
    },
  };
}

export default async function LeaguePage({ params }: Props) {
  const { name } = await params;
  const { leagueName, upcomingDays, isPastFallback } = await getLeagueData(name);
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
        isPastFallback={isPastFallback}
      />
      <Faq
        title={`${leagueName} — FAQs`}
        items={[
          {
            q: `Where can I watch ${leagueName} matches on TV?`,
            a: `Click any ${leagueName} fixture above to see the full list of broadcasting TV channels country by country. Every listed broadcaster holds official rights for its region.`,
          },
          {
            q: isPastFallback
              ? `When does the next ${leagueName} season start?`
              : `How many ${leagueName} matches are scheduled this week?`,
            a: isPastFallback
              ? `There are no upcoming ${leagueName} fixtures in the next 30 days — the season may be on a break or between campaigns. Recent results are shown above. Schedules update daily, so check back soon.`
              : (totalMatches > 0
                  ? `There ${totalMatches === 1 ? 'is 1 match' : 'are ' + totalMatches + ' matches'} of ${leagueName} scheduled over the 30-day window. The day-by-day fixture list with kick-off times is shown above.`
                  : `There are no ${leagueName} matches listed for the next 30 days. Schedules update daily, so check back soon.`
                ),
          },
          {
            q: `Are ${leagueName} kick-off times shown in my local time?`,
            a: 'Yes — every kick-off time on CricFoot is automatically converted to your device\'s local timezone.',
          },
        ]}
      />
    </>
  );
}
