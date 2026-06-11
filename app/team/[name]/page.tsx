import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchMatches } from '@/lib/api';
import { fromSlug, toSlug, scheduleDays, splitFixture, dateFromYMD, fmtDate } from '@/lib/utils';
import DayFixtureList from '@/components/DayFixtureList';
import Faq from '@/components/Faq';

export async function generateStaticParams() {
  const allMatches = (await Promise.all(scheduleDays().map(fetchMatches))).flat();
  const slugs = new Set<string>();
  allMatches.forEach(m => {
    const teams = splitFixture(m.fixture);
    if (!teams) return;
    slugs.add(toSlug(teams[0]));
    slugs.add(toSlug(teams[1]));
  });
  return [...slugs].map(name => ({ name }));
}

interface Props {
  params: Promise<{ name: string }>;
}

// Resolve the real team name from the API by slug comparison — slugs are
// lossy, so the name can't be reconstructed from the URL. Next dedupes the
// underlying fetches between generateMetadata and the page.
async function getTeamData(nameParam: string) {
  const slug = decodeURIComponent(nameParam);
  const dayData = await Promise.all(
    scheduleDays().map(async (ymd) => ({ ymd, matches: await fetchMatches(ymd) }))
  );

  let teamName: string | null = null;
  outer: for (const { matches } of dayData) {
    for (const m of matches) {
      const teams = splitFixture(m.fixture);
      if (!teams) continue;
      if (toSlug(teams[0]) === slug) { teamName = teams[0]; break outer; }
      if (toSlug(teams[1]) === slug) { teamName = teams[1]; break outer; }
    }
  }

  const upcomingDays = teamName
    ? dayData
        .map(({ ymd, matches }) => ({
          ymd,
          matches: matches.filter(m => {
            const teams = splitFixture(m.fixture);
            return teams != null && (toSlug(teams[0]) === slug || toSlug(teams[1]) === slug);
          }),
        }))
        .filter(d => d.matches.length > 0)
    : [];

  return { teamName: teamName ?? fromSlug(slug), upcomingDays };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const { teamName } = await getTeamData(name);

  return {
    title: `${teamName} Next Match on TV – ${teamName} TV Schedule & Channels | CricFoot`,
    description: `What channel is the ${teamName} game on? Full ${teamName} TV schedule: next match, kick-off times in your local timezone and every broadcasting channel by country for the next 14 days.`,
    keywords: `${teamName} next match, ${teamName} game today, what channel is ${teamName} on, ${teamName} tv schedule, ${teamName} match on tv, watch ${teamName} live, ${teamName} fixtures on tv, ${teamName} live stream channel`,
    openGraph: {
      title: `${teamName} Next Match on TV – TV Schedule & Channels`,
      description: `${teamName} upcoming matches with kick-off times and TV channels country by country.`,
    },
    twitter: {
      title: `${teamName} TV Schedule – Next Match & Channels`,
      description: `Find what channel the ${teamName} game is on.`,
    },
    alternates: { canonical: `/team/${decodeURIComponent(name)}` },
  };
}

export default async function TeamPage({ params }: Props) {
  const { name } = await params;
  const { teamName, upcomingDays } = await getTeamData(name);
  const totalMatches = upcomingDays.reduce((s, d) => s + d.matches.length, 0);

  const nextDayData = upcomingDays[0];
  const nextMatch = nextDayData?.matches[0];
  const nextTeams = nextMatch ? splitFixture(nextMatch.fixture) : null;
  const nextOpponent = nextTeams
    ? (toSlug(nextTeams[0]) === decodeURIComponent(name) ? nextTeams[1] : nextTeams[0])
    : null;
  const nextDate = nextDayData ? fmtDate(dateFromYMD(nextDayData.ymd)) : null;
  const nextChannels = nextMatch
    ? [...new Set((nextMatch.tv_channels ?? []).flatMap(tv => tv.channels ?? []))].slice(0, 5)
    : [];
  const leagues = [...new Set(upcomingDays.flatMap(d => d.matches.map(m => m.league).filter(Boolean)))];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsTeam',
    name: teamName,
    sport: 'Soccer',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.cricfoot.net/' },
        { '@type': 'ListItem', position: 2, name: teamName },
      ],
    },
  };

  const faqs = [
    {
      q: `When is the next ${teamName} match on TV?`,
      a: nextMatch
        ? `${teamName}'s next match is ${nextMatch.fixture} on ${nextDate}${nextMatch.league ? ` in the ${nextMatch.league}` : ''}. The kick-off time above is shown in your local timezone.`
        : `${teamName} has no matches listed in the current 14-day TV schedule. Listings update daily, so check back soon.`,
    },
    {
      q: `What channel is the ${teamName} game on?`,
      a: nextChannels.length > 0
        ? `${teamName}'s next match is broadcast on channels including ${nextChannels.join(', ')}. Click the fixture above for the full country-by-country channel list, so you can find the broadcaster in your region.`
        : `Click any ${teamName} fixture above to see the full list of broadcasting TV channels for every country.`,
    },
    {
      q: `How many ${teamName} matches are on TV in the next 14 days?`,
      a: totalMatches > 0
        ? `${teamName} has ${totalMatches} match${totalMatches !== 1 ? 'es' : ''} in the 14-day TV schedule${leagues.length ? ` across ${leagues.join(', ')}` : ''}. The full day-by-day list with kick-off times is shown above.`
        : `${teamName} has no matches in the current 14-day window. Schedules update daily.`,
    },
    {
      q: `Are ${teamName} kick-off times shown in my local time?`,
      a: 'Yes — every kick-off time on CricFoot is automatically converted to your device’s local timezone.',
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <header className="league-hero">
        <div className="league-hero-icon" aria-hidden="true">⚽</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 className="league-hero-name">{teamName} – Next Match on TV</h1>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.78)', marginTop: 4 }}>
            {totalMatches} match{totalMatches !== 1 ? 'es' : ''} · 14-day TV guide
          </p>
        </div>
        <Link href="/" className="btn-back" style={{ flexShrink: 0 }}>← Back</Link>
      </header>

      <DayFixtureList
        days={upcomingDays}
        subject={teamName}
        idPrefix="tday"
        emptySub={`No ${teamName} matches are listed right now. Schedules update daily — check back soon.`}
      />

      {/* SEO */}
      <section className="seo-section">
        <h2><span className="y-bar" />{teamName} TV Schedule &amp; Upcoming Matches</h2>
        <p>
          Wondering <strong>what channel the {teamName} game is on</strong>? CricFoot lists every upcoming{' '}
          <strong>{teamName}</strong> match on TV{nextOpponent ? <> — starting with the {nextMatch!.fixture} fixture</> : null},
          with kick-off times automatically converted to your local timezone. Click any fixture for the full
          country-by-country broadcaster list.
        </p>
        <p>
          See also the full schedule of{' '}
          <Link href="/" style={{ color: 'var(--navy)', fontWeight: 600 }}>football on TV today</Link>
          {leagues[0] && (
            <>
              {' '}or all <Link href={`/league/${toSlug(leagues[0]!)}`} style={{ color: 'var(--navy)', fontWeight: 600 }}>{leagues[0]}</Link> fixtures
            </>
          )}.
          CricFoot provides TV listings only — we do not stream or broadcast any content.
        </p>
      </section>

      <Faq title={`${teamName} — FAQs`} items={faqs} />
    </>
  );
}
