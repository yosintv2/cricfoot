import type { Metadata } from 'next';
import { fetchMatches } from '@/lib/api';
import { fromSlug, toSlug, scheduleDays, todayYMD, dateFromYMD, fmtDate } from '@/lib/utils';
import ChannelPageClient from '@/components/ChannelPageClient';
import Faq from '@/components/Faq';

export async function generateStaticParams() {
  const allMatches = (await Promise.all(scheduleDays().map(fetchMatches))).flat();
  const channels = new Set<string>();
  allMatches.forEach(m =>
    (m.tv_channels ?? []).forEach(tv =>
      (tv.channels ?? []).forEach(ch => channels.add(ch))
    )
  );
  return [...channels].map(ch => ({ name: toSlug(ch) }));
}

interface Props {
  params: Promise<{ name: string }>;
}

function channelKeywords(ch: string): string[] {
  return [
    `${ch} Live Stream Free`,
    `${ch} Free Live Streaming`,
    `Watch ${ch} Live Online`,
    `${ch} Live TV Free`,
    `${ch} Football Live Stream`,
    `Watch Football on ${ch}`,
    `${ch} Soccer Live TV`,
    `${ch} Sports Channel Live`,
    `${ch} HD Live Stream`,
    `${ch} Live Match Today`,
    `${ch} Football Today`,
    `${ch} TV Guide Today`,
    `${ch} Live Football Schedule`,
    `${ch} Match Fixtures Today`,
    `${ch} Live Sports TV`,
    `${ch} UEFA Champions League Live`,
    `${ch} Premier League Live`,
    `${ch} La Liga Live Stream`,
    `${ch} Serie A Live`,
    `${ch} Bundesliga Live TV`,
    `${ch} FIFA Match Live`,
    `${ch} World Cup Live Stream`,
    `${ch} TV Listings`,
    `${ch} Football Coverage`,
    `${ch} Sports Schedule`,
    `${ch} Live Soccer Match`,
    `${ch} Football Streaming Channel`,
    `${ch} Watch Live Football Free`,
    `${ch} Match Broadcast Today`,
    `${ch} Live Football on TV`,
    `${ch} Today Football Match`,
    `${ch} Sports TV Guide`,
    `${ch} Streaming Now`,
    `${ch} Online TV Channel`,
    `${ch} Live Event Streaming`,
    `${ch} Matchday Live`,
    `${ch} Free Sports Streaming`,
    `${ch} Football Highlights Today`,
    `${ch} Live Sports Coverage`,
    `${ch} Football Fixtures & Results`,
    `${ch} Live Commentary`,
    `${ch} International Football Live`,
    `${ch} 24/7 Sports Channel`,
    `${ch} Mobile Live Stream`,
    `${ch} Live TV App`,
    `${ch} Streaming Football Worldwide`,
    `${ch} Multi-language Football Stream`,
    `${ch} Football Channel Online`,
    `${ch} Soccer TV Listings`,
    `${ch} Match Schedule Today`,
  ];
}

// Resolve the real channel name from the API by slug comparison — slugs are
// lossy ("Disney+ Premium Chile" → "Disney-Premium-Chile"), so the name can't
// be reconstructed from the URL. Next dedupes the underlying fetches, so
// calling this from both generateMetadata and the page costs nothing extra.
async function getChannelData(nameParam: string) {
  const slug = decodeURIComponent(nameParam);
  const dayData = await Promise.all(
    scheduleDays().map(async (ymd) => ({ ymd, matches: await fetchMatches(ymd) }))
  );

  let channelName: string | null = null;
  outer: for (const { matches } of dayData) {
    for (const m of matches) {
      for (const tv of m.tv_channels ?? []) {
        for (const ch of tv.channels ?? []) {
          if (toSlug(ch) === slug) { channelName = ch; break outer; }
        }
      }
    }
  }

  const upcomingDays = channelName
    ? dayData
        .map(({ ymd, matches }) => ({
          ymd,
          matches: matches.filter(m =>
            (m.tv_channels ?? []).some(tv => (tv.channels ?? []).includes(channelName!))
          ),
        }))
        .filter(d => d.matches.length > 0)
    : [];

  // Countries where this channel carries matches (for "available in …" copy).
  const countrySet = new Set<string>();
  upcomingDays.forEach(d =>
    d.matches.forEach(m =>
      (m.tv_channels ?? []).forEach(tv => {
        if (tv.country && (tv.channels ?? []).includes(channelName!)) countrySet.add(tv.country);
      })
    )
  );

  return { channelName: channelName ?? fromSlug(slug), upcomingDays, countries: [...countrySet].sort() };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const { channelName } = await getChannelData(name);
  const kws = channelKeywords(channelName);

  return {
    title: `Live Football on ${channelName} – ${channelName} Live Match Today | CricFoot`,
    description: `Live football on ${channelName}: what match is on ${channelName} today, kick-off times in your local timezone and every fixture broadcast live on ${channelName} over the next 30 days.`,
    keywords: `live football on ${channelName}, ${channelName} live match today, ${channelName} live football today, ${kws.join(', ')}`,
    openGraph: {
      title: `Live Football on ${channelName} – Live Match Today & TV Guide`,
      description: `Complete ${channelName} live football schedule: today's matches, kick-off times and upcoming fixtures.`,
    },
    twitter: {
      title: `Live Football on ${channelName} – CricFoot`,
      description: `${channelName} live match today and the full 30-day football schedule.`,
    },
    alternates: {
      canonical: `/channel/${toSlug(channelName)}/`,
    },
  };
}

export default async function ChannelPage({ params }: Props) {
  const { name } = await params;
  const { channelName, upcomingDays, countries } = await getChannelData(name);
  const kws = channelKeywords(channelName);

  const todayData = upcomingDays.find(d => d.ymd === todayYMD());
  const todayFixtures = (todayData?.matches ?? []).map(m => m.fixture).filter(Boolean).slice(0, 4);
  const nextDayData = upcomingDays.find(d => d.ymd >= todayYMD()) ?? upcomingDays[0];
  const nextFixture = nextDayData?.matches[0];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Live Football on ${channelName}`,
    description: `Live football matches broadcast on ${channelName}. Full TV schedule and upcoming match fixtures.`,
    keywords: kws,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.cricfoot.net/' },
        { '@type': 'ListItem', position: 2, name: 'Channels', item: 'https://www.cricfoot.net/channels' },
        { '@type': 'ListItem', position: 3, name: channelName },
      ],
    },
    mainEntity: {
      '@type': 'BroadcastChannel',
      name: channelName,
      broadcastDisplayName: channelName,
      genre: 'Sports',
    },
  };

  const totalMatches = upcomingDays.reduce((s, d) => s + d.matches.length, 0);
  const leagues = [...new Set(upcomingDays.flatMap(d => d.matches.map(m => m.league).filter(Boolean)))].slice(0, 6);

  const channelFaqs = [
    {
      q: `What match is on ${channelName} today?`,
      a: todayFixtures.length > 0
        ? `${channelName} is showing ${todayFixtures.length === 1 ? 'one live match today' : `${todayData!.matches.length} live matches today`}: ${todayFixtures.join(', ')}. Kick-off times in the schedule above are converted to your local timezone.`
        : nextFixture
          ? `${channelName} has no match listed today. Its next live match is ${nextFixture.fixture}${nextFixture.league ? ` (${nextFixture.league})` : ''} on ${fmtDate(dateFromYMD(nextDayData!.ymd))} — see the full schedule above.`
          : `${channelName} has no football matches listed right now. Schedules update daily, so check back soon.`,
    },
    {
      q: `Which football matches are on ${channelName} this week?`,
      a: totalMatches > 0
        ? `${channelName} is broadcasting ${totalMatches} football match${totalMatches !== 1 ? 'es' : ''} over the 30-day schedule${leagues.length ? `, covering ${leagues.join(', ')}` : ''}. The full day-by-day schedule with kick-off times is listed above.`
        : `${channelName} has no football matches listed for the next 30 days. Schedules update daily, so check back soon.`,
    },
    {
      q: `How can I watch ${channelName} live on TV, Android or iPhone?`,
      a: `Watch ${channelName} through its official TV, cable, satellite or streaming providers in its licensed regions — most broadcasters also offer an official app for Android and iPhone, and some stream selected matches on their official YouTube channel. CricFoot is a TV guide only: we show what's on ${channelName}, we don't stream content.`,
    },
    ...(countries.length > 0 ? [{
      q: `Which countries is ${channelName} available in?`,
      a: `Based on current listings, ${channelName} carries matches in ${countries.slice(0, 6).join(', ')}${countries.length > 6 ? ` and ${countries.length - 6} more countries` : ''}. Broadcast rights vary by competition and territory.`,
    }] : []),
    {
      q: `What time do matches start on ${channelName}?`,
      a: `Every kick-off time on this page is shown in your local timezone automatically — the time you see is the time the broadcast starts where you live.`,
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ChannelPageClient channelName={channelName} upcomingDays={upcomingDays} countries={countries} />
      <Faq title={`${channelName} — FAQs`} items={channelFaqs} />
    </>
  );
}
