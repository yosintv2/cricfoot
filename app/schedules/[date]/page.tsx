import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchMatches } from '@/lib/api';
import { dateFromYMD, fmtDate, isoFromYMD, scheduleDays, prevDay, nextDay } from '@/lib/utils';
import DaySchedule from '@/components/DaySchedule';
import DateTabs from '@/components/DateTabs';
import Faq from '@/components/Faq';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ date: string }>;
}

// "2026-06-13" → "20260613"; null when the param isn't a valid ISO date.
function ymdFromParam(date: string): string | null {
  const decoded = decodeURIComponent(date);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(decoded)) return null;
  return decoded.replace(/-/g, '');
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { date } = await params;
  const ymd = ymdFromParam(date);
  const label = ymd ? fmtDate(dateFromYMD(ymd)) : 'Schedule';

  return {
    title: `Live Football on TV ${label} – Match Schedule & Channels | CricFoot`,
    description: `Every football match on TV on ${label}: kick-off times in your local timezone and the TV channels broadcasting each game in your country, grouped by competition.`,
    keywords: `Live Football on TV ${label}, soccer on tv ${label}, football matches ${label}, football schedule ${label}, what football is on ${label}`,
    openGraph: {
      title: `Live Football on TV ${label}`,
      description: `Full soccer TV schedule for ${label} with kick-off times and channels.`,
    },
    twitter: {
      title: `Live Football on TV ${label}`,
      description: `Every match on TV on ${label}.`,
    },
    alternates: { canonical: `/schedules/${decodeURIComponent(date)}/` },
  };
}

export default async function SchedulePage({ params }: Props) {
  const { date } = await params;
  const ymd = ymdFromParam(date);
  if (!ymd) {
    return (
      <div className="state-center">
        <div className="state-icon">📅</div>
        <div className="state-title">Invalid date</div>
        <div className="state-sub">Please use the format YYYY-MM-DD.</div>
        <Link href="/" className="btn-back" style={{ marginTop: 20, display: 'inline-flex' }}>
          ← View today&apos;s matches
        </Link>
      </div>
    );
  }

  const windowDays = scheduleDays();
  const matches = await fetchMatches(ymd);
  const label = fmtDate(dateFromYMD(ymd));
  const leagues = [...new Set(matches.map(m => m.league).filter(Boolean))];

  const prevYmd = prevDay(ymd);
  const nextYmd = nextDay(ymd);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.cricfoot.net/' },
      { '@type': 'ListItem', position: 2, name: `Live Football on TV ${label}` },
    ],
  };

  const faqs = [
    {
      q: `What football is on TV on ${label}?`,
      a: matches.length > 0
        ? `There are ${matches.length} football matches on TV on ${label} across ${leagues.length} competitions. The full schedule above is grouped by league — click any fixture for the TV channels in your country.`
        : `Listings for ${label} are still being published. Check back soon — the schedule updates daily.`,
    },
    {
      q: 'Are kick-off times shown in my local time?',
      a: 'Yes — every kick-off time on CricFoot is automatically converted to your device’s local timezone.',
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="page-head">
        <h1 className="page-title">⚽ Live Football on TV — {label}</h1>
        <p className="page-sub">Every match, kick-off time and TV channel for this day.</p>
      </header>

      {/* Same date strip as the homepage, current date highlighted */}
      <DateTabs days={windowDays} activeYmd={ymd} />

      <DaySchedule days={[{ ymd, matches }]} subject={label} />

      {/* Prev / next day */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, margin: '18px 0 4px' }}>
        {prevYmd ? (
          <Link href={`/schedules/${isoFromYMD(prevYmd)}`} className="btn-back">
            ← {dateFromYMD(prevYmd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Link>
        ) : <span />}
        {nextYmd && (
          <Link href={`/schedules/${isoFromYMD(nextYmd)}`} className="btn-back">
            {dateFromYMD(nextYmd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} →
          </Link>
        )}
      </div>

      <section className="seo-section">
        <h2><span className="y-bar" />Soccer TV Schedule for {label}</h2>
        <p>
          This page lists every <strong>football match on TV on {label}</strong>, grouped by competition,
          with kick-off times converted to your local timezone. Click any fixture for the full
          country-by-country broadcaster list.
        </p>
        <p>
          See also{' '}
          <Link href="/" style={{ color: 'var(--navy)', fontWeight: 600 }}>Live Football on TV today</Link>,{' '}
          <Link href="/tomorrow" style={{ color: 'var(--navy)', fontWeight: 600 }}>tomorrow&apos;s schedule</Link> and{' '}
          <Link href="/this-weekend" style={{ color: 'var(--navy)', fontWeight: 600 }}>this weekend&apos;s matches</Link>.
        </p>
      </section>

      <Faq title={`${label} — FAQs`} items={faqs} />
    </>
  );
}
