import type { Metadata } from 'next';
import { fetchMatches } from '@/lib/api';
import { todayYMD, fromSlug, toSlug, toYMD } from '@/lib/utils';
import ChannelPageClient from '@/components/ChannelPageClient';

export async function generateStaticParams() {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return toYMD(d);
  });
  const allMatches = (await Promise.all(days.map(fetchMatches))).flat();
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const channelName = fromSlug(name);
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
  const channelName = fromSlug(name);
  const kws = channelKeywords(channelName);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return toYMD(d);
  });

  const upcomingDays = (
    await Promise.all(
      days.map(async (ymd) => {
        const all = await fetchMatches(ymd);
        const matches = all.filter(m =>
          (m.tv_channels ?? []).some(tv => (tv.channels ?? []).includes(channelName))
        );
        return { ymd, matches };
      })
    )
  ).filter((d) => d.matches.length > 0);

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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ChannelPageClient channelName={channelName} upcomingDays={upcomingDays} />
    </>
  );
}
