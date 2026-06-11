import type { Metadata } from 'next';
import { fetchMatches } from '@/lib/api';
import { toYMD } from '@/lib/utils';
import HomeClient from '@/components/HomeClient';

export const metadata: Metadata = {
  title: 'CricFoot - Football Live on TV | Live TV Channels',
  description:
    'CricFoot 7-day football TV guide. Find every match, kick-off time and TV channel for the Premier League, Champions League, La Liga, Serie A, Bundesliga and more.',
  alternates: { canonical: '/' },
};

export default async function HomePage() {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return toYMD(d);
  });

  const allDayMatches = await Promise.all(
    days.map(async (ymd) => ({ ymd, matches: await fetchMatches(ymd) }))
  );

  return <HomeClient allDayMatches={allDayMatches} />;
}
