import type { Metadata } from 'next';
import { fetchMatches } from '@/lib/api';
import { scheduleDays } from '@/lib/utils';
import HomeClient from '@/components/HomeClient';
import Faq from '@/components/Faq';

export const metadata: Metadata = {
  title: 'Football on TV Today – Live Football & Soccer Games Today | CricFoot',
  description:
    'Live football on TV today: every soccer game today with kick-off times and TV channels. Free live soccer TV guide for the World Cup, Premier League, Champions League, La Liga, Serie A, Bundesliga and more.',
  keywords:
    'football today, football on tv, live football on tv, football on tv today, soccer games today, live soccer tv, soccer on tv today, football tv schedule, what football is on tv tonight',
  alternates: { canonical: '/' },
};

const HOME_FAQS = [
  {
    q: 'What football is on TV today?',
    a: 'CricFoot lists every football match on TV today, grouped by league with kick-off times in your local timezone. Use the date tabs above to see today’s soccer games, and click any fixture for the full list of TV channels broadcasting it in your country.',
  },
  {
    q: 'How do I find out which TV channel is showing a football match?',
    a: 'Open CricFoot, pick the match day from the date tabs, and click any fixture. You will see the full list of broadcasting TV channels for every country, so you can find the right channel wherever you are.',
  },
  {
    q: 'Is CricFoot a free alternative to LiveSoccerTV?',
    a: 'Yes. Like LiveSoccerTV, CricFoot is a live soccer TV guide that shows which channels broadcast each match worldwide. CricFoot is completely free, covers a 14-day schedule, and converts every kick-off to your local time automatically.',
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
    a: 'Use the Channels page or click any channel name next to a match to see that broadcaster’s full 14-day football schedule. To actually watch, use your authorised TV or streaming subscription for that broadcaster.',
  },
  {
    q: 'How often is the TV schedule updated?',
    a: 'Match listings and TV channel data are refreshed daily, covering a full 14-day window — yesterday, today and the next 12 days — so the guide always reflects the latest broadcast information.',
  },
];

export default async function HomePage() {
  const allDayMatches = await Promise.all(
    scheduleDays().map(async (ymd) => ({ ymd, matches: await fetchMatches(ymd) }))
  );

  return (
    <>
      <HomeClient allDayMatches={allDayMatches} />
      <Faq items={HOME_FAQS} />
    </>
  );
}
