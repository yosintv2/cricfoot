import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchMatches } from '@/lib/api';
import { countryFlag, scheduleDays, toSlug } from '@/lib/utils';
import Faq from '@/components/Faq';

export const metadata: Metadata = {
  title: 'Live Football on TV by Country – Where to Watch in Your Country | CricFoot',
  description:
    'Live Football TV guides for every country: see which channels broadcast live soccer in the United States, United Kingdom, Canada, India, Australia and 100+ more countries.',
  keywords:
    'football tv by country, soccer tv schedule by country, football channels by country, where to watch football in my country, soccer broadcast rights by country',
  alternates: { canonical: '/countries' },
};

export default async function CountriesPage() {
  const allMatches = (await Promise.all(scheduleDays().map(fetchMatches))).flat();

  const counts = new Map<string, number>();
  allMatches.forEach(m =>
    (m.tv_channels ?? []).forEach(tv => {
      if (!tv.country || !toSlug(tv.country) || (tv.channels ?? []).length === 0) return;
      counts.set(tv.country, (counts.get(tv.country) ?? 0) + 1);
    })
  );
  const countries = [...counts.entries()].sort(([a], [b]) => a.localeCompare(b));

  return (
    <>
      <header style={{ padding: '16px 0 10px' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)' }}>
          🌍 Football TV Schedules by Country
        </h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 3 }}>
          Pick your country to see every match broadcast on your local channels.
        </p>
      </header>

      {countries.length === 0 ? (
        <div className="state-center">
          <div className="state-icon">🌍</div>
          <div className="state-title">Country listings are being updated</div>
          <div className="state-sub">Check back soon — schedules update daily.</div>
        </div>
      ) : (
        <div className="channel-grid">
          {countries.map(([country, count]) => (
            <Link
              key={country}
              href={`/country/${toSlug(country)}`}
              className="channel-card"
              aria-label={`Football on TV in ${country} — ${count} listings`}
            >
              <div className="channel-icon normal" aria-hidden="true">{countryFlag(country)}</div>
              <div className="channel-card-name">{country}</div>
              <div className="channel-match-count">{count} listing{count !== 1 ? 's' : ''}</div>
            </Link>
          ))}
        </div>
      )}

      <section className="seo-section">
        <h2><span className="y-bar" />Where to Watch Football in Your Country</h2>
        <p>
          TV rights differ in every country — the channel showing a match in the United States is not the one
          showing it in the United Kingdom, India or Brazil. Pick your country above to see a dedicated{' '}
          <strong>football TV schedule for your local channels</strong>, covering today and the next two weeks.
        </p>
        <p>
          You can also browse by{' '}
          <Link href="/channels" style={{ color: 'var(--navy)', fontWeight: 600 }}>TV channel</Link> or see the
          full worldwide schedule of{' '}
          <Link href="/" style={{ color: 'var(--navy)', fontWeight: 600 }}>football on TV today</Link>.
        </p>
      </section>

      <Faq
        title="Countries — FAQs"
        items={[
          {
            q: 'How do I find football on TV in my country?',
            a: 'Pick your country from the list above. Its page shows every match with confirmed TV coverage in your country over the next 14 days, with kick-off times in your local timezone.',
          },
          {
            q: 'Why are channels different in each country?',
            a: 'Broadcast rights are sold per territory, so each competition has different official broadcasters in each country. CricFoot lists the official rights holder for every region.',
          },
        ]}
      />
    </>
  );
}
