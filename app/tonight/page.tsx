import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchMatches } from '@/lib/api';
import { dateFromYMD, fmtDate, todayYMD } from '@/lib/utils';
import DaySchedule from '@/components/DaySchedule';
import Faq from '@/components/Faq';

export const metadata: Metadata = {
  title: 'Football on TV Tonight – What Football Is on TV Tonight? | CricFoot',
  description:
    'What football is on TV tonight? Every soccer match today with kick-off times in your local timezone and the TV channels showing each game in your country.',
  keywords:
    'football on tv tonight, what football is on tv tonight, soccer on tv tonight, football tonight, what soccer games are on tonight, football match tonight tv channel, games on tv tonight',
  openGraph: {
    title: 'Football on TV Tonight',
    description: 'Every football match on TV tonight with kick-off times and channels.',
  },
  twitter: {
    title: 'Football on TV Tonight',
    description: 'Tonight’s soccer TV schedule with channels and kick-off times.',
  },
  alternates: { canonical: '/tonight' },
};

export default async function TonightPage() {
  const ymd = todayYMD();
  const matches = await fetchMatches(ymd);
  const dateLabel = fmtDate(dateFromYMD(ymd));
  const leagues = [...new Set(matches.map(m => m.league).filter(Boolean))];

  const faqs = [
    {
      q: 'What football is on TV tonight?',
      a: matches.length > 0
        ? `There are ${matches.length} football matches on TV today and tonight (${dateLabel}) across ${leagues.length} competitions. Every kick-off time above is shown in your local timezone — the evening fixtures are tonight's games where you live.`
        : `Tonight's listings (${dateLabel}) are still being published. Check back soon — the schedule updates daily.`,
    },
    {
      q: 'What channel is the game on tonight?',
      a: 'Click any fixture above to see the full list of TV channels broadcasting it, country by country. Channels next to each match show a quick preview of the main broadcasters.',
    },
    {
      q: 'Are kick-off times shown in my local time?',
      a: 'Yes — every kick-off on CricFoot is automatically converted to your device’s local timezone, so an evening time means the match is on tonight where you live.',
    },
  ];

  return (
    <>
      <header style={{ padding: '16px 0 2px' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)' }}>
          ⚽ Football on TV Tonight
        </h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 3 }}>
          {dateLabel} — all of today&apos;s and tonight&apos;s matches in your local time.
        </p>
      </header>

      <DaySchedule days={[{ ymd, matches }]} subject="tonight's" />

      <section className="seo-section">
        <h2><span className="y-bar" />What Football Is on TV Tonight?</h2>
        <p>
          This page shows every <strong>football match on TV tonight</strong> and throughout today ({dateLabel}).
          Kick-off times are converted to your local timezone automatically — fixtures with evening times are
          tonight&apos;s games where you live. Click any match for the full channel list by country.
        </p>
        <p>
          Looking further ahead? See{' '}
          <Link href="/tomorrow" style={{ color: 'var(--navy)', fontWeight: 600 }}>football on TV tomorrow</Link> or the{' '}
          <Link href="/this-weekend" style={{ color: 'var(--navy)', fontWeight: 600 }}>weekend schedule</Link>.
        </p>
      </section>

      <Faq title="Football Tonight — FAQs" items={faqs} />
    </>
  );
}
