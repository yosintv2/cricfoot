import type { Metadata } from 'next';
import Link from 'next/link';
import { toSlug } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'About CricFoot – Free Football TV Guide & Match Schedules',
  description:
    'CricFoot is a free football TV guide providing live match schedules, channel listings and fixture information for Premier League, Champions League, La Liga and all major leagues.',
  alternates: { canonical: '/about' },
};

const LEAGUES = [
  'Premier League', 'UEFA Champions League', 'La Liga', 'Serie A', 'Bundesliga',
  'Ligue 1', 'UEFA Europa League', 'FA Cup', 'Carabao Cup', 'Copa del Rey',
  'Coppa Italia', 'DFB-Pokal', 'MLS', 'Liga MX', 'Brazilian Série A',
  'Argentine Primera División', 'Eredivisie', 'Portuguese Primeira Liga',
  'Turkish Süper Lig', 'Scottish Premiership', 'J1 League', 'K League',
];

export default function AboutPage() {
  return (
    <>
      <header style={{
        background: 'linear-gradient(135deg,#2563eb,#9333ea)',
        borderRadius: 16,
        padding: '32px 28px',
        marginBottom: 24,
        marginTop: 24,
        boxShadow: '0 25px 50px rgba(37,99,235,0.3)',
      }}>
        <h1 style={{ fontSize: 'clamp(1.4rem,4vw,2rem)', fontWeight: 900, color: '#fff', marginBottom: 8 }}>
          About CricFoot
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.85)' }}>
          Your trusted TV guide for live football and soccer coverage worldwide
        </p>
      </header>

      <section className="seo-section">
        <h2><span className="y-bar" />What is CricFoot?</h2>
        <p>
          <strong>CricFoot</strong> is a free, comprehensive TV guide dedicated to live football coverage
          worldwide. Our platform aggregates TV schedules, channel listings and match fixtures across hundreds of
          broadcasters globally — so you always know which channel to switch to for your favourite game. If you
          have used services like LiveSoccerTV, think of CricFoot as a free, fast alternative: every match of{' '}
          <Link href="/" style={{ fontWeight: 600 }}>football on TV today</Link> and across a 30-day window,
          with kick-off times in your local timezone.
        </p>
        <p>
          We cover every major competition, including the <strong>Premier League</strong>,{' '}
          <strong>UEFA Champions League</strong>, <strong>La Liga</strong>, <strong>Serie A</strong>,{' '}
          <strong>Bundesliga</strong>, <strong>Ligue 1</strong>, <strong>FA Cup</strong>,{' '}
          <strong>Copa del Rey</strong>, <strong>MLS</strong>, <strong>Brazilian Série A</strong>, and hundreds
          of other leagues from around the world.
        </p>

        <h3>Our Features</h3>
        <ul>
          <li>✅ <strong style={{ color: '#fff' }}>Comprehensive daily match schedule</strong> — Every fixture, every day</li>
          <li>✅ <strong style={{ color: '#fff' }}>Country-specific TV channel info</strong> — Know exactly what to watch in your region</li>
          <li>✅ <strong style={{ color: '#fff' }}>Browse by channel</strong> — See all matches on a specific broadcaster</li>
          <li>✅ <strong style={{ color: '#fff' }}>Browse by league</strong> — All fixtures for your favourite competition</li>
          <li>✅ <strong style={{ color: '#fff' }}>Channel rankings</strong> — See which broadcaster carries the most football</li>
          <li>✅ <strong style={{ color: '#fff' }}>Local kick-off times</strong> — Automatically converted to your timezone</li>
          <li>✅ <strong style={{ color: '#fff' }}>Venue information</strong> — Stadium and location for every match</li>
          <li>✅ <strong style={{ color: '#fff' }}>Search &amp; filter</strong> — Find any match, team or channel instantly</li>
        </ul>

        <h3>Popular Leagues We Cover</h3>
        <div className="tag-cloud">
          {LEAGUES.map(l => (
            <Link key={l} href={`/league/${toSlug(l)}`} className="tag-pill">
              {l}
            </Link>
          ))}
        </div>

        <h3>Disclaimer</h3>
        <p>
          CricFoot is a TV listings and schedule information service only.{' '}
          <strong>We do not stream, host, or broadcast any live or recorded content.</strong> All match data,
          channel listings and schedule information is provided for informational purposes only. For actual live
          streaming, please use your authorised TV service or broadcaster.
        </p>
      </section>

      <Link href="/" className="btn-back" style={{ marginBottom: 24, display: 'inline-block' }}>
        ← Back to Matches
      </Link>
    </>
  );
}
