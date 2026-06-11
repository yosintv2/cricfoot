import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchMatches } from '@/lib/api';
import { dateFromYMD, fmtDate, weekendYMDs } from '@/lib/utils';
import DaySchedule from '@/components/DaySchedule';
import Faq from '@/components/Faq';

export const metadata: Metadata = {
  title: 'Football on TV This Weekend – Saturday & Sunday TV Schedule | CricFoot',
  description:
    'Football on TV this weekend: every Saturday and Sunday soccer match with kick-off times in your local timezone and the TV channels broadcasting in your country.',
  keywords:
    'football on tv this weekend, weekend football on tv, soccer this weekend, football this weekend tv schedule, saturday football on tv, sunday football on tv, weekend soccer tv guide',
  openGraph: {
    title: 'Football on TV This Weekend',
    description: 'Every Saturday and Sunday match on TV with kick-off times and channels.',
  },
  twitter: {
    title: 'Football on TV This Weekend',
    description: 'The full weekend soccer TV schedule with channels and kick-off times.',
  },
  alternates: { canonical: '/this-weekend' },
};

export default async function ThisWeekendPage() {
  const ymds = weekendYMDs();
  const days = await Promise.all(
    ymds.map(async ymd => ({ ymd, matches: await fetchMatches(ymd) }))
  );
  const totalMatches = days.reduce((s, d) => s + d.matches.length, 0);
  const satLabel = fmtDate(dateFromYMD(ymds[0]));
  const sunLabel = fmtDate(dateFromYMD(ymds[1]));

  const faqs = [
    {
      q: 'What football is on TV this weekend?',
      a: totalMatches > 0
        ? `There are ${totalMatches} football matches on TV this weekend (${satLabel} and ${sunLabel}). The schedule above is grouped by day and competition — click any fixture for the TV channels in your country.`
        : `Weekend listings (${satLabel} and ${sunLabel}) are still being published. Check back soon — the schedule updates daily.`,
    },
    {
      q: 'How do I find what channel a weekend match is on?',
      a: 'Click any fixture in the weekend schedule above to see every broadcasting TV channel country by country, so you can find the right broadcaster wherever you are.',
    },
    {
      q: 'Are weekend kick-off times shown in my local time?',
      a: 'Yes — every kick-off time on CricFoot is automatically converted to your device’s local timezone.',
    },
  ];

  return (
    <>
      <header style={{ padding: '16px 0 2px' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)' }}>
          ⚽ Football on TV This Weekend
        </h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 3 }}>
          {satLabel} &amp; {sunLabel} — every match, kick-off time and TV channel.
        </p>
      </header>

      <DaySchedule days={days} subject="weekend" />

      <section className="seo-section">
        <h2><span className="y-bar" />This Weekend&apos;s Soccer TV Schedule</h2>
        <p>
          Every <strong>football match on TV this weekend</strong> — Saturday {satLabel.split(',')[1]} and
          Sunday {sunLabel.split(',')[1]} — grouped by competition with kick-off times in your local timezone.
          Click any fixture for the full country-by-country broadcaster list.
        </p>
        <p>
          See also{' '}
          <Link href="/" style={{ color: 'var(--navy)', fontWeight: 600 }}>football on TV today</Link>,{' '}
          <Link href="/tomorrow" style={{ color: 'var(--navy)', fontWeight: 600 }}>tomorrow&apos;s schedule</Link> and the{' '}
          <Link href="/world-cup-2026" style={{ color: 'var(--navy)', fontWeight: 600 }}>World Cup 2026 TV guide</Link>.
        </p>
      </section>

      <Faq title="Weekend Football — FAQs" items={faqs} />
    </>
  );
}
