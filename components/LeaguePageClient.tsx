'use client';

import Link from 'next/link';
import { Match } from '@/types';
import { toSlug, todayYMD, toYMD, dateFromYMD, fmtDate, getLeagueFlag } from '@/lib/utils';
import MatchCard from './MatchCard';

interface DayData { ymd: string; matches: Match[] }

interface Props {
  leagueName: string;
  upcomingDays: DayData[];
  broadcastMap: Record<string, string[]>;
  totalMatches: number;
}

function dayLabel(ymd: string): { primary: string; secondary: string } {
  const today = todayYMD();
  const d = new Date(); d.setDate(d.getDate() + 1);
  const tomorrow = toYMD(d);
  const full = fmtDate(dateFromYMD(ymd));
  if (ymd === today) return { primary: 'Today', secondary: full };
  if (ymd === tomorrow) return { primary: 'Tomorrow', secondary: full };
  return { primary: full, secondary: '' };
}

function shortLabel(ymd: string): string {
  return dateFromYMD(ymd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function LeaguePageClient({ leagueName, upcomingDays, broadcastMap, totalMatches }: Props) {
  const countryCount = Object.keys(broadcastMap).length;

  return (
    <>
      {/* League hero */}
      <header className="league-hero">
        <div className="league-hero-icon" aria-hidden="true">{getLeagueFlag(leagueName)}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 className="league-hero-name">{leagueName}</h1>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.78)', marginTop: 4 }}>
            {totalMatches} match{totalMatches !== 1 ? 'es' : ''} next 7 days ·{' '}
            {countryCount} broadcasting {countryCount === 1 ? 'country' : 'countries'}
          </p>
        </div>
        <Link href="/" className="btn-back" style={{ flexShrink: 0 }}>← Back</Link>
      </header>

      {/* Day tabs */}
      {upcomingDays.length > 1 && (
        <div className="day-tabs-wrap-page" aria-label="Jump to day">
          <div className="day-tabs-page">
            {upcomingDays.map(({ ymd }) => (
              <a key={ymd} href={`#lday-${ymd}`} className="day-tab-page">{shortLabel(ymd)}</a>
            ))}
          </div>
        </div>
      )}

      {/* Broadcasting channels by country */}
      {countryCount > 0 && (
        <>
          <h2 className="section-heading">
            <div className="accent-bar" />
            Broadcasting Channels by Country
          </h2>
          <div className="broadcast-grid" style={{ marginBottom: 24 }}>
            {Object.entries(broadcastMap)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([country, channels]) => (
                <div key={country} className="broadcast-country-card">
                  <div className="bc-country">{country}</div>
                  <div className="bc-channels">
                    {channels.map(ch => (
                      <Link key={ch} href={`/channel/${toSlug(ch)}`} className="bc-ch">
                        {ch}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </>
      )}

      {/* 7-day fixtures */}
      {upcomingDays.length === 0 ? (
        <div className="state-center">
          <div className="state-icon">📅</div>
          <div className="state-title">No {leagueName} matches in the next 7 days</div>
          <div className="state-sub">Check back soon — schedules update daily.</div>
        </div>
      ) : (
        upcomingDays.map(({ ymd, matches }) => {
          const { primary, secondary } = dayLabel(ymd);
          return (
            <section key={ymd} id={`lday-${ymd}`} className="day-section" aria-label={`${leagueName} matches on ${primary}`}>
              <div className="day-section-header">
                <div>
                  <div className="day-section-label">{primary}</div>
                  {secondary && <div className="day-section-date">{secondary}</div>}
                </div>
                <span className="day-section-count">{matches.length} match{matches.length !== 1 ? 'es' : ''}</span>
              </div>
              <div style={{ border: '1px solid var(--border-lt)', borderTop: 'none', borderRadius: '0 0 6px 6px', overflow: 'hidden', marginBottom: 4 }}>
                {matches.map((m, i) => <MatchCard key={i} match={m} />)}
              </div>
            </section>
          );
        })
      )}

      {/* SEO */}
      <section className="seo-section">
        <h2><span className="y-bar" />{leagueName} TV Guide &amp; Fixtures</h2>
        <p>
          Find the complete 7-day <strong>{leagueName}</strong> TV schedule on CricFoot. Every fixture,
          kick-off time, venue and which TV channels are broadcasting each match in your country.
        </p>
        <p>
          CricFoot covers all major football leagues including the <strong>Premier League</strong>,{' '}
          <strong>UEFA Champions League</strong>, <strong>La Liga</strong>, <strong>Serie A</strong>,{' '}
          <strong>Bundesliga</strong>, <strong>Ligue 1</strong> and many more.
        </p>
        <p className="footer-disclaimer" style={{ marginTop: 10 }}>
          CricFoot does not host or stream any live TV channels. We provide football match TV schedules and channel guidance only.
        </p>
      </section>
    </>
  );
}
