import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchMatches } from '@/lib/api';
import { countryFlag, dateFromYMD, fmtDate, fromSlug, matchSlug, pairSlug, scheduleDays, splitFixture, toSlug } from '@/lib/utils';
import { Match } from '@/types';
import DayFixtureList from '@/components/DayFixtureList';
import Faq from '@/components/Faq';

export async function generateStaticParams() {
  const allMatches = (await Promise.all(scheduleDays().map(fetchMatches))).flat();
  const slugs = new Set<string>();
  allMatches.forEach(m => {
    const teams = splitFixture(m.fixture);
    if (teams) slugs.add(pairSlug(teams[0], teams[1]));
  });
  return [...slugs].map(slug => ({ slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

// Evergreen head-to-head page: matches both directions ("a-vs-b" and the
// API listing "B vs A"), so the URL keeps working season after season.
async function getFixtureData(slugParam: string) {
  const slug = decodeURIComponent(slugParam);
  const dayData = await Promise.all(
    scheduleDays().map(async (ymd) => ({ ymd, matches: await fetchMatches(ymd) }))
  );

  let home: string | null = null;
  let away: string | null = null;
  const isMeeting = (m: Match) => {
    const teams = splitFixture(m.fixture);
    if (!teams) return false;
    return pairSlug(teams[0], teams[1]) === slug || pairSlug(teams[1], teams[0]) === slug;
  };

  outer: for (const { matches } of dayData) {
    for (const m of matches) {
      if (isMeeting(m)) {
        const teams = splitFixture(m.fixture)!;
        [home, away] = teams;
        break outer;
      }
    }
  }

  const upcomingDays = home
    ? dayData
        .map(({ ymd, matches }) => ({ ymd, matches: matches.filter(isMeeting) }))
        .filter(d => d.matches.length > 0)
    : [];

  // Display fallback when no meeting is in the window: "arsenal-vs-chelsea" → "Arsenal vs Chelsea"
  const fallback = fromSlug(slug).replace(/\bvs\b/i, 'vs');
  const title = home && away ? `${home} vs ${away}` : fallback.replace(/\b\w/g, c => c.toUpperCase());

  return { title, home, away, upcomingDays };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { title } = await getFixtureData(slug);

  return {
    title: `${title} TV Channel, Kick-off Time & Where to Watch | CricFoot`,
    description: `What channel is ${title} on? Kick-off time in your local timezone and every TV channel broadcasting ${title} country by country. Updated for every meeting, all season.`,
    keywords: `${title} tv channel, what channel is ${title} on, ${title} kick off time, watch ${title}, ${title} live stream channel, ${title} on tv, where to watch ${title}`,
    openGraph: {
      title: `${title} – TV Channel & Kick-off Time`,
      description: `Where to watch ${title}: broadcasters by country and kick-off time.`,
    },
    twitter: {
      title: `${title} – TV Channel & Kick-off`,
      description: `Full broadcast guide for ${title}.`,
    },
    alternates: { canonical: `/fixtures/${decodeURIComponent(slug)}` },
  };
}

export default async function FixturePage({ params }: Props) {
  const { slug } = await params;
  const { title, home, away, upcomingDays } = await getFixtureData(slug);

  const nextDayData = upcomingDays[0];
  const nextMatch = nextDayData?.matches[0];
  const nextDate = nextDayData ? fmtDate(dateFromYMD(nextDayData.ymd)) : null;
  const tvChs = nextMatch
    ? [...(nextMatch.tv_channels ?? [])].sort((a, b) => (a.country ?? '').localeCompare(b.country ?? ''))
    : [];
  const allChannelNames = [...new Set(tvChs.flatMap(tv => tv.channels ?? []))];
  const kickoffISO = nextMatch?.kickoff ? new Date(nextMatch.kickoff * 1000).toISOString() : undefined;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      ...(nextMatch ? [{
        '@type': 'SportsEvent',
        name: nextMatch.fixture,
        sport: 'Soccer',
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        ...(kickoffISO && { startDate: kickoffISO }),
        ...(nextMatch.venue && { location: { '@type': 'Place', name: nextMatch.venue } }),
        ...(home && away && {
          competitor: [
            { '@type': 'SportsTeam', name: home },
            { '@type': 'SportsTeam', name: away },
          ],
        }),
        ...(nextMatch.league && { superEvent: { '@type': 'SportsEvent', name: nextMatch.league } }),
      }] : []),
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.cricfoot.net/' },
          { '@type': 'ListItem', position: 2, name: title },
        ],
      },
    ],
  };

  const faqs = [
    {
      q: `When is the next ${title} match?`,
      a: nextMatch
        ? `The next ${title} meeting is on ${nextDate}${nextMatch.league ? ` in the ${nextMatch.league}` : ''}${nextMatch.venue ? ` at ${nextMatch.venue}` : ''}. The kick-off time above is shown in your local timezone.`
        : `There is no ${title} meeting in the current 30-day TV schedule. This page updates automatically as soon as their next match is announced — bookmark it for every meeting.`,
    },
    {
      q: `What TV channel is ${title} on?`,
      a: allChannelNames.length > 0
        ? `${title} is broadcast on ${allChannelNames.length} channels worldwide, including ${allChannelNames.slice(0, 6).join(', ')}. See the country-by-country table above for the broadcaster in your region.`
        : `TV listings appear here as soon as broadcasters confirm coverage for the next ${title} meeting — usually a few days before kick-off.`,
    },
    {
      q: `Where can I watch ${title} in my country?`,
      a: 'Find your country in the channel table — every listed broadcaster holds official rights for that region. CricFoot is a TV guide and does not stream matches.',
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header style={{ margin: '20px 0 0' }}>
        <h1 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>
          {title} – TV Channel, Kick-off Time &amp; Where to Watch
        </h1>
        <div style={{ height: 4, background: 'var(--red)', borderRadius: 1 }} />
      </header>

      {/* Team links */}
      {home && away && (
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '6px 18px', alignItems: 'center',
          padding: '12px 2px', borderBottom: '1px solid var(--border-lt)',
          fontSize: '0.85rem', color: 'var(--text-mid)',
        }}>
          <Link href={`/team/${toSlug(home)}`} style={{ color: 'var(--navy)', fontWeight: 600 }}>⚽ {home} schedule</Link>
          <Link href={`/team/${toSlug(away)}`} style={{ color: 'var(--navy)', fontWeight: 600 }}>⚽ {away} schedule</Link>
          {nextMatch?.league && (
            <Link href={`/league/${toSlug(nextMatch.league)}`} style={{ color: 'var(--navy)', fontWeight: 600 }}>
              🏆 {nextMatch.league}
            </Link>
          )}
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <DayFixtureList
          days={upcomingDays}
          subject={title}
          idPrefix="hday"
          emptySub={`No ${title} meeting is scheduled in the next 30 days. This page updates automatically when their next match is announced.`}
        />
      </div>

      {/* Channel table for the next meeting */}
      {nextMatch && tvChs.length > 0 && (
        <section style={{ marginTop: 20 }} aria-label={`TV channels broadcasting ${title} by country`}>
          <h2 className="section-heading">
            <div className="accent-bar" />
            📺 {nextMatch.fixture} — Channels by Country
          </h2>
          <div style={{ border: '1px solid var(--border-lt)', borderRadius: 6, overflow: 'hidden', marginBottom: 8 }}>
            <table className="country-table">
              <tbody>
                {tvChs.map((tv, ti) => (
                  <tr key={ti}>
                    <td className="ct-flag-name">
                      <span className="ct-flag-icon" aria-hidden="true">{countryFlag(tv.country ?? '')}</span>
                      {tv.country ? (
                        <Link href={`/country/${toSlug(tv.country)}`} style={{ color: 'inherit' }} title={`Football on TV in ${tv.country}`}>
                          {tv.country}
                        </Link>
                      ) : 'International'}
                    </td>
                    <td className="ct-channels">
                      {(tv.channels ?? []).map((ch, i) => (
                        <span key={ch}>
                          <Link href={`/channel/${toSlug(ch)}`} className="ct-ch-link" title={`View all matches on ${ch}`}>{ch}</Link>
                          {i < (tv.channels ?? []).length - 1 && ', '}
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Link href={`/match/${matchSlug(nextDayData!.ymd, nextMatch.fixture)}`} className="btn-back">
            Full match page →
          </Link>
        </section>
      )}

      {/* SEO */}
      <section className="seo-section">
        <h2><span className="y-bar" />Where to Watch {title}</h2>
        <p>
          This is the permanent TV guide for <strong>{title}</strong>. Every time these two teams meet,
          this page shows the confirmed <strong>kick-off time</strong> (in your local timezone) and the full list
          of <strong>TV channels broadcasting the match</strong> country by country — bookmark it and check back
          before every meeting.
        </p>
        <p>
          For the rest of the schedule, see{' '}
          <Link href="/" style={{ color: 'var(--navy)', fontWeight: 600 }}>football on TV today</Link>.
          CricFoot provides TV listings only — we do not stream or broadcast any content.
        </p>
      </section>

      <Faq title={`${title} — FAQs`} items={faqs} />
    </>
  );
}
