import type { Metadata } from 'next';
import { fetchMatches } from '@/lib/api';
import { toYMD } from '@/lib/utils';
import HomeClient from '@/components/HomeClient';
import Faq from '@/components/Faq';

export const metadata: Metadata = {
  title: 'CricFoot - Football Live on TV | Live TV Channels',
  description:
    'CricFoot 7-day football TV guide. Find every match, kick-off time and TV channel for the Premier League, Champions League, La Liga, Serie A, Bundesliga and more.',
  alternates: { canonical: '/' },
};

const HOME_FAQS = [
  {
    q: 'How do I find out which TV channel is showing a football match?',
    a: 'Open CricFoot, pick the match day from the date tabs, and click any fixture. You will see the full list of broadcasting TV channels for every country, so you can find the right channel wherever you are.',
  },
  {
    q: 'Are the kick-off times shown in my local time?',
    a: 'Yes. CricFoot automatically converts every kick-off time to your device’s local timezone, so the time you see is the time the match starts where you live.',
  },
  {
    q: 'Which football leagues does CricFoot cover?',
    a: 'CricFoot covers the FIFA World Cup, UEFA Champions League, Premier League, La Liga, Serie A, Bundesliga, Ligue 1, MLS, and hundreds of other leagues and cup competitions worldwide — updated daily.',
  },
  {
    q: 'Is CricFoot free to use?',
    a: 'Yes, CricFoot is completely free. It is a TV listings and schedule guide — we show you where matches are broadcast, but we do not stream or host any content ourselves.',
  },
  {
    q: 'How do I watch a match on a specific channel like Sky Sports or ESPN?',
    a: 'Use the Channels page or click any channel name next to a match to see that broadcaster’s full 7-day football schedule. To actually watch, use your authorised TV or streaming subscription for that broadcaster.',
  },
  {
    q: 'How often is the TV schedule updated?',
    a: 'Match listings and TV channel data are refreshed daily, covering today plus the next six days, so the guide always reflects the latest broadcast information.',
  },
];

export default async function HomePage() {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return toYMD(d);
  });

  const allDayMatches = await Promise.all(
    days.map(async (ymd) => ({ ymd, matches: await fetchMatches(ymd) }))
  );

  return (
    <>
      <HomeClient allDayMatches={allDayMatches} />
      <Faq items={HOME_FAQS} />
    </>
  );
}
