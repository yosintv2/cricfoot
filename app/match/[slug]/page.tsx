import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchMatches } from '@/lib/api';
import { toSlug, countryFlag, dateFromYMD, fmtDate, getLeagueFlag, matchSlug, pairSlug, scheduleDays } from '@/lib/utils';
import { Match } from '@/types';
import Faq from '@/components/Faq';

export async function generateStaticParams() {
  const days = scheduleDays();
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
  const dateLabel = fmtDate(dateFromYMD(ymd));
  const kickoffISO = match.kickoff ? new Date(match.kickoff * 1000).toISOString() : undefined;
  const kickoffGMT = match.kickoff
    ? new Date(match.kickoff * 1000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
    : null;

  const [homeTeam, awayTeam] = (match.fixture ?? '').split(/\s+vs\.?\s+/i);
  const allChannelNames = [...new Set(tvChs.flatMap(tv => tv.channels ?? []))];
  const topChannels = allChannelNames.slice(0, 8);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SportsEvent',
        name: match.fixture,
        sport: 'Soccer',
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        ...(kickoffISO && { startDate: kickoffISO }),
        ...(match.venue && { location: { '@type': 'Place', name: match.venue } }),
        ...(homeTeam && awayTeam && {
          homeTeam: { '@type': 'SportsTeam', name: homeTeam.trim() },
          awayTeam: { '@type': 'SportsTeam', name: awayTeam.trim() },
          competitor: [
            { '@type': 'SportsTeam', name: homeTeam.trim() },
            { '@type': 'SportsTeam', name: awayTeam.trim() },
          ],
        }),
        ...(match.league && { superEvent: { '@type': 'SportsEvent', name: match.league } }),
        ...(topChannels.length > 0 && {
          subjectOf: topChannels.map(ch => ({
            '@type': 'BroadcastEvent',
            name: `${match.fixture} on ${ch}`,
            isLiveBroadcast: true,
            ...(kickoffISO && { startDate: kickoffISO }),
            publishedOn: { '@type': 'BroadcastService', name: ch },
          })),
        }),
        organizer: { '@id': 'https://www.cricfoot.net/#organization' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.cricfoot.net/' },
          { '@type': 'ListItem', position: 2, name: match.league || 'Matches', item: match.league ? `https://www.cricfoot.net/league/${toSlug(match.league)}/` : 'https://www.cricfoot.net/' },
          { '@type': 'ListItem', position: 3, name: match.fixture },
        ],
      },
    ],
  };

  const matchFaqs = [
    {
      q: `What time does ${match.fixture} kick off?`,
      a: `${match.fixture} kicks off ${kickoffGMT ? `at ${kickoffGMT} GMT` : 'at the scheduled time'} on ${dateLabel}${match.venue ? ` at ${match.venue}` : ''}. On CricFoot the kick-off time is shown automatically converted to your local timezone.`,
    },
    {
      q: `Which TV channels are broadcasting ${match.fixture}?`,
      a: topChannels.length > 0
        ? `${match.fixture} is broadcast on ${allChannelNames.length} channels worldwide, including ${topChannels.join(', ')}. See the full country-by-country channel table above to find the broadcaster in your region.`
        : `TV listings for ${match.fixture} have not been published yet. Check back closer to kick-off for the full country-by-country broadcaster list.`,
    },
    {
      q: `Where can I watch ${match.fixture} in my country?`,
      a: `Find your country in the channel table above — every listed broadcaster holds official rights for that region. To watch, use your TV or streaming subscription with that broadcaster. CricFoot is a TV guide and does not stream matches.`,
    },
    ...(match.league ? [{
      q: `What competition is ${match.fixture} part of?`,
      a: `${match.fixture} is a ${match.league} fixture${match.venue ? `, played at ${match.venue}` : ''}.`,
    }] : []),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Match meta — compact pills */}
      <ul className="match-meta" style={{ marginTop: 18 }}>
        <li><span aria-hidden="true">📅</span> {dateLabel}</li>
        {match.league && (
          <li>
            <span aria-hidden="true">{getLeagueFlag(match.league)}</span>
            <Link href={`/league/${toSlug(match.league)}`}>{match.league}</Link>
          </li>
        )}
        {match.venue && <li><span aria-hidden="true">📍</span> {match.venue}</li>}
        {homeTeam && awayTeam && (
          <>
            <li>Team: <Link href={`/team/${toSlug(homeTeam.trim())}`}>{homeTeam.trim()}</Link></li>
            <li>Team: <Link href={`/team/${toSlug(awayTeam.trim())}`}>{awayTeam.trim()}</Link></li>
          </>
        )}
      </ul>

      {/* Title — grey heading + red bar, channel table attaches below */}
      <header style={{ margin: '6px 0 0' }}>
        <h1 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>
          {match.fixture} Live Stream and TV Schedule
        </h1>
        <div style={{ height: 4, background: 'var(--red)', borderRadius: 1 }} />
      </header>

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
                    {tv.country ? (
                      <Link href={`/country/${toSlug(tv.country)}`} style={{ color: 'inherit' }} title={`Football on TV in ${tv.country}`}>
                        {tv.country}
                      </Link>
                    ) : 'International'}
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
          football schedule for the next 14 days.
        </p>
        <p>
          CricFoot provides TV listings and schedules only.{' '}
          <strong>We do not stream, host, or broadcast any content.</strong>{' '}
          To watch the match, use your authorised TV service or broadcaster in your country. For all of
          today&apos;s fixtures, see the full{' '}
          <Link href="/" style={{ color: 'var(--navy)', fontWeight: 600 }}>football on TV today</Link>{' '}
          schedule.
        </p>
        {homeTeam && awayTeam && (
          <p>
            Following this rivalry? The{' '}
            <Link href={`/fixtures/${pairSlug(homeTeam.trim(), awayTeam.trim())}`} style={{ color: 'var(--navy)', fontWeight: 600 }}>
              {homeTeam.trim()} vs {awayTeam.trim()} TV guide
            </Link>{' '}
            covers every meeting, and the{' '}
            <Link href={`/team/${toSlug(homeTeam.trim())}`} style={{ color: 'var(--navy)', fontWeight: 600 }}>{homeTeam.trim()}</Link>{' '}
            and{' '}
            <Link href={`/team/${toSlug(awayTeam.trim())}`} style={{ color: 'var(--navy)', fontWeight: 600 }}>{awayTeam.trim()}</Link>{' '}
            pages list each team&apos;s next matches on TV.
          </p>
        )}
      </section>

      <Faq title={`${match.fixture} — FAQs`} items={matchFaqs} />
    </>
  );
}
