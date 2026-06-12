'use client';

import Link from 'next/link';
import { Match } from '@/types';
import { dateFromYMD, fmtDate, toSlug } from '@/lib/utils';
import LeagueSection from './LeagueSection';
import DayLabel from './DayLabel';

interface DayData { ymd: string; matches: Match[] }

interface Props {
  channelName: string;
  upcomingDays: DayData[];
  countries?: string[];
}

function shortLabel(ymd: string): string {
  return dateFromYMD(ymd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function groupByLeague(matches: Match[]): Record<string, Match[]> {
  const byLeague: Record<string, Match[]> = {};
  matches.forEach(m => {
    const k = m.league || 'Other';
    if (!byLeague[k]) byLeague[k] = [];
    byLeague[k].push(m);
  });
  return Object.fromEntries(
    Object.entries(byLeague).sort(([a], [b]) =>
      a === 'Other' ? 1 : b === 'Other' ? -1 : a.localeCompare(b)
    )
  );
}

export default function ChannelPageClient({ channelName, upcomingDays, countries = [] }: Props) {
  const totalMatches = upcomingDays.reduce((s, d) => s + d.matches.length, 0);
  const initials = channelName.replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase() || '📺';
  const nextDay = upcomingDays[0];
  const nextFixtures = (nextDay?.matches ?? []).map(m => m.fixture).filter(Boolean).slice(0, 3);
  const leagues = [...new Set(upcomingDays.flatMap(d => d.matches.map(m => m.league).filter(Boolean)))].slice(0, 5);

  return (
    <>
      {/* Channel hero */}
      <header className="channel-hero">
        <div className="channel-hero-icon" aria-hidden="true">{initials}</div>
        <div className="channel-hero-info">
          <h1 className="channel-hero-name">Live Football on {channelName}</h1>
          <p className="channel-hero-meta">
            {totalMatches} match{totalMatches !== 1 ? 'es' : ''} scheduled · 14-day guide
          </p>
        </div>
        <Link href="/" className="btn-back">← Back</Link>
      </header>

      {/* Day tabs */}
      {upcomingDays.length > 1 && (
        <div className="day-tabs-wrap-page" aria-label="Jump to day">
          <div className="day-tabs-page">
            {upcomingDays.map(({ ymd, matches }) => (
              <a key={ymd} href={`#cday-${ymd}`} className="day-tab-page">
                {shortLabel(ymd)} ({matches.length})
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Matches by day */}
      {upcomingDays.length === 0 ? (
        <div className="state-center">
          <div className="state-icon">📅</div>
          <div className="state-title">No matches scheduled on {channelName} in the current 14-day window</div>
          <div className="state-sub">
            This channel may not have matches listed for today or the coming week. Check back soon — schedules update daily.
          </div>
          <Link href="/" className="btn-back" style={{ marginTop: 20, display: 'inline-flex' }}>
            ← View today&apos;s matches
          </Link>
        </div>
      ) : (
        upcomingDays.map(({ ymd, matches }) => {
          const grouped = groupByLeague(matches);
          const full = fmtDate(dateFromYMD(ymd));
          return (
            <section key={ymd} id={`cday-${ymd}`} aria-label={`${channelName} matches on ${full}`} style={{ marginBottom: 20 }}>
              <div className="day-section-header" style={{ borderRadius: 6, marginBottom: 8 }}>
                <div>
                  <div className="day-section-label">📅 <DayLabel ymd={ymd} /></div>
                  <div className="day-section-date">{full}</div>
                </div>
                <span className="day-section-count">{matches.length} match{matches.length !== 1 ? 'es' : ''}</span>
              </div>
              {Object.entries(grouped).map(([league, lmatches]) => (
                <LeagueSection key={league} league={league} matches={lmatches} showLeague ymd={ymd} />
              ))}
            </section>
          );
        })
      )}

      {/* SEO */}
      <section className="seo-section">
        <h2><span className="y-bar" />Live Football on {channelName} — Match Today &amp; TV Guide</h2>
        <p>
          Looking for the <strong>{channelName} live match today</strong>? This page is the complete guide to{' '}
          <strong>live football on {channelName}</strong>
          {nextFixtures.length > 0 && nextDay ? (
            <>
              {' '}— on {fmtDate(dateFromYMD(nextDay.ymd))} the channel shows{' '}
              <strong>{nextFixtures.join(', ')}</strong>
              {nextDay.matches.length > nextFixtures.length && ` and ${nextDay.matches.length - nextFixtures.length} more match${nextDay.matches.length - nextFixtures.length !== 1 ? 'es' : ''}`}
            </>
          ) : (
            <> covering every football match scheduled on the channel</>
          )}
          . Kick-off times are converted to your local timezone automatically
          {leagues.length > 0 && <>, with coverage including {leagues.join(', ')}</>}.
        </p>
        {countries.length > 0 && (
          <p>
            {channelName} carries live football on TV in{' '}
            {countries.slice(0, 6).map((c, i) => (
              <span key={c}>
                <Link href={`/country/${toSlug(c)}`} style={{ color: 'var(--navy)', fontWeight: 600 }}>{c}</Link>
                {i < Math.min(countries.length, 6) - 1 && ', '}
              </span>
            ))}
            {countries.length > 6 && ` and ${countries.length - 6} more countries`} — broadcast rights vary by
            competition and territory, so check the fixture list above for your region.
          </p>
        )}
        <p>
          To watch {channelName}, use its official TV, cable or streaming provider — most broadcasters also offer
          an official app for Android and iPhone, and some show selected matches on their official YouTube channel.{' '}
          <strong>CricFoot is a TV guide only: we do not host, stream, or broadcast any content.</strong>{' '}
          For everything else on TV, see{' '}
          <Link href="/" style={{ color: 'var(--navy)', fontWeight: 600 }}>football on TV today</Link>.
        </p>
      </section>
    </>
  );
}
