'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Match } from '@/types';
import { buildChannelMap, isPopular, toSlug, todayYMD, dateFromYMD } from '@/lib/utils';
import LeagueSection from './LeagueSection';

const POPULAR_LEAGUES = [
  'Premier League', 'UEFA Champions League', 'La Liga', 'Serie A', 'Bundesliga',
  'Ligue 1', 'UEFA Europa League', 'FA Cup', 'Copa del Rey', 'Eredivisie',
  'Portuguese Primeira Liga', 'Scottish Premiership', 'MLS', 'Liga MX',
  'Brazilian Série A', 'Argentine Primera División', 'Turkish Süper Lig',
];

interface DayData { ymd: string; matches: Match[] }
interface Props { allDayMatches: DayData[] }

function getTabParts(ymd: string) {
  const d = dateFromYMD(ymd);
  return {
    day: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
    date: d.getDate(),
  };
}

export default function HomeClient({ allDayMatches }: Props) {
  const todayYmd = todayYMD();
  const [activeDay, setActiveDay] = useState(todayYmd);
  const [q, setQ] = useState('');
  const [onTvOnly, setOnTvOnly] = useState(false);
  const [leagueFilter, setLeagueFilter] = useState('');

  // Scroll active tab into view on mount
  useEffect(() => {
    const el = document.getElementById(`dtab-${activeDay}`);
    el?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, []);

  const activeDayData = useMemo(
    () => allDayMatches.find(d => d.ymd === activeDay) ?? allDayMatches[0],
    [allDayMatches, activeDay]
  );

  const allLeagues = useMemo(() => {
    const set = new Set<string>();
    (activeDayData?.matches ?? []).forEach(m => m.league && set.add(m.league));
    return [...set].sort();
  }, [activeDayData]);

  const filteredMatches = useMemo(() => {
    let ms = activeDayData?.matches ?? [];
    if (q) {
      const lq = q.toLowerCase().trim();
      ms = ms.filter(m => {
        const chs = (m.tv_channels ?? []).flatMap(tv => tv.channels ?? []).join(' ');
        return `${m.fixture ?? ''} ${m.league ?? ''} ${m.venue ?? ''} ${chs}`.toLowerCase().includes(lq);
      });
    }
    if (onTvOnly) {
      ms = ms.filter(m => (m.tv_channels ?? []).some(tv => (tv.channels ?? []).length > 0));
    }
    if (leagueFilter) {
      ms = ms.filter(m => m.league === leagueFilter);
    }
    return ms;
  }, [activeDayData, q, onTvOnly, leagueFilter]);

  const groupedMatches = useMemo(() => {
    const byLeague: Record<string, Match[]> = {};
    filteredMatches.forEach(m => {
      const k = m.league || 'Other';
      if (!byLeague[k]) byLeague[k] = [];
      byLeague[k].push(m);
    });
    return Object.fromEntries(
      Object.entries(byLeague).sort(([a], [b]) =>
        a === 'Other' ? 1 : b === 'Other' ? -1 : a.localeCompare(b)
      )
    );
  }, [filteredMatches]);

  const allChannels = useMemo(() => {
    const chMap = buildChannelMap(allDayMatches.flatMap(d => d.matches));
    return [...chMap.entries()].sort((a, b) => b[1].matches.length - a[1].matches.length);
  }, [allDayMatches]);

  const totalMatches  = allDayMatches.reduce((s, d) => s + d.matches.length, 0);
  const totalLeagues  = new Set(allDayMatches.flatMap(d => d.matches.map(m => m.league).filter(Boolean))).size;
  const totalChannels = new Set(
    allDayMatches.flatMap(d => d.matches.flatMap(m => (m.tv_channels ?? []).flatMap(tv => tv.channels ?? [])))
  ).size;

  return (
    <>
      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-val">{totalMatches}</div>
          <div className="stat-label">Matches (7 days)</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{totalLeagues}</div>
          <div className="stat-label">Leagues</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{totalChannels}</div>
          <div className="stat-label">Channels</div>
        </div>
      </div>

      {/* Date tabs */}
      <div className="date-tabs-wrap" aria-label="Select day">
        <div className="date-tabs">
          {allDayMatches.map(({ ymd, matches }) => {
            const { day, date } = getTabParts(ymd);
            return (
              <button
                key={ymd}
                id={`dtab-${ymd}`}
                className={`date-tab${activeDay === ymd ? ' active' : ''}`}
                onClick={() => { setActiveDay(ymd); setLeagueFilter(''); setQ(''); setOnTvOnly(false); }}
                aria-pressed={activeDay === ymd}
                title={`${matches.length} matches`}
                type="button"
              >
                <span className="date-tab-day">{day}</span>
                <span className="date-tab-num">{date}</span>
              </button>
            );
          })}
          <div className="date-tab date-tab-cal" title="Calendar view">📅</div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <label className="filter-toggle-label">
          <input
            type="checkbox"
            className="filter-toggle"
            checked={onTvOnly}
            onChange={e => setOnTvOnly(e.target.checked)}
            aria-label="Show only matches on TV"
          />
          On TV
        </label>

        <div className="filter-divider" />

        <select
          className="filter-select"
          value={leagueFilter}
          onChange={e => setLeagueFilter(e.target.value)}
          aria-label="Filter by league"
        >
          <option value="">League</option>
          {allLeagues.map(l => <option key={l} value={l}>{l}</option>)}
        </select>

        <div className="filter-divider" />

        <input
          className="filter-search"
          type="search"
          placeholder="Search teams, leagues, channels…"
          value={q}
          onChange={e => setQ(e.target.value)}
          aria-label="Search matches"
        />
      </div>

      {/* Match count */}
      <p className="tz-note" style={{ padding: '7px 0 10px', borderBottom: '1px solid var(--border-lt)', marginBottom: 10 }}>
        {filteredMatches.length} match{filteredMatches.length !== 1 ? 'es' : ''} · All times in your local timezone
      </p>

      {/* League sections */}
      {Object.keys(groupedMatches).length === 0 ? (
        <div className="state-center">
          <div className="state-icon">📅</div>
          <div className="state-title">No matches found</div>
          <div className="state-sub">Try different search terms or clear your filters.</div>
        </div>
      ) : (
        <div>
          {Object.entries(groupedMatches).map(([league, matches]) => (
            <LeagueSection key={league} league={league} matches={matches} ymd={activeDay} />
          ))}
        </div>
      )}

      {/* All Channels (shown when no filters active) */}
      {!q && !onTvOnly && !leagueFilter && allChannels.length > 0 && (
        <section className="channels-section" aria-label="All broadcasting channels" style={{ marginTop: 28 }}>
          <h2 className="section-heading">
            <div className="accent-bar" />
            📺 All Channels
            <span className="count-badge">{allChannels.length}</span>
          </h2>
          <div className="channel-grid">
            {allChannels.map(([ch, info]) => {
              const pop = isPopular(ch);
              const initials = ch.replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase() || '📺';
              return (
                <Link
                  key={ch}
                  href={`/channel/${toSlug(ch)}`}
                  className={`channel-card${pop ? ' popular' : ''}`}
                  aria-label={`${ch} — ${info.matches.length} matches`}
                >
                  <div className={`channel-icon ${pop ? 'popular-icon' : 'normal'}`} aria-hidden="true">
                    {initials}
                  </div>
                  <div className="channel-card-name">{ch}</div>
                  <div className="channel-match-count">{info.matches.length} match{info.matches.length !== 1 ? 'es' : ''}</div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* SEO */}
      <section className="seo-section">
        <h2><span className="y-bar" />About CricFoot Football TV Guide</h2>
        <p>
          <strong>CricFoot</strong> is your free 7-day football TV guide. Find match fixtures, kick-off times
          and TV channel listings for the <strong>Premier League</strong>, <strong>UEFA Champions League</strong>,{' '}
          <strong>La Liga</strong>, <strong>Serie A</strong>, <strong>Bundesliga</strong>, <strong>Ligue 1</strong>
          and hundreds more competitions worldwide.
        </p>
        <p>
          Whether you watch on <strong>Sky Sports</strong>, <strong>ESPN</strong>, <strong>beIN Sports</strong>,{' '}
          <strong>DAZN</strong>, <strong>TNT Sports</strong> or any other broadcaster, CricFoot shows you exactly
          which channel to tune into — filtered by your country. All kick-off times in your local timezone.
        </p>
        <h3>Popular Football Leagues</h3>
        <div className="tag-cloud">
          {POPULAR_LEAGUES.map(l => (
            <Link key={l} href={`/league/${toSlug(l)}`} className="tag-pill">{l}</Link>
          ))}
        </div>
      </section>
    </>
  );
}
