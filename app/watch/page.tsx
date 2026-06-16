import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchMatches } from '@/lib/api';
import { toSlug, scheduleDays, countryFlag, getLeagueFlag } from '@/lib/utils';
import { QUICK_LEAGUES } from '@/config/leagues';

export const metadata: Metadata = {
  title: 'Where to Watch Football on TV – All Leagues by Country | CricFoot',
  description: 'Find out where to watch every football league on TV — Premier League, Champions League, World Cup and more. Browse by league and country to find your broadcaster.',
  keywords: 'where to watch football on tv, football tv channels, watch football live, football broadcast guide, soccer tv schedule',
  alternates: { canonical: 'https://www.cricfoot.net/watch/' },
  openGraph: {
    title: 'Where to Watch Football on TV – All Leagues | CricFoot',
    description: 'Complete guide to football TV channels worldwide — browse by league and find your broadcaster.',
  },
};

interface LeagueCard {
  slug: string;
  label: string;
  flag: string;
  matchCount: number;
  countryCount: number;
  topChannels: string[];
}

async function getData(): Promise<LeagueCard[]> {
  const allMatches = (await Promise.all(scheduleDays().map(fetchMatches))).flat();

  const leagueMap = new Map<string, {
    label: string;
    flag: string;
    matches: number;
    countries: Set<string>;
    channels: Set<string>;
  }>();

  allMatches.forEach(m => {
    if (!m.league) return;
    const cfg = QUICK_LEAGUES.find(l => l.id != null && l.id === m.league_id)
      ?? QUICK_LEAGUES.find(l => l.name === m.league);
    const label = cfg?.label ?? m.league;
    const slug = cfg ? toSlug(cfg.label) : toSlug(m.league);
    const flag = cfg?.flag ?? getLeagueFlag(m.league);

    if (!leagueMap.has(slug)) {
      leagueMap.set(slug, { label, flag, matches: 0, countries: new Set(), channels: new Set() });
    }
    const entry = leagueMap.get(slug)!;
    entry.matches++;
    (m.tv_channels ?? []).forEach(tv => {
      if (tv.country) entry.countries.add(tv.country);
      (tv.channels ?? []).forEach(ch => entry.channels.add(ch));
    });
  });

  // Sort: QUICK_LEAGUES pinned first (by their order), then rest alphabetically
  const quickSlugs = QUICK_LEAGUES.map(q => toSlug(q.label));
  const cards: LeagueCard[] = [];

  // Pinned leagues first
  quickSlugs.forEach(slug => {
    const e = leagueMap.get(slug);
    if (e) {
      cards.push({
        slug,
        label: e.label,
        flag: e.flag,
        matchCount: e.matches,
        countryCount: e.countries.size,
        topChannels: [...e.channels].sort().slice(0, 3),
      });
    }
  });

  // Remaining leagues alphabetically
  [...leagueMap.entries()]
    .filter(([slug]) => !quickSlugs.includes(slug))
    .sort(([, a], [, b]) => a.label.localeCompare(b.label))
    .forEach(([slug, e]) => {
      cards.push({
        slug,
        label: e.label,
        flag: e.flag,
        matchCount: e.matches,
        countryCount: e.countries.size,
        topChannels: [...e.channels].sort().slice(0, 3),
      });
    });

  return cards;
}

export default async function WatchIndexPage() {
  const leagues = await getData();
  const totalMatches = leagues.reduce((s, l) => s + l.matchCount, 0);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Where to Watch Football on TV',
    description: 'Complete guide to football TV channels for every league worldwide.',
    url: 'https://www.cricfoot.net/watch/',
    numberOfItems: leagues.length,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="page-head">
        <h1 className="page-title">📺 Where to Watch Football on TV</h1>
        <p className="page-sub">
          {leagues.length} league{leagues.length !== 1 ? 's' : ''} · {totalMatches} upcoming matches · updated every hour
        </p>
      </header>

      <section className="seo-section" style={{ marginBottom: 24 }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
          Find your football league below and click to see every broadcaster by country,
          streaming services, kick-off times and the full 30-day fixture schedule.
        </p>
      </section>

      {leagues.length === 0 ? (
        <div className="state-center">
          <div className="state-icon">📅</div>
          <div className="state-title">No fixtures found in the next 30 days</div>
          <div className="state-sub">Check back soon — schedules update every hour.</div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 12,
          marginBottom: 32,
        }}>
          {leagues.map(league => (
            <Link
              key={league.slug}
              href={`/watch/${league.slug}/`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                padding: '14px 16px',
                background: 'var(--bg-section)',
                border: '1px solid var(--border-lt)',
                borderRadius: 8,
                textDecoration: 'none',
                color: 'inherit',
                transition: 'border-color 0.15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.3rem' }}>{league.flag}</span>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--navy)' }}>
                  {league.label}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <span>🌍 {league.countryCount} countr{league.countryCount !== 1 ? 'ies' : 'y'}</span>
                <span>📅 {league.matchCount} match{league.matchCount !== 1 ? 'es' : ''}</span>
              </div>
              {league.topChannels.length > 0 && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  📺 {league.topChannels.join(' · ')}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      <section className="seo-section">
        <h2><span className="y-bar" />How to Find Football on TV</h2>
        <p>
          CricFoot aggregates live broadcast data from hundreds of TV channels worldwide.
          Select any league above to see <strong>every broadcaster by country</strong> —
          including cable channels, satellite TV and official streaming services.
          Kick-off times are automatically adjusted to your local timezone.
        </p>
        <p>
          Can't find your league? The list updates every hour as new fixtures are confirmed.
          CricFoot is a TV guide only — we do not host, stream, or broadcast any content.
        </p>
      </section>
    </>
  );
}
