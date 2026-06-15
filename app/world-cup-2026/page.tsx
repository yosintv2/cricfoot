import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchMatches } from '@/lib/api';
import { countryFlag, dateFromYMD, scheduleDays, toSlug } from '@/lib/utils';
import { WORLD_CUP_ID } from '@/config/leagues';
import DayFixtureList from '@/components/DayFixtureList';
import Faq from '@/components/Faq';

export const metadata: Metadata = {
  title: 'FIFA World Cup 2026 TV Schedule – Where to Watch Every Match | CricFoot',
  description:
    'FIFA World Cup 2026 TV schedule: every match with kick-off times in your local timezone and the TV channels broadcasting in your country. Where to watch the World Cup in the USA, UK, Canada, Mexico, India and worldwide — updated daily.',
  keywords:
    'world cup 2026 tv schedule, where to watch world cup 2026, world cup on tv today, world cup 2026 channels, fifa world cup 2026 broadcast, world cup usa tv, world cup 2026 fixtures on tv, watch world cup 2026',
  openGraph: {
    title: 'FIFA World Cup 2026 TV Schedule – Where to Watch Every Match',
    description: 'Every World Cup 2026 match with kick-off times and TV channels country by country.',
  },
  twitter: {
    title: 'World Cup 2026 TV Schedule & Channels',
    description: 'Where to watch every FIFA World Cup 2026 match — full TV guide.',
  },
  alternates: { canonical: '/world-cup-2026' },
};

// Key broadcast markets pinned to the top of the by-country table.
const PRIORITY_COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Mexico', 'India',
  'Australia', 'Germany', 'France', 'Spain', 'Italy', 'Brazil', 'Argentina',
];

export default async function WorldCupPage() {
  const dayData = await Promise.all(
    scheduleDays().map(async ymd => ({ ymd, matches: await fetchMatches(ymd) }))
  );

  const upcomingDays = dayData
    .map(({ ymd, matches }) => ({ ymd, matches: matches.filter(m => m.league_id === WORLD_CUP_ID) }))
    .filter(d => d.matches.length > 0);

  const totalMatches = upcomingDays.reduce((s, d) => s + d.matches.length, 0);
  const wcMatches = upcomingDays.flatMap(d => d.matches);

  // Channels per country across all World Cup matches, most frequent first.
  const byCountry = new Map<string, Map<string, number>>();
  wcMatches.forEach(m =>
    (m.tv_channels ?? []).forEach(tv => {
      if (!tv.country) return;
      if (!byCountry.has(tv.country)) byCountry.set(tv.country, new Map());
      const chMap = byCountry.get(tv.country)!;
      (tv.channels ?? []).forEach(ch => chMap.set(ch, (chMap.get(ch) ?? 0) + 1));
    })
  );
  const countryRows = [...byCountry.entries()]
    .map(([country, chMap]) => ({
      country,
      channels: [...chMap.entries()].sort((a, b) => b[1] - a[1]).map(([ch]) => ch).slice(0, 5),
    }))
    .sort((a, b) => {
      const pa = PRIORITY_COUNTRIES.indexOf(a.country);
      const pb = PRIORITY_COUNTRIES.indexOf(b.country);
      if (pa !== -1 || pb !== -1) return (pa === -1 ? 99 : pa) - (pb === -1 ? 99 : pb);
      return a.country.localeCompare(b.country);
    })
    .slice(0, 24);

  const usChannels = countryRows.find(r => r.country === 'United States')?.channels ?? [];
  const ukChannels = countryRows.find(r => r.country === 'United Kingdom')?.channels ?? [];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SportsEvent',
        name: 'FIFA World Cup 2026',
        sport: 'Soccer',
        startDate: '2026-06-11',
        endDate: '2026-07-19',
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        location: [
          { '@type': 'Country', name: 'United States' },
          { '@type': 'Country', name: 'Canada' },
          { '@type': 'Country', name: 'Mexico' },
        ],
        description: 'The 2026 FIFA World Cup, hosted by the United States, Canada and Mexico — the first 48-team World Cup.',
        organizer: { '@type': 'Organization', name: 'FIFA' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.cricfoot.net/' },
          { '@type': 'ListItem', position: 2, name: 'World Cup 2026' },
        ],
      },
    ],
  };

  const faqs = [
    {
      q: 'Where can I watch the FIFA World Cup 2026?',
      a: `Every World Cup 2026 match is broadcast worldwide by official rights holders. ${usChannels.length ? `In the United States coverage is on ${usChannels.slice(0, 3).join(', ')}. ` : ''}${ukChannels.length ? `In the United Kingdom matches are shown on ${ukChannels.slice(0, 3).join(', ')}. ` : ''}Click any fixture above to see the full country-by-country channel list for that match.`,
    },
    {
      q: 'What World Cup 2026 matches are on TV today?',
      a: totalMatches > 0
        ? `There ${totalMatches === 1 ? 'is 1 World Cup match' : `are ${totalMatches} World Cup matches`} in the current 30-day schedule above, grouped by day with kick-off times shown in your local timezone. The schedule updates daily throughout the tournament.`
        : 'The day-by-day World Cup schedule above updates daily throughout the tournament with kick-off times in your local timezone.',
    },
    {
      q: 'When is the FIFA World Cup 2026?',
      a: 'The 2026 FIFA World Cup runs from June 11 to July 19, 2026, hosted across the United States, Canada and Mexico. It is the first World Cup with 48 teams and 104 matches, and the final is played at MetLife Stadium, New Jersey.',
    },
    {
      q: 'Are World Cup kick-off times shown in my local time?',
      a: 'Yes — every kick-off time on CricFoot is automatically converted to your device’s local timezone, so the time you see is the time the match starts where you live.',
    },
    {
      q: 'Is CricFoot streaming World Cup 2026 matches?',
      a: 'No. CricFoot is a free TV guide: we show which official channels broadcast each World Cup match in every country. To watch, use your TV or streaming subscription with the listed broadcaster in your region.',
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
        <div className="league-hero-icon" aria-hidden="true">🏆</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 className="league-hero-name">FIFA World Cup 2026 TV Schedule</h1>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.78)', marginTop: 4 }}>
            USA · Canada · Mexico — June 11 to July 19, 2026 · {totalMatches} match{totalMatches !== 1 ? 'es' : ''} in the next 30 days
          </p>
        </div>
        <Link href="/" className="btn-back" style={{ flexShrink: 0 }}>← Back</Link>
      </header>

      {/* Day tabs */}
      {upcomingDays.length > 1 && (
        <div className="day-tabs-wrap-page" aria-label="Jump to day">
          <div className="day-tabs-page">
            {upcomingDays.map(({ ymd }) => (
              <a key={ymd} href={`#wcday-${ymd}`} className="day-tab-page">
                {dateFromYMD(ymd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </a>
            ))}
          </div>
        </div>
      )}

      <DayFixtureList
        days={upcomingDays}
        subject="World Cup 2026"
        showLeague={false}
        idPrefix="wcday"
        emptySub="Match listings for the next round will appear here as soon as they are published."
      />

      {/* Broadcasters by country */}
      {countryRows.length > 0 && (
        <section style={{ marginTop: 28 }} aria-label="World Cup 2026 broadcasters by country">
          <h2 className="section-heading">
            <div className="accent-bar" />
            📺 World Cup 2026 Broadcasters by Country
          </h2>
          <div style={{ border: '1px solid var(--border-lt)', borderRadius: 6, overflow: 'hidden' }}>
            <table className="country-table" aria-label="World Cup 2026 TV channels by country">
              <tbody>
                {countryRows.map(({ country, channels }) => (
                  <tr key={country}>
                    <td className="ct-flag-name">
                      <span className="ct-flag-icon" aria-hidden="true">{countryFlag(country)}</span>
                      <Link href={`/country/${toSlug(country)}`} title={`Football on TV in ${country}`} style={{ color: 'inherit' }}>
                        {country}
                      </Link>
                    </td>
                    <td className="ct-channels">
                      {channels.map((ch, i) => (
                        <span key={ch}>
                          <Link href={`/channel/${toSlug(ch)}`} className="ct-ch-link" title={`${ch} schedule`}>{ch}</Link>
                          {i < channels.length - 1 && ', '}
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* SEO */}
      <section className="seo-section">
        <h2><span className="y-bar" />Where to Watch the FIFA World Cup 2026</h2>
        <p>
          The <strong>2026 FIFA World Cup</strong> is being played across the <strong>United States, Canada and
          Mexico</strong> from June 11 to July 19, 2026 — the first edition with <strong>48 teams</strong> and
          104 matches. This page is your complete <strong>World Cup 2026 TV guide</strong>: every fixture,
          kick-off time in your local timezone, and the official broadcasting channels country by country.
        </p>
        <p>
          Click any match above for the full channel list, or browse the broadcaster table to find{' '}
          <strong>where to watch the World Cup in your country</strong>. For the rest of today&apos;s football, see{' '}
          <Link href="/" style={{ color: 'var(--navy)', fontWeight: 600 }}>football on TV today</Link> or{' '}
          <Link href="/tomorrow" style={{ color: 'var(--navy)', fontWeight: 600 }}>tomorrow&apos;s schedule</Link>.
        </p>
      </section>

      <Faq title="World Cup 2026 — FAQs" items={faqs} />
    </>
  );
}
