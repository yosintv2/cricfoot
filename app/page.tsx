import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchMatches } from '@/lib/api';
import { scheduleDays } from '@/lib/utils';
import HomeClient from '@/components/HomeClient';
import Faq from '@/components/Faq';

export const metadata: Metadata = {
  title: 'Live Football Match Today – Live Football on TV | CricFoot',
  description:
    'Live football match today: every game with kick-off times in your local timezone and the channels showing live football on TV. Free guide for the World Cup, Premier League, Champions League, La Liga, Serie A, Bundesliga and more.',
  keywords:
    'live football match today, live football on tv, football match today, live football today, football on tv today, soccer games today, live soccer tv, football tv schedule, what football is on tv tonight',
  alternates: { canonical: '/' },
};

const HOME_FAQS = [
  {
    q: 'Which live football matches are on today?',
    a: 'CricFoot lists every live football match today, grouped by league with kick-off times in your local timezone. Use the date tabs above to see today’s games, and click any fixture for the full list of TV channels showing it live in your country.',
  },
  {
    q: 'Where can I find live football on TV?',
    a: 'All live football on TV is listed right here — every competition, every channel, every country. Click a match for its country-by-country broadcaster table, or browse by channel, league, team or country using the menus.',
  },
  {
    q: 'How do I find out which TV channel is showing a football match?',
    a: 'Open CricFoot, pick the match day from the date tabs, and click any fixture. You will see the full list of broadcasting TV channels for every country, so you can find the right channel wherever you are.',
  },
  {
    q: 'Is CricFoot a free alternative to LiveSoccerTV?',
    a: 'Yes. Like LiveSoccerTV, CricFoot is a live soccer TV guide that shows which channels broadcast each match worldwide. CricFoot is completely free, covers a 30-day schedule, and converts every kick-off to your local time automatically.',
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
    a: 'Use the Channels page or click any channel name next to a match to see that broadcaster’s full 30-day football schedule. To actually watch, use your authorised TV or streaming subscription for that broadcaster.',
  },
  {
    q: 'How often is the TV schedule updated?',
    a: 'Match listings and TV channel data are refreshed daily, covering a full 30-day window — yesterday, today and the next 29 days — so the guide always reflects the latest broadcast information.',
  },
];

export default async function HomePage() {
  const allDayMatches = await Promise.all(
    scheduleDays().map(async (ymd) => ({ ymd, matches: await fetchMatches(ymd) }))
  );

  return (
    <>
      <HomeClient allDayMatches={allDayMatches} />

      {/* Schedule shortcuts */}
      <section className="seo-section" aria-label="More TV schedules">
        <h2><span className="y-bar" />More TV Schedules</h2>
        <div className="tag-cloud">
          <Link href="/tonight" className="tag-pill">🌙 Football on TV Tonight</Link>
          <Link href="/tomorrow" className="tag-pill">📅 Football on TV Tomorrow</Link>
          <Link href="/this-weekend" className="tag-pill">🗓️ Football This Weekend</Link>
          <Link href="/world-cup-2026" className="tag-pill">🏆 World Cup 2026 TV Guide</Link>
          <Link href="/countries" className="tag-pill">🌍 Browse by Country</Link>
          <Link href="/channels" className="tag-pill">📺 All TV Channels</Link>
        </div>
      </section>

      <Faq items={HOME_FAQS} />
    </>
  );
}
