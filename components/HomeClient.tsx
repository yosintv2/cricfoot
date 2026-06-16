'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Match } from '@/types';
import { buildChannelMap, groupByLeaguePinned, isPopular, toSlug, todayYMD, dateFromYMD, isoFromYMD } from '@/lib/utils';
import { useLang } from '@/contexts/LangContext';
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
    month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
  };
}

export default function HomeClient({ allDayMatches }: Props) {
  const { t } = useLang();
  const todayYmd = todayYMD();
  const [activeDay, setActiveDay] = useState(todayYmd);
  const [q, setQ] = useState('');
  const [onTvOnly, setOnTvOnly] = useState(false);
  const [leagueFilter, setLeagueFilter] = useState('');

  // On mount, snap to the visitor's own "today" (build server may be a day
  // off in their timezone) and scroll the active tab into view.
  useEffect(() => {
    const clientToday = todayYMD();
    const day = allDayMatches.some(d => d.ymd === clientToday) ? clientToday : activeDay;
    if (day !== activeDay) setActiveDay(day);
    document.getElementById(`dtab-${day}`)?.scrollIntoView({ block: 'nearest', inline: 'center' });
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

  const groupedMatches = useMemo(() => groupByLeaguePinned(filteredMatches), [filteredMatches]);

  const allChannels = useMemo(() => {
    const chMap = buildChannelMap(allDayMatches.flatMap(d => d.matches));
    return [...chMap.entries()].sort((a, b) => b[1].matches.length - a[1].matches.length);
  }, [allDayMatches]);

  return (
    <>
      {/* Page heading */}
      <header className="page-head">
        <h1 className="page-title">{t?.h1 ?? '⚽ Live Football Match Today'}</h1>
        <p className="page-sub">
          {t?.sub ?? 'Live football on TV — every match today and the next two weeks, with kick-off times and channels, free.'}
        </p>
      </header>

      {/* Date tabs — full 30 days on desktop, first 7 on mobile */}
      <div className="date-tabs-wrap" aria-label="Select day">
        <div className="date-tabs">
          {allDayMatches.map(({ ymd, matches }, idx) => {
            const { day, date, month } = getTabParts(ymd);
            return (
              // Each day navigates to its own /schedules/ URL so the address
              // bar always reflects the selected date (and stays crawlable).
              <Link
                key={ymd}
                id={`dtab-${ymd}`}
                href={`/schedules/${isoFromYMD(ymd)}/`}
                prefetch={false}
                className={`date-tab${activeDay === ymd ? ' active' : ''}${idx >= 7 ? ' date-tab-far' : ''}`}
                aria-current={activeDay === ymd ? 'date' : undefined}
                title={`${matches.length} matches`}
              >
                <span className="date-tab-day">{day}</span>
                <span className="date-tab-num">{date}</span>
                <span className="date-tab-month">{month}</span>
              </Link>
            );
          })}
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
          {t?.filterOnTV ?? 'On TV'}
        </label>

        <div className="filter-divider" />

        <select
          className="filter-select"
          value={leagueFilter}
          onChange={e => setLeagueFilter(e.target.value)}
          aria-label="Filter by league"
        >
          <option value="">{t?.filterAllLeagues ?? 'League'}</option>
          {allLeagues.map(l => <option key={l} value={l}>{l}</option>)}
        </select>

        <div className="filter-divider" />

        <input
          className="filter-search"
          type="search"
          placeholder={t?.filterSearchPlaceholder ?? 'Search teams, leagues, channels…'}
          value={q}
          onChange={e => setQ(e.target.value)}
          aria-label="Search matches"
        />
      </div>

      {/* Match count */}
      <p className="tz-note" style={{ padding: '7px 0 10px', borderBottom: '1px solid var(--border-lt)', marginBottom: 10 }}>
        {t ? t.matchCount(filteredMatches.length) : `${filteredMatches.length} match${filteredMatches.length !== 1 ? 'es' : ''}`}
      </p>

      {/* League sections */}
      {Object.keys(groupedMatches).length === 0 ? (
        <div className="state-center">
          <div className="state-icon">📅</div>
          <div className="state-title">{t?.noMatchesFound ?? 'No matches found'}</div>
          <div className="state-sub">{t?.tryDifferentSearch ?? 'Try different search terms or clear your filters.'}</div>
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
            📺 {t?.allChannelsHeading ?? 'All Channels'}
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
                  <div className="channel-match-count">{t ? t.matchCount(info.matches.length) : `${info.matches.length} match${info.matches.length !== 1 ? 'es' : ''}`}</div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* SEO */}
      <section className="seo-section">
        <h2><span className="y-bar" />Live Football Match Today — Your Live Football on TV Guide</h2>
        <p>
          <strong>CricFoot</strong> is your free guide to every <strong>live football match today</strong>.
          See all <strong>live football on TV</strong> today and over the next two weeks — fixtures, kick-off
          times and TV channel listings for the <strong>Premier League</strong>,{' '}
          <strong>UEFA Champions League</strong>, <strong>La Liga</strong>, <strong>Serie A</strong>,{' '}
          <strong>Bundesliga</strong>, <strong>Ligue 1</strong> and hundreds more competitions worldwide.
        </p>
        <p>
          Looking for a <strong>live football match today</strong>? Whether you watch live football on{' '}
          <strong>Sky Sports</strong>, <strong>ESPN</strong>, <strong>beIN Sports</strong>, <strong>DAZN</strong>,{' '}
          <strong>TNT Sports</strong> or any other broadcaster, our TV schedule shows exactly which channel to
          tune into — country by country, with every kick-off in your local timezone. A free alternative to
          LiveSoccerTV, updated daily.
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
