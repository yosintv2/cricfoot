'use client';

import Link from 'next/link';
import { Match } from '@/types';
import { countryFlag, dateFromYMD, fmtDate, getLeagueFlag, toSlug } from '@/lib/utils';
import MatchCard from './MatchCard';
import DayLabel from './DayLabel';

interface DayData { ymd: string; matches: Match[] }

interface Props {
  leagueName: string;
  upcomingDays: DayData[];
  totalMatches: number;
  countryName?: string;
}

function shortLabel(ymd: string): string {
  return dateFromYMD(ymd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function LeaguePageClient({ leagueName, upcomingDays, totalMatches, countryName }: Props) {
  const backHref = countryName ? `/league/${toSlug(leagueName)}/` : '/';
  const backLabel = countryName ? `← ${leagueName}` : '← Back';
  const heroTitle = countryName ? `${leagueName} on TV in ${countryName}` : leagueName;
  const heroIcon = countryName ? countryFlag(countryName) : getLeagueFlag(leagueName);

  return (
    <>
      {/* League hero */}
      <header className="league-hero">
        <div className="league-hero-icon" aria-hidden="true">{heroIcon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 className="league-hero-name">{heroTitle}</h1>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.78)', marginTop: 4 }}>
            {totalMatches} match{totalMatches !== 1 ? 'es' : ''} · 30-day guide
          </p>
        </div>
        <Link href={backHref} className="btn-back" style={{ flexShrink: 0 }}>{backLabel}</Link>
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

      {/* 30-day fixtures */}
      {upcomingDays.length === 0 ? (
        <div className="state-center">
          <div className="state-icon">📅</div>
          <div className="state-title">No {leagueName} matches in the current 30-day window</div>
          <div className="state-sub">Check back soon — schedules update daily.</div>
        </div>
      ) : (
        upcomingDays.map(({ ymd, matches }) => {
          const full = fmtDate(dateFromYMD(ymd));
          return (
            <section key={ymd} id={`lday-${ymd}`} className="day-section" aria-label={`${leagueName} matches on ${full}`}>
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

      {/* Country links — only on the global (non-country-filtered) league page */}
      {!countryName && (() => {
        const countries = [...new Set(
          upcomingDays.flatMap(d => d.matches.flatMap(m =>
            (m.tv_channels ?? []).map(tv => tv.country).filter((c): c is string => Boolean(c))
          ))
        )].sort();
        if (countries.length === 0) return null;
        return (
          <section className="seo-section" style={{ marginBottom: 12 }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 10 }}>
              <span className="y-bar" />Watch {leagueName} by Country
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {countries.map(c => (
                <Link
                  key={c}
                  href={`/league/${toSlug(leagueName)}/country/${toSlug(c)}/`}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '5px 12px', borderRadius: 20,
                    background: 'var(--bg-section)', border: '1px solid var(--border-lt)',
                    fontSize: '0.8rem', color: 'var(--text)', textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  {countryFlag(c)} {c}
                </Link>
              ))}
            </div>
          </section>
        );
      })()}

      {/* SEO */}
      <section className="seo-section">
        <h2><span className="y-bar" />
          {countryName
            ? `Watch ${leagueName} on TV in ${countryName}`
            : `Watch Live ${leagueName} Football on TV`}
        </h2>
        <p>
          {countryName ? (
            <>
              Find every <strong>{leagueName}</strong> match on TV in <strong>{countryName}</strong> with
              the complete 30-day schedule on CricFoot. Kick-off times are shown in your local timezone
              and each fixture lists the {countryName} broadcaster carrying the game.{' '}
              <Link href={`/league/${toSlug(leagueName)}/`} style={{ color: 'var(--navy)', fontWeight: 600 }}>
                View the worldwide {leagueName} schedule
              </Link>{' '}
              for coverage in all other countries.
            </>
          ) : (
            <>
              Watch live <strong>{leagueName}</strong> football on TV with the complete 30-day schedule on
              CricFoot. Every fixture, kick-off time, venue and which TV channels are broadcasting each match
              in your country.
            </>
          )}
        </p>
        <p>
          CricFoot covers all major football leagues including the <strong>Premier League</strong>,{' '}
          <strong>UEFA Champions League</strong>, <strong>La Liga</strong>, <strong>Serie A</strong>,{' '}
          <strong>Bundesliga</strong>, <strong>Ligue 1</strong> and many more. See the full schedule of{' '}
          <Link href="/" style={{ color: 'var(--navy)', fontWeight: 600 }}>live football on TV today</Link>{' '}
          for every competition.
        </p>
      </section>
    </>
  );
}
