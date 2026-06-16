import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchMatches } from '@/lib/api';
import { toSlug, scheduleDays, countryFlag, dateFromYMD, fmtDate } from '@/lib/utils';
import { WATCH_PAGES } from '@/config/watch-pages';
import MatchCard from '@/components/MatchCard';
import DayLabel from '@/components/DayLabel';
import Faq from '@/components/Faq';

export function generateStaticParams() {
  return WATCH_PAGES.map(p => ({ slug: p.slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

async function getData(slug: string) {
  const cfg = WATCH_PAGES.find(p => p.slug === slug);
  if (!cfg) return null;

  const dayData = await Promise.all(
    scheduleDays().map(async (ymd) => ({ ymd, matches: await fetchMatches(ymd) }))
  );

  const upcomingDays = dayData
    .map(({ ymd, matches }) => ({
      ymd,
      matches: matches.filter(m => {
        const leagueMatch = cfg.leagueId != null
          ? m.league_id === cfg.leagueId
          : m.league === cfg.leagueNameMatch || (m.league != null && toSlug(m.league) === cfg.leagueSlug);
        if (!leagueMatch) return false;
        if (!cfg.country) return true;
        return (m.tv_channels ?? []).some(tv => tv.country === cfg.country);
      }),
    }))
    .filter(d => d.matches.length > 0);

  return { cfg, upcomingDays };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cfg = WATCH_PAGES.find(p => p.slug === slug);
  if (!cfg) return {};

  const title = cfg.country
    ? `Where to Watch ${cfg.leagueName} in ${cfg.country} – TV Channels & Live Stream | CricFoot`
    : `Where to Watch ${cfg.leagueName} – TV Channels & Live Stream | CricFoot`;

  const description = cfg.country
    ? `How to watch ${cfg.leagueName} in ${cfg.country}: every broadcaster, streaming service, kick-off times and the full 30-day fixture schedule with ${cfg.country} TV channels.`
    : `How to watch ${cfg.leagueName} live on TV: broadcasters in every country, streaming services, kick-off times and the complete 30-day fixture schedule worldwide.`;

  return {
    title,
    description,
    keywords: cfg.keywords.join(', '),
    openGraph: { title, description },
    twitter: { title, description },
    alternates: { canonical: `/watch/${slug}/` },
  };
}

export default async function WatchPage({ params }: Props) {
  const { slug } = await params;
  const result = await getData(slug);
  if (!result) return <div className="state-center"><div className="state-title">Page not found</div></div>;

  const { cfg, upcomingDays } = result;
  const totalMatches = upcomingDays.reduce((s, d) => s + d.matches.length, 0);

  const pageTitle = cfg.country
    ? `Where to Watch ${cfg.leagueName} in ${cfg.country}`
    : `Where to Watch ${cfg.leagueName}`;

  const leagueHref = cfg.country && cfg.countrySlug
    ? `/league/${cfg.leagueSlug}/country/${cfg.countrySlug}/`
    : `/league/${cfg.leagueSlug}/`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: cfg.country
          ? `What channel is ${cfg.leagueName} on in ${cfg.country}?`
          : `Where can I watch ${cfg.leagueName} on TV?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: cfg.broadcasters.map(b => `${b.country}: ${b.channels.join(', ')}`).join('. '),
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <header className="page-head">
        <h1 className="page-title">
          {cfg.country ? countryFlag(cfg.country) : '📺'} {pageTitle}
        </h1>
        <p className="page-sub">
          {totalMatches > 0
            ? `${totalMatches} match${totalMatches !== 1 ? 'es' : ''} scheduled · TV channels · kick-off times`
            : 'TV channels, broadcasters and upcoming fixtures'}
        </p>
      </header>

      {/* Broadcaster table */}
      <section className="seo-section" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>
          <span className="y-bar" />
          {cfg.country ? `${cfg.leagueName} TV Channel in ${cfg.country}` : `${cfg.leagueName} TV Channels by Country`}
        </h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg-section)' }}>
              <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Country</th>
              <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>TV Channels / Streaming</th>
            </tr>
          </thead>
          <tbody>
            {cfg.broadcasters.map(b => (
              <tr key={b.country} style={{ borderBottom: '1px solid var(--border-lt)' }}>
                <td style={{ padding: '9px 12px', fontWeight: 500 }}>
                  {countryFlag(b.country)} {b.country}
                </td>
                <td style={{ padding: '9px 12px', color: 'var(--text-muted)' }}>
                  {b.channels.map((ch, i) => (
                    <span key={ch}>
                      <Link href={`/channel/${toSlug(ch)}/`} style={{ color: 'var(--navy)', fontWeight: 500 }}>
                        {ch}
                      </Link>
                      {i < b.channels.length - 1 && ', '}
                    </span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 10 }}>
          Broadcast rights vary by match and territory. Check each fixture below for exact channels —
          listings update daily. CricFoot is a TV guide only: we do not stream or broadcast any content.
        </p>
      </section>

      {/* Upcoming matches */}
      <div style={{ marginBottom: 8 }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="y-bar" />
          Upcoming {cfg.leagueName} Fixtures
          {cfg.country && ` on TV in ${cfg.country}`}
        </h2>
        {upcomingDays.length === 0 ? (
          <div className="state-center">
            <div className="state-icon">📅</div>
            <div className="state-title">No fixtures scheduled in the next 30 days</div>
            <div className="state-sub">Check back soon — schedules update daily.</div>
          </div>
        ) : (
          upcomingDays.map(({ ymd, matches }) => {
            const full = fmtDate(dateFromYMD(ymd));
            return (
              <section key={ymd} className="day-section" aria-label={`${cfg.leagueName} on ${full}`}>
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
      </div>

      {/* See full schedule link */}
      <div style={{ marginBottom: 20 }}>
        <Link href={leagueHref} className="btn-back">
          View full {cfg.leagueName} schedule →
        </Link>
      </div>

      {/* SEO text */}
      <section className="seo-section">
        <h2><span className="y-bar" />{pageTitle} — Guide</h2>
        <p>
          {cfg.country ? (
            <>
              <strong>{cfg.leagueName}</strong> is broadcast live in <strong>{cfg.country}</strong> on{' '}
              {cfg.broadcasters[0]?.channels.slice(0, 3).join(', ')}. Kick-off times above are shown
              in your local timezone automatically. Click any fixture for the full broadcaster listing
              and match details.
            </>
          ) : (
            <>
              <strong>{cfg.leagueName}</strong> is broadcast live across the world on multiple platforms.
              Kick-off times above are automatically shown in your local timezone. Click any fixture to
              see the complete country-by-country broadcaster list for that specific match.
            </>
          )}
        </p>
        <p>
          To watch <strong>{cfg.leagueName}</strong>, subscribe to or tune in to the official broadcaster
          in your country — most offer an app for mobile and Smart TV alongside their standard TV channel.
          Rights vary per match and territory, so always check the fixture listing above for the most
          accurate channel information.
        </p>
      </section>

      <Faq
        title={`${cfg.leagueName} — How to Watch FAQs`}
        items={[
          {
            q: cfg.country
              ? `What channel is ${cfg.leagueName} on in ${cfg.country}?`
              : `Where can I watch ${cfg.leagueName} on TV?`,
            a: cfg.country
              ? `In ${cfg.country}, ${cfg.leagueName} is broadcast on ${cfg.broadcasters[0]?.channels.join(', ') ?? 'various channels'}. Check each fixture above for the exact channel, as rights can vary by match.`
              : `${cfg.leagueName} is available on different channels depending on your country: ${cfg.broadcasters.slice(0, 4).map(b => `${b.country} (${b.channels.slice(0, 2).join(', ')})`).join('; ')}. Click any match above for full country listings.`,
          },
          {
            q: `Can I stream ${cfg.leagueName} online?`,
            a: `Yes — most official broadcasters offer a companion streaming service or app: ${cfg.broadcasters.slice(0, 3).map(b => `${b.country}: ${b.channels.find(c => c.includes('+') || c.toLowerCase().includes('live') || c.toLowerCase().includes('now') || c.toLowerCase().includes('dazn') || c.toLowerCase().includes('peacock') || c.toLowerCase().includes('hotstar')) ?? b.channels[b.channels.length - 1]}`).join('; ')}. CricFoot is a TV guide only and does not provide streams.`,
          },
          {
            q: `Are ${cfg.leagueName} kick-off times shown in my local timezone?`,
            a: 'Yes — every kick-off time on CricFoot is automatically converted to your device\'s local timezone, so you always see the correct local time wherever you are.',
          },
        ]}
      />
    </>
  );
}
