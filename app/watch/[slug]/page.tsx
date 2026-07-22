import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchMatches } from '@/lib/api';
import { fromSlug, toSlug, scheduleDays, countryFlag, getLeagueFlag, dateFromYMD, fmtDate } from '@/lib/utils';
import { QUICK_LEAGUES } from '@/config/leagues';
import MatchCard from '@/components/MatchCard';
import DayLabel from '@/components/DayLabel';
import Faq from '@/components/Faq';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

interface Props { params: Promise<{ slug: string }> }

async function getData(slugParam: string) {
  const slug = decodeURIComponent(slugParam);
  const dayData = await Promise.all(
    scheduleDays().map(async ymd => ({ ymd, matches: await fetchMatches(ymd) }))
  );

  const cfg = QUICK_LEAGUES.find(l => toSlug(l.label) === slug);

  let leagueName: string | null = null;
  outer: for (const { matches } of dayData) {
    for (const m of matches) {
      if (!m.league) continue;
      if (cfg?.id != null && m.league_id === cfg.id) {
        leagueName = m.league.split(',')[0].trim();
        break outer;
      } else if (!cfg && toSlug(m.league) === slug) {
        leagueName = m.league;
        break outer;
      }
    }
  }
  leagueName = leagueName ?? (cfg?.label ?? fromSlug(slug));

  const upcomingDays = dayData
    .map(({ ymd, matches }) => ({
      ymd,
      matches: matches.filter(m =>
        cfg?.id != null ? m.league_id === cfg.id : m.league != null && toSlug(m.league) === slug
      ),
    }))
    .filter(d => d.matches.length > 0);

  // Build country → channels map from live API data
  const countryChannels = new Map<string, Set<string>>();
  upcomingDays.flatMap(d => d.matches).forEach(m => {
    (m.tv_channels ?? []).forEach(tv => {
      if (!tv.country) return;
      if (!countryChannels.has(tv.country)) countryChannels.set(tv.country, new Set());
      (tv.channels ?? []).forEach(ch => countryChannels.get(tv.country)!.add(ch));
    });
  });

  const broadcasters = [...countryChannels.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([country, chs]) => ({ country, channels: [...chs].sort() }));

  return { leagueName, upcomingDays, broadcasters, slug };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { leagueName } = await getData(slug);
  return {
    title: `Where to Watch ${leagueName} on TV – Channels in Every Country | CricFoot`,
    description: `How to watch ${leagueName} live on TV: every broadcaster by country, streaming services, kick-off times and the complete 30-day fixture schedule worldwide.`,
    keywords: `where to watch ${leagueName}, ${leagueName} tv channel, ${leagueName} live tv, what channel is ${leagueName} on, ${leagueName} broadcast`,
    openGraph: {
      title: `Where to Watch ${leagueName} on TV`,
      description: `${leagueName} TV channels in every country with live fixture schedule.`,
    },
    alternates: { canonical: `/watch/${decodeURIComponent(slug)}/` },
  };
}

export default async function WatchLeaguePage({ params }: Props) {
  const { slug } = await params;
  const { leagueName, upcomingDays, broadcasters } = await getData(slug);
  const totalMatches = upcomingDays.reduce((s, d) => s + d.matches.length, 0);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [{
      '@type': 'Question',
      name: `Where can I watch ${leagueName} on TV?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: broadcasters.slice(0, 8).map(b => `${b.country}: ${b.channels.slice(0, 3).join(', ')}`).join('. '),
      },
    }],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="page-head">
        <h1 className="page-title">{getLeagueFlag(leagueName)} Where to Watch {leagueName} on TV</h1>
        <p className="page-sub">
          {broadcasters.length} countr{broadcasters.length !== 1 ? 'ies' : 'y'} · {totalMatches} upcoming match{totalMatches !== 1 ? 'es' : ''} · 30-day schedule
        </p>
      </header>

      {/* Broadcaster list */}
      {broadcasters.length > 0 && (
        <section className="seo-section" style={{ marginBottom: 24, padding: 0 }}>
          <div className="bc-list-head">
            <span className="y-bar" />
            <span>{leagueName} TV Channels by Country</span>
            <span className="bc-list-count">{broadcasters.length} countr{broadcasters.length !== 1 ? 'ies' : 'y'}</span>
          </div>
          <div className="bc-list">
            {broadcasters.map((b, i) => (
              <div key={b.country} className={`bc-row${i % 2 === 1 ? ' bc-row-alt' : ''}`}>
                {/* Country name — fixed left column */}
                <div className="bc-row-country">
                  <span className="bc-row-flag">{countryFlag(b.country)}</span>
                  <span className="bc-row-name">{b.country}</span>
                </div>
                {/* Channels — grows to fill space */}
                <div className="bc-row-channels">
                  {b.channels.map(ch => (
                    <Link key={ch} href={`/channel/${toSlug(ch)}/`} className="bc-channel-pill">
                      {ch}
                    </Link>
                  ))}
                </div>
                {/* Schedule link — fixed right */}
                <Link href={`/watch/${decodeURIComponent(slug)}/${toSlug(b.country)}/`} className="bc-row-schedule">
                  Schedule →
                </Link>
              </div>
            ))}
          </div>
          <p className="bc-disclaimer">
            Broadcast rights vary by match and territory — check each fixture for exact channels.
            CricFoot is a TV guide only and does not stream or broadcast any content.
          </p>
        </section>
      )}

      {/* Upcoming fixtures */}
      <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 12px' }}>
        <span className="y-bar" />Upcoming {leagueName} Fixtures
      </h2>
      {upcomingDays.length === 0 ? (
        <div className="state-center">
          <div className="state-icon">📅</div>
          <div className="state-title">No {leagueName} fixtures in the next 30 days</div>
          <div className="state-sub">Check back soon — schedules update daily.</div>
          <Link href="/league/" className="btn-back" style={{ marginTop: 20, display: 'inline-flex' }}>← All leagues</Link>
        </div>
      ) : (
        upcomingDays.map(({ ymd, matches }) => {
          const full = fmtDate(dateFromYMD(ymd));
          return (
            <section key={ymd} className="day-section" aria-label={`${leagueName} on ${full}`}>
              <div className="day-section-header">
                <div>
                  <div className="day-section-label"><DayLabel ymd={ymd} /></div>
                  <div className="day-section-date">{full}</div>
                </div>
                <span className="day-section-count">{matches.length} match{matches.length !== 1 ? 'es' : ''}</span>
              </div>
              <div style={{ border: '1px solid var(--border-lt)', borderTop: 'none', borderRadius: '0 0 6px 6px', overflow: 'hidden', marginBottom: 4 }}>
                {matches.map((m, i) => <MatchCard key={i} match={m} ymd={ymd} />)}
              </div>
            </section>
          );
        })
      )}

      <div style={{ margin: '4px 0 20px' }}>
        <Link href={`/league/${slug}/`} className="btn-back">View full {leagueName} schedule →</Link>
      </div>

      <section className="seo-section">
        <h2><span className="y-bar" />How to Watch {leagueName} Live on TV</h2>
        <p>
          <strong>{leagueName}</strong> is broadcast live across{' '}
          <strong>{broadcasters.length} countries</strong>. The table above lists every official
          broadcaster per country — click any channel name to see its full 30-day football schedule,
          or click a country row to see only the {leagueName} fixtures available in that country.
        </p>
        <p>
          Kick-off times are automatically converted to your local timezone. To watch{' '}
          <strong>{leagueName}</strong>, subscribe to the official broadcaster in your country —
          most also offer an app or streaming service. CricFoot is a TV guide only: we do not host,
          stream, or broadcast any content.
        </p>
      </section>

      <Faq
        title={`${leagueName} — Where to Watch FAQs`}
        items={[
          {
            q: `Where can I watch ${leagueName} on TV?`,
            a: broadcasters.length > 0
              ? `${leagueName} is broadcast in ${broadcasters.length} countries. Key broadcasters include: ${broadcasters.slice(0, 5).map(b => `${b.country} (${b.channels.slice(0, 2).join(', ')})`).join('; ')}. Click any fixture above for the exact channel in your country.`
              : `Check the fixture list above — each match shows the full broadcaster list for every country.`,
          },
          {
            q: `Can I stream ${leagueName} online?`,
            a: `Yes — most official broadcasters offer a companion streaming app. Check the channel listed for your country in the table above, then visit the broadcaster's official website for subscription details. CricFoot does not provide streams.`,
          },
          {
            q: `Are ${leagueName} kick-off times in my local timezone?`,
            a: `Yes — every kick-off time on CricFoot is automatically converted to your device's local timezone, so you always see the correct local time wherever you are.`,
          },
          {
            q: `How often does the ${leagueName} schedule update?`,
            a: `The fixture schedule and broadcaster listings update every hour. If a match or channel is not yet listed, check back soon — new fixtures are published as soon as the broadcasters confirm them.`,
          },
        ]}
      />
    </>
  );
}
