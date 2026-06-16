import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchMatches } from '@/lib/api';
import { fromSlug, toSlug, scheduleDays, countryFlag, getLeagueFlag, dateFromYMD, fmtDate } from '@/lib/utils';
import { QUICK_LEAGUES } from '@/config/leagues';
import MatchCard from '@/components/MatchCard';
import DayLabel from '@/components/DayLabel';
import Faq from '@/components/Faq';

interface Props { params: Promise<{ slug: string; country: string }> }

export async function generateStaticParams() {
  const allMatches = (await Promise.all(scheduleDays().map(fetchMatches))).flat();
  const combos = new Set<string>();

  allMatches.forEach(m => {
    if (!m.league) return;
    const cfg = QUICK_LEAGUES.find(l => l.id != null && l.id === m.league_id);
    const leagueSlug = cfg ? toSlug(cfg.label) : toSlug(m.league);
    (m.tv_channels ?? []).forEach(tv => {
      if (tv.country) combos.add(`${leagueSlug}|${toSlug(tv.country)}`);
    });
  });

  return [...combos].map(combo => {
    const [slug, country] = combo.split('|');
    return { slug, country };
  });
}

async function getData(slugParam: string, countryParam: string) {
  const slug = decodeURIComponent(slugParam);
  const countrySlug = decodeURIComponent(countryParam);

  const dayData = await Promise.all(
    scheduleDays().map(async ymd => ({ ymd, matches: await fetchMatches(ymd) }))
  );

  const cfg = QUICK_LEAGUES.find(l => toSlug(l.label) === slug);

  let leagueName: string | null = null;
  let countryName: string | null = null;

  outer: for (const { matches } of dayData) {
    for (const m of matches) {
      if (!leagueName && m.league) {
        if (cfg?.id != null && m.league_id === cfg.id) leagueName = m.league.split(',')[0].trim();
        else if (!cfg && toSlug(m.league) === slug) leagueName = m.league;
      }
      if (!countryName) {
        for (const tv of m.tv_channels ?? []) {
          if (tv.country && toSlug(tv.country) === countrySlug) { countryName = tv.country; break; }
        }
      }
      if (leagueName && countryName) break outer;
    }
  }

  leagueName = leagueName ?? (cfg?.label ?? fromSlug(slug));
  countryName = countryName ?? fromSlug(countrySlug);

  const upcomingDays = dayData
    .map(({ ymd, matches }) => ({
      ymd,
      matches: matches.filter(m => {
        const leagueMatch = cfg?.id != null
          ? m.league_id === cfg.id
          : m.league != null && toSlug(m.league) === slug;
        if (!leagueMatch) return false;
        return (m.tv_channels ?? []).some(tv => tv.country && toSlug(tv.country) === countrySlug);
      }),
    }))
    .filter(d => d.matches.length > 0);

  // Channels specific to this country
  const channelSet = new Set<string>();
  upcomingDays.flatMap(d => d.matches).forEach(m => {
    (m.tv_channels ?? []).forEach(tv => {
      if (tv.country && toSlug(tv.country) === countrySlug) {
        (tv.channels ?? []).forEach(ch => channelSet.add(ch));
      }
    });
  });
  const channels = [...channelSet].sort();

  return { leagueName, countryName, upcomingDays, channels, slug };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, country } = await params;
  const { leagueName, countryName } = await getData(slug, country);
  const flag = countryFlag(countryName);

  return {
    title: `Where to Watch ${leagueName} in ${countryName} ${flag} – TV Channels & Schedule | CricFoot`,
    description: `How to watch ${leagueName} live on TV in ${countryName}: every broadcaster, streaming service, kick-off times and the full 30-day fixture schedule with ${countryName} channels.`,
    keywords: `${leagueName} tv ${countryName}, ${leagueName} channel ${countryName}, watch ${leagueName} in ${countryName}, ${leagueName} live ${countryName}, ${leagueName} ${countryName} broadcast`,
    openGraph: {
      title: `Where to Watch ${leagueName} in ${countryName}`,
      description: `${leagueName} TV channels and upcoming fixtures for ${countryName}.`,
    },
    alternates: { canonical: `/watch/${decodeURIComponent(slug)}/${decodeURIComponent(country)}/` },
  };
}

export default async function WatchLeagueCountryPage({ params }: Props) {
  const { slug, country } = await params;
  const { leagueName, countryName, upcomingDays, channels } = await getData(slug, country);
  const totalMatches = upcomingDays.reduce((s, d) => s + d.matches.length, 0);
  const flag = countryFlag(countryName);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [{
      '@type': 'Question',
      name: `What channel is ${leagueName} on in ${countryName}?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: channels.length > 0
          ? `${leagueName} is broadcast in ${countryName} on ${channels.slice(0, 5).join(', ')}.`
          : `Check the fixture list for ${countryName} broadcaster details.`,
      },
    }],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="page-head">
        <h1 className="page-title">
          {flag} Where to Watch {leagueName} in {countryName}
        </h1>
        <p className="page-sub">
          {channels.length > 0 ? `On ${channels.slice(0, 3).join(', ')}${channels.length > 3 ? ` + ${channels.length - 3} more` : ''}` : 'TV channels & schedule'} · {totalMatches} match{totalMatches !== 1 ? 'es' : ''} scheduled
        </p>
      </header>

      {/* Country channel cards */}
      {channels.length > 0 && (
        <section className="seo-section" style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14 }}>
            <span className="y-bar" />{leagueName} TV Channels in {countryName}
          </h2>
          <div className="bc-card" style={{ display: 'block' }}>
            <div className="bc-card-header" style={{ marginBottom: 10 }}>
              <span className="bc-card-country">
                <span className="bc-card-flag">{flag}</span>
                {countryName}
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                  · {channels.length} channel{channels.length !== 1 ? 's' : ''}
                </span>
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {channels.map(ch => (
                <Link key={ch} href={`/channel/${toSlug(ch)}/`} className="bc-channel-pill">
                  📺 {ch}
                </Link>
              ))}
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
            Broadcast rights vary by match — click any fixture below for the exact channel.
            CricFoot is a TV guide only and does not stream or broadcast any content.
          </p>
        </section>
      )}

      {/* Upcoming fixtures in this country */}
      <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 12px' }}>
        <span className="y-bar" />{leagueName} Fixtures on TV in {countryName}
      </h2>
      {upcomingDays.length === 0 ? (
        <div className="state-center">
          <div className="state-icon">📅</div>
          <div className="state-title">No {leagueName} fixtures with {countryName} TV coverage in the next 30 days</div>
          <div className="state-sub">Check back soon — schedules update daily.</div>
          <Link href={`/watch/${decodeURIComponent(slug)}/`} className="btn-back" style={{ marginTop: 20, display: 'inline-flex' }}>
            ← Worldwide {leagueName} schedule
          </Link>
        </div>
      ) : (
        upcomingDays.map(({ ymd, matches }) => {
          const full = fmtDate(dateFromYMD(ymd));
          return (
            <section key={ymd} className="day-section" aria-label={`${leagueName} in ${countryName} on ${full}`}>
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

      <div style={{ display: 'flex', gap: 10, margin: '4px 0 20px', flexWrap: 'wrap' }}>
        <Link href={`/watch/${decodeURIComponent(slug)}/`} className="btn-back">
          ← {leagueName} in all countries
        </Link>
        <Link href={`/league/${decodeURIComponent(slug)}/country/${decodeURIComponent(country)}/`} className="btn-back">
          Full {countryName} schedule →
        </Link>
      </div>

      <section className="seo-section">
        <h2><span className="y-bar" />Watching {leagueName} in {countryName}</h2>
        <p>
          <strong>{leagueName}</strong> is broadcast live in <strong>{countryName}</strong>
          {channels.length > 0 && <> on <strong>{channels.slice(0, 3).join(', ')}{channels.length > 3 ? ' and more' : ''}</strong></>}.
          The fixture list above shows every {leagueName} match with confirmed {countryName} TV coverage
          over the next 30 days, with kick-off times automatically converted to your local timezone.
        </p>
        <p>
          To watch <strong>{leagueName}</strong> in <strong>{countryName}</strong>, subscribe to or tune
          in to one of the listed broadcasters — most offer an official app or streaming service
          alongside their TV channel. Click any fixture for the exact channel showing that specific match.
        </p>
      </section>

      <Faq
        title={`${leagueName} in ${countryName} — FAQs`}
        items={[
          {
            q: `What channel is ${leagueName} on in ${countryName}?`,
            a: channels.length > 0
              ? `In ${countryName}, ${leagueName} is broadcast on ${channels.slice(0, 4).join(', ')}. Rights can vary by match, so always check the specific fixture above for the exact channel.`
              : `Click any fixture above to see the ${countryName} broadcaster for that specific match.`,
          },
          {
            q: `Can I stream ${leagueName} online in ${countryName}?`,
            a: `Yes — most official broadcasters in ${countryName} offer a companion app or streaming service. Visit the official website of ${channels[0] ?? 'your local broadcaster'} for subscription details. CricFoot is a TV guide only and does not provide streams.`,
          },
          {
            q: `Are kick-off times shown in ${countryName} local time?`,
            a: `Yes — every kick-off time on CricFoot is automatically converted to your device's local timezone, so you always see the correct local time for ${countryName}.`,
          },
        ]}
      />
    </>
  );
}
