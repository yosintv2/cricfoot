import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchMatches } from '@/lib/api';
import { toSlug, toYMD, fmtKick, countryFlag, dateFromYMD, fmtDate, getLeagueFlag, matchSlug } from '@/lib/utils';
import { Match } from '@/types';

function next7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return toYMD(d);
  });
}

export async function generateStaticParams() {
  const days = next7Days();
  const params: { slug: string }[] = [];
  const seen = new Set<string>();
  await Promise.all(
    days.map(async ymd => {
      const matches = await fetchMatches(ymd);
      matches.forEach(m => {
        if (!m.fixture) return;
        const slug = matchSlug(ymd, m.fixture);
        if (!seen.has(slug)) {
          seen.add(slug);
          params.push({ slug });
        }
      });
    })
  );
  return params;
}

interface Props {
  params: Promise<{ slug: string }>;
}

async function findMatch(slug: string): Promise<{ match: Match | null; ymd: string }> {
  const decoded = decodeURIComponent(slug);
  const ymd = decoded.slice(0, 8);
  const fixtureSlug = decoded.slice(9); // skip the dash after the date
  if (!/^\d{8}$/.test(ymd) || !fixtureSlug) return { match: null, ymd };
  const matches = await fetchMatches(ymd);
  const match = matches.find(m => m.fixture && toSlug(m.fixture) === fixtureSlug) ?? null;
  return { match, ymd };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { match } = await findMatch(slug);
  const fixture = match?.fixture ?? decodeURIComponent(slug).slice(9).replace(/-/g, ' ');

  return {
    title: `${fixture} Live Stream and TV Schedule | CricFoot`,
    description: `${fixture} live on TV: full list of broadcasting channels by country, kick-off time${match?.venue ? `, venue (${match.venue})` : ''} and competition details. Find where to watch ${fixture} in your country.`,
    keywords: `${fixture} live stream, ${fixture} tv channel, watch ${fixture} live, ${fixture} broadcast, ${fixture} kick-off time`,
    openGraph: {
      title: `${fixture} Live Stream and TV Schedule`,
      description: `Where to watch ${fixture} — TV channels by country, kick-off time and venue.`,
    },
    twitter: {
      title: `${fixture} – TV Channels & Kick-off`,
      description: `Full broadcast list for ${fixture}.`,
    },
    alternates: { canonical: `/match/${slug}` },
  };
}

export default async function MatchPage({ params }: Props) {
  const { slug } = await params;
  const { match, ymd } = await findMatch(slug);

  if (!match) {
    return (
      <div className="state-center">
        <div className="state-icon">📅</div>
        <div className="state-title">Match not listed for this date</div>
        <div className="state-sub">
          This match may have no TV listings for today or the selected date. Schedules update daily — check back soon.
        </div>
        <Link href="/" className="btn-back" style={{ marginTop: 20, display: 'inline-flex' }}>
          ← View today&apos;s matches
        </Link>
      </div>
    );
  }

  const tvChs = [...(match.tv_channels ?? [])].sort((a, b) =>
    (a.country ?? '').localeCompare(b.country ?? '')
  );
  const totalCh = tvChs.reduce((a, tv) => a + (tv.channels ?? []).length, 0);
  const dateLabel = fmtDate(dateFromYMD(ymd));
  const kickoffISO = match.kickoff ? new Date(match.kickoff * 1000).toISOString() : undefined;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: match.fixture,
    ...(kickoffISO && { startDate: kickoffISO }),
    ...(match.venue && { location: { '@type': 'Place', name: match.venue } }),
    ...(match.league && { superEvent: { '@type': 'SportsEvent', name: match.league } }),
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.cricfoot.net/' },
        { '@type': 'ListItem', position: 2, name: match.fixture },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Title — grey heading + red bar, like the reference */}
      <header style={{ margin: '20px 0 0' }}>
        <h1 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>
          {match.fixture} Live Stream and TV Schedule
        </h1>
        <div style={{ height: 4, background: 'var(--red)', borderRadius: 1 }} />
      </header>

      {/* Match meta strip */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '6px 18px', alignItems: 'center',
        padding: '12px 2px', borderBottom: '1px solid var(--border-lt)', marginBottom: 0,
        fontSize: '0.85rem', color: 'var(--text-mid)',
      }}>
        <span style={{ fontWeight: 700, color: 'var(--text)' }}>🕒 {fmtKick(match.kickoff)}</span>
        <span>📅 {dateLabel}</span>
        {match.league && (
          <Link href={`/league/${toSlug(match.league)}`} style={{ color: 'var(--navy)', fontWeight: 600 }}>
            {getLeagueFlag(match.league)} {match.league}
          </Link>
        )}
        {match.venue && <span>📍 {match.venue}</span>}
        <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          {totalCh} channel{totalCh !== 1 ? 's' : ''} worldwide · times in your local timezone
        </span>
      </div>

      {/* Country / channel table */}
      {tvChs.length === 0 ? (
        <div className="state-center">
          <div className="state-icon">📺</div>
          <div className="state-title">No broadcast information available</div>
          <div className="state-sub">TV listings for this match haven&apos;t been published yet. Check back closer to kick-off.</div>
        </div>
      ) : (
        <div style={{ border: '1px solid var(--border-lt)', borderTop: 'none', borderRadius: '0 0 6px 6px', overflow: 'hidden', marginBottom: 24 }}>
          <table className="country-table" aria-label={`TV channels broadcasting ${match.fixture} by country`}>
            <tbody>
              {tvChs.map((tv, ti) => (
                <tr key={ti}>
                  <td className="ct-flag-name">
                    <span className="ct-flag-icon" aria-hidden="true">{countryFlag(tv.country ?? '')}</span>
                    {tv.country || 'International'}
                  </td>
                  <td className="ct-channels">
                    {(tv.channels ?? []).map((ch, i) => (
                      <span key={ch}>
                        <Link href={`/channel/${toSlug(ch)}`} className="ct-ch-link" title={`View all matches on ${ch}`}>
                          {ch}
                        </Link>
                        {i < (tv.channels ?? []).length - 1 && ', '}
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Link href="/" className="btn-back">← Back to all matches</Link>

      {/* SEO */}
      <section className="seo-section">
        <h2><span className="y-bar" />Where to Watch {match.fixture}</h2>
        <p>
          Find every TV channel broadcasting <strong>{match.fixture}</strong>
          {match.league && <> in the <strong>{match.league}</strong></>} on {dateLabel}.
          The table above lists official broadcasters country by country — click any channel to see its full
          football schedule for the next 7 days.
        </p>
        <p>
          CricFoot provides TV listings and schedules only.{' '}
          <strong>We do not stream, host, or broadcast any content.</strong>{' '}
          To watch the match, use your authorised TV service or broadcaster in your country.
        </p>
      </section>
    </>
  );
}
