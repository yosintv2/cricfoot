import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchMatches } from '@/lib/api';
import { countryFlag, fromSlug, scheduleDays, toSlug } from '@/lib/utils';
import DayFixtureList from '@/components/DayFixtureList';
import Faq from '@/components/Faq';

export async function generateStaticParams() {
  const allMatches = (await Promise.all(scheduleDays().map(fetchMatches))).flat();
  const slugs = new Set<string>();
  allMatches.forEach(m =>
    (m.tv_channels ?? []).forEach(tv => {
      if (tv.country && toSlug(tv.country)) slugs.add(toSlug(tv.country));
    })
  );
  return [...slugs].map(name => ({ name }));
}

interface Props {
  params: Promise<{ name: string }>;
}

// Resolve the real country name from the API by slug comparison (slugs are
// lossy). Next dedupes the fetches between generateMetadata and the page.
async function getCountryData(nameParam: string) {
  const slug = decodeURIComponent(nameParam);
  const dayData = await Promise.all(
    scheduleDays().map(async (ymd) => ({ ymd, matches: await fetchMatches(ymd) }))
  );

  let countryName: string | null = null;
  outer: for (const { matches } of dayData) {
    for (const m of matches) {
      for (const tv of m.tv_channels ?? []) {
        if (tv.country && toSlug(tv.country) === slug) { countryName = tv.country; break outer; }
      }
    }
  }

  const upcomingDays = countryName
    ? dayData
        .map(({ ymd, matches }) => ({
          ymd,
          matches: matches.filter(m =>
            (m.tv_channels ?? []).some(tv => tv.country === countryName && (tv.channels ?? []).length > 0)
          ),
        }))
        .filter(d => d.matches.length > 0)
    : [];

  // Channels broadcasting in this country, most matches first.
  const chCount = new Map<string, number>();
  upcomingDays.forEach(d =>
    d.matches.forEach(m =>
      (m.tv_channels ?? []).forEach(tv => {
        if (tv.country !== countryName) return;
        (tv.channels ?? []).forEach(ch => chCount.set(ch, (chCount.get(ch) ?? 0) + 1));
      })
    )
  );
  const channels = [...chCount.entries()].sort((a, b) => b[1] - a[1]).map(([ch]) => ch);

  return { countryName: countryName ?? fromSlug(slug).replace(/\b\w/g, c => c.toUpperCase()), upcomingDays, channels };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const { countryName } = await getCountryData(name);

  return {
    title: `Live Football on TV in ${countryName} – Soccer TV Schedule & Channels | CricFoot`,
    description: `Live Football on TV in ${countryName} today and the next 30 days: every match, kick-off time in your local timezone and the ${countryName} TV channels broadcasting each game.`,
    keywords: `football on tv ${countryName}, soccer on tv in ${countryName}, ${countryName} football tv guide, ${countryName} soccer tv schedule, what channel is the game on in ${countryName}, live football ${countryName} tv`,
    openGraph: {
      title: `Live Football on TV in ${countryName}`,
      description: `Every football match broadcast in ${countryName} — kick-off times and channels.`,
    },
    twitter: {
      title: `Live Football on TV in ${countryName}`,
      description: `The full ${countryName} soccer TV schedule.`,
    },
    alternates: { canonical: `/country/${decodeURIComponent(name)}/` },
  };
}

export default async function CountryPage({ params }: Props) {
  const { name } = await params;
  const { countryName, upcomingDays, channels } = await getCountryData(name);
  const totalMatches = upcomingDays.reduce((s, d) => s + d.matches.length, 0);
  const topChannels = channels.slice(0, 12);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Live Football on TV in ${countryName}`,
    description: `Football matches broadcast on TV in ${countryName}, with kick-off times and channels.`,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.cricfoot.net/' },
        { '@type': 'ListItem', position: 2, name: 'Countries', item: 'https://www.cricfoot.net/countries/' },
        { '@type': 'ListItem', position: 3, name: countryName },
      ],
    },
  };

  const faqs = [
    {
      q: `What football is on TV in ${countryName} today?`,
      a: totalMatches > 0
        ? `There ${totalMatches === 1 ? 'is 1 match' : `are ${totalMatches} matches`} broadcast on TV in ${countryName} over the 30-day schedule above. Click any fixture to see which ${countryName} channel is showing it.`
        : `No matches with ${countryName} TV listings are published for the current window. Schedules update daily, so check back soon.`,
    },
    {
      q: `Which channels show football in ${countryName}?`,
      a: topChannels.length > 0
        ? `Football in ${countryName} is shown on channels including ${topChannels.slice(0, 6).join(', ')}. Click any channel name to see its full 30-day schedule.`
        : `Channel listings for ${countryName} appear as soon as broadcasters confirm coverage.`,
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

      {/* Hero */}
      <header className="league-hero">
        <div className="league-hero-icon" aria-hidden="true">{countryFlag(countryName)}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 className="league-hero-name">Live Football on TV in {countryName}</h1>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.78)', marginTop: 4 }}>
            {totalMatches} match{totalMatches !== 1 ? 'es' : ''} · 30-day TV guide
          </p>
        </div>
        <Link href="/countries" className="btn-back" style={{ flexShrink: 0 }}>← All countries</Link>
      </header>

      {/* Channels in this country */}
      {topChannels.length > 0 && (
        <section style={{ margin: '14px 0 4px' }} aria-label={`Football TV channels in ${countryName}`}>
          <div className="tag-cloud">
            {topChannels.map(ch => (
              <Link key={ch} href={`/channel/${toSlug(ch)}`} className="tag-pill" title={`${ch} schedule`}>📺 {ch}</Link>
            ))}
          </div>
        </section>
      )}

      <DayFixtureList
        days={upcomingDays}
        subject={`${countryName} TV`}
        idPrefix="cday"
        emptySub={`No matches with ${countryName} TV listings right now. Schedules update daily — check back soon.`}
      />

      {/* SEO */}
      <section className="seo-section">
        <h2><span className="y-bar" />{countryName} Soccer TV Guide</h2>
        <p>
          This page lists every football match broadcast on TV in <strong>{countryName}</strong> over the next
          two weeks. Click any fixture to see exactly which {countryName} channel is showing it, with kick-off
          times converted to your local timezone automatically.
        </p>
        <p>
          Browse other countries on the{' '}
          <Link href="/countries" style={{ color: 'var(--navy)', fontWeight: 600 }}>countries index</Link>, or see
          the worldwide schedule of{' '}
          <Link href="/" style={{ color: 'var(--navy)', fontWeight: 600 }}>football on TV today</Link>.
          CricFoot provides TV listings only — we do not stream or broadcast any content.
        </p>
      </section>

      <Faq title={`Football in ${countryName} — FAQs`} items={faqs} />
    </>
  );
}
