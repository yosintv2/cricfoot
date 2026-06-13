import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchMatches } from '@/lib/api';
import { dateFromYMD, fmtDate, tomorrowYMD } from '@/lib/utils';
import DaySchedule from '@/components/DaySchedule';
import Faq from '@/components/Faq';

export const metadata: Metadata = {
  title: 'Live Football on TV Tomorrow – Full Soccer TV Schedule | CricFoot',
  description:
    'Live Football on TV Tomorrow: every soccer match with kick-off times in your local timezone and the TV channels broadcasting in your country. Premier League, World Cup, Champions League and hundreds more competitions.',
  keywords:
    'Live Football on TV Tomorrow, soccer on tv tomorrow, football tomorrow, what football is on tomorrow, tomorrow football matches, soccer games tomorrow, football fixtures tomorrow tv',
  openGraph: {
    title: 'Live Football on TV Tomorrow – Full Soccer TV Schedule',
    description: 'Every football match on TV tomorrow with kick-off times and channels.',
  },
  twitter: {
    title: 'Live Football on TV Tomorrow',
    description: 'Tomorrow’s full soccer TV schedule with channels and kick-off times.',
  },
  alternates: { canonical: '/tomorrow' },
};

export default async function TomorrowPage() {
  const ymd = tomorrowYMD();
  const matches = await fetchMatches(ymd);
  const dateLabel = fmtDate(dateFromYMD(ymd));
  const leagues = [...new Set(matches.map(m => m.league).filter(Boolean))];

  const faqs = [
    {
      q: 'What football is on TV tomorrow?',
      a: matches.length > 0
        ? `There are ${matches.length} football matches on TV tomorrow, ${dateLabel}, across ${leagues.length} competitions. The full schedule above is grouped by league — click any fixture for the TV channels in your country.`
        : `Listings for tomorrow, ${dateLabel}, are still being published. Check back soon — the schedule updates daily.`,
    },
    {
      q: 'Are tomorrow’s kick-off times shown in my local time?',
      a: 'Yes — every kick-off time on CricFoot is automatically converted to your device’s local timezone.',
    },
    {
      q: 'How do I find what channel a match is on tomorrow?',
      a: 'Click any fixture in the schedule above to see the full list of broadcasting TV channels country by country, so you can find the right broadcaster wherever you are.',
    },
  ];

  return (
    <>
      <header style={{ padding: '16px 0 2px' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)' }}>
          ⚽ Live Football on TV Tomorrow
        </h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 3 }}>
          {dateLabel} — every match, kick-off time and TV channel.
        </p>
      </header>

      <DaySchedule days={[{ ymd, matches }]} subject="tomorrow's" />

      <section className="seo-section">
        <h2><span className="y-bar" />Tomorrow&apos;s Soccer TV Schedule</h2>
        <p>
          Planning ahead? This page lists every <strong>football match on TV tomorrow</strong> ({dateLabel}),
          grouped by competition, with kick-off times converted to your local timezone. Click any fixture for the
          full country-by-country broadcaster list.
        </p>
        <p>
          See also{' '}
          <Link href="/" style={{ color: 'var(--navy)', fontWeight: 600 }}>football on TV today</Link>,{' '}
          <Link href="/tonight" style={{ color: 'var(--navy)', fontWeight: 600 }}>tonight&apos;s matches</Link> and the{' '}
          <Link href="/this-weekend" style={{ color: 'var(--navy)', fontWeight: 600 }}>weekend TV schedule</Link>.
        </p>
      </section>

      <Faq title="Football Tomorrow — FAQs" items={faqs} />
    </>
  );
}
