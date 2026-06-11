'use client';

import Link from 'next/link';
import { Match } from '@/types';
import { dateFromYMD, fmtDate } from '@/lib/utils';
import LeagueSection from './LeagueSection';
import DayLabel from './DayLabel';

interface DayData { ymd: string; matches: Match[] }

interface Props {
  channelName: string;
  upcomingDays: DayData[];
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

const CHANNEL_KEYWORDS = (ch: string) => [
  `${ch} Live Stream Free`, `${ch} Free Live Streaming`, `Watch ${ch} Live Online`,
  `${ch} Live TV Free`, `${ch} Football Live Stream`, `Watch Football on ${ch}`,
  `${ch} Soccer Live TV`, `${ch} Sports Channel Live`, `${ch} HD Live Stream`,
  `${ch} Live Match Today`, `${ch} Football Today`, `${ch} TV Guide Today`,
  `${ch} Live Football Schedule`, `${ch} Match Fixtures Today`, `${ch} Live Sports TV`,
  `${ch} UEFA Champions League Live`, `${ch} Premier League Live`, `${ch} La Liga Live Stream`,
  `${ch} Serie A Live`, `${ch} Bundesliga Live TV`,
];

export default function ChannelPageClient({ channelName, upcomingDays }: Props) {
  const totalMatches = upcomingDays.reduce((s, d) => s + d.matches.length, 0);
  const initials = channelName.replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase() || '📺';

  return (
    <>
      {/* Channel hero */}
      <header className="channel-hero">
        <div className="channel-hero-icon" aria-hidden="true">{initials}</div>
        <div className="channel-hero-info">
          <h1 className="channel-hero-name">{channelName}</h1>
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
        <h2><span className="y-bar" />About {channelName} Football Coverage</h2>
        <p>
          <strong>{channelName}</strong> is a football broadcasting channel tracked by CricFoot.
          Find every upcoming match scheduled on {channelName} — including kick-off times, league competitions
          and fixture information. All times are shown in your local timezone.
        </p>
        <p>
          CricFoot provides football TV schedules and channel guidance only.{' '}
          <strong>We do not host, stream, or broadcast any live TV channels or content.</strong>{' '}
          For actual live streaming, please use your authorised TV service or broadcaster.
        </p>
        <h3>Find {channelName} Live Football</h3>
        <div className="tag-cloud">
          {CHANNEL_KEYWORDS(channelName).map(kw => (
            <span key={kw} className="tag-pill">{kw}</span>
          ))}
        </div>
      </section>
    </>
  );
}
