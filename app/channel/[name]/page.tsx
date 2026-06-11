import type { Metadata } from 'next';
import { fetchMatches } from '@/lib/api';
import { fromSlug, toSlug, scheduleDays } from '@/lib/utils';
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

  return { channelName: channelName ?? fromSlug(slug), upcomingDays };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const { channelName } = await getChannelData(name);
  const kws = channelKeywords(channelName);

  return {
    title: `${channelName} Live Stream Free | ${channelName} Live TV Channel Guide – CricFoot`,
    description: `${channelName} live football schedule on CricFoot. Full TV guide with match fixtures, kick-off times and upcoming matches broadcast on ${channelName}.`,
    keywords: kws.join(', '),
    openGraph: {
      title: `${channelName} Live Stream Free | ${channelName} Live TV Channel Guide – CricFoot`,
      description: `Complete ${channelName} football TV schedule. Match fixtures, kick-off times and competition information for today and upcoming days.`,
    },
    twitter: {
      title: `${channelName} Live TV Channel Guide – CricFoot`,
      description: `Full ${channelName} live football TV schedule. Find every upcoming match.`,
    },
    alternates: {
      canonical: `/channel/${toSlug(channelName)}`,
    },
  };
}

export default async function ChannelPage({ params }: Props) {
  const { name } = await params;
  const { channelName, upcomingDays } = await getChannelData(name);
  const kws = channelKeywords(channelName);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${channelName} Live TV Channel Guide`,
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
      q: `Which football matches are on ${channelName} this week?`,
      a: totalMatches > 0
        ? `${channelName} is broadcasting ${totalMatches} football match${totalMatches !== 1 ? 'es' : ''} over the 14-day schedule${leagues.length ? `, covering ${leagues.join(', ')}` : ''}. The full day-by-day schedule with kick-off times is listed above.`
        : `${channelName} has no football matches listed for the next 14 days. Schedules update daily, so check back soon.`,
    },
    {
      q: `What time do matches start on ${channelName}?`,
      a: `Every kick-off time on this page is shown in your local timezone automatically — the time you see is the time the broadcast starts where you live.`,
    },
    {
      q: `How can I watch ${channelName}?`,
      a: `${channelName} is available through its official TV, cable, satellite or streaming providers in its licensed regions. CricFoot is a TV guide only — we list what's on ${channelName}, but we don't stream content.`,
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ChannelPageClient channelName={channelName} upcomingDays={upcomingDays} />
      <Faq title={`${channelName} — FAQs`} items={channelFaqs} />
    </>
  );
}
