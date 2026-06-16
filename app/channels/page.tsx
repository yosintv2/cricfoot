import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchMatches } from '@/lib/api';
import { todayYMD, buildChannelMap, isPopular, toSlug } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Football TV Channel Rankings – All Channels | CricFoot',
  description:
    'Browse all football TV channels ranked by number of live matches. Find which broadcasters have the most football today including ESPN, Sky Sports, beIN Sports, DAZN and more.',
  openGraph: {
    title: 'Football TV Channel Rankings | CricFoot',
    description: 'All football TV channels ranked by match count. Find the best sports broadcaster for live football.',
  },
  alternates: { canonical: '/channels/' },
};

export default async function ChannelsPage() {
  const ymd = todayYMD();
  const matches = await fetchMatches(ymd);
  const chMap = buildChannelMap(matches);

  const ranked = [...chMap.entries()]
    .sort((a, b) => b[1].matches.length - a[1].matches.length || a[0].localeCompare(b[0]))
    .map(([name, info], idx) => ({
      rank: idx + 1,
      name,
      matchCount: info.matches.length,
      countries: [...info.countries].filter(Boolean).sort(),
      leagues: [...new Set(info.matches.map(m => m.league).filter(Boolean))].slice(0, 5),
    }));

  const dateLabel = `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Football TV Channel Rankings',
    description: 'All football broadcasting channels ranked by number of live matches',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.cricfoot.net/' },
        { '@type': 'ListItem', position: 2, name: 'All Channels' },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="rankings-hero" aria-label="Channel rankings">
        <h1 className="hero-title">📺 Football TV Channel Rankings</h1>
        <p className="hero-sub">
          All {ranked.length} channels broadcasting live football — ranked by match count for {dateLabel}.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
          <div className="stat-card" style={{ flex: 'none', minWidth: 100 }}>
            <div className="stat-val">{ranked.length}</div>
            <div className="stat-label">Channels</div>
          </div>
          <div className="stat-card" style={{ flex: 'none', minWidth: 100 }}>
            <div className="stat-val">{matches.length}</div>
            <div className="stat-label">Matches</div>
          </div>
          <div className="stat-card" style={{ flex: 'none', minWidth: 100 }}>
            <div className="stat-val">{new Set(matches.map(m => m.league).filter(Boolean)).size}</div>
            <div className="stat-label">Leagues</div>
          </div>
        </div>
      </section>

      {/* Channel grid (visual) */}
      <h2 className="section-heading" style={{ marginBottom: 16 }}>
        <div className="accent-bar" />
        Top Channels by Match Count
      </h2>

      <div className="channel-grid" style={{ marginBottom: 36 }}>
        {ranked.slice(0, 24).map(ch => {
          const pop = isPopular(ch.name);
          return (
            <Link
              key={ch.name}
              href={`/channel/${toSlug(ch.name)}`}
              className={`channel-card${pop ? ' popular' : ''}`}
              aria-label={`${ch.name} – rank #${ch.rank}, ${ch.matchCount} matches`}
            >
              <div className={`channel-rank-badge${ch.rank <= 3 ? ' top' : ''}`}>#{ch.rank}</div>
              <div className={`channel-icon ${pop ? 'popular-icon' : 'normal'}`} aria-hidden="true">📺</div>
              <div className="channel-card-name">{ch.name}</div>
              <div className="channel-match-count">{ch.matchCount} match{ch.matchCount !== 1 ? 'es' : ''}</div>
            </Link>
          );
        })}
      </div>

      {/* Full rankings table */}
      <h2 className="section-heading" style={{ marginBottom: 16 }}>
        <div className="accent-bar" />
        Full Channel Rankings Table
      </h2>

      <div style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid var(--white-10)', borderRadius: 12, overflow: 'hidden', marginBottom: 32 }}>
        <table className="rankings-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Channel</th>
              <th>Matches</th>
              <th>Countries</th>
              <th>Top Leagues</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map(ch => (
              <tr key={ch.name}>
                <td>
                  <span className={`rank-num${ch.rank <= 3 ? ' top3' : ''}`}>#{ch.rank}</span>
                </td>
                <td>
                  <Link href={`/channel/${toSlug(ch.name)}`} className="rank-channel-name">
                    {isPopular(ch.name) && <span style={{ marginRight: 6 }}>⭐</span>}
                    {ch.name}
                  </Link>
                </td>
                <td>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--green-400)' }}>
                    {ch.matchCount}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '0.72rem', color: 'var(--blue-200)' }}>
                    {ch.countries.slice(0, 3).join(', ')}{ch.countries.length > 3 ? ` +${ch.countries.length - 3}` : ''}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {ch.leagues.map(l => (
                      <Link
                        key={l}
                        href={`/league/${toSlug(l!)}`}
                        style={{
                          fontSize: '0.65rem',
                          background: 'rgba(168,85,247,0.15)',
                          color: 'var(--purple-400)',
                          padding: '1px 7px',
                          borderRadius: 4,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {l}
                      </Link>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SEO content */}
      <section className="seo-section">
        <h2><span className="y-bar" />Football Broadcasting Channels Worldwide</h2>
        <p>
          CricFoot tracks every football broadcasting channel worldwide and ranks them by the number of live
          matches they broadcast each day. From global giants like <strong>ESPN</strong>, <strong>Sky Sports</strong>,{' '}
          <strong>beIN Sports</strong> and <strong>DAZN</strong> to regional broadcasters covering domestic leagues,
          CricFoot's channel rankings help you discover which services offer the most live football coverage.
        </p>
        <p>
          Click on any channel to see its complete daily schedule, including all matches, competitions, kick-off
          times and country-specific broadcasting information. All times are shown in your local timezone.
        </p>
        <h3>Find the Right Channel for You</h3>
        <p>
          Whether you&apos;re looking for the <strong>Premier League</strong>, <strong>Champions League</strong>,{' '}
          <strong>La Liga</strong> or any other competition, our channel ranking page shows you which broadcaster
          carries the most football in your region. Filter by country on the home page to see channels available
          where you are.
        </p>
      </section>
    </>
  );
}
