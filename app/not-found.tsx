import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Page Not Found – CricFoot',
  description: 'The page you are looking for could not be found. This channel may have no matches scheduled in the current 30-day window.',
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <div style={{ fontSize: '3rem', marginBottom: 16 }}>📺</div>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text)', marginBottom: 8 }}>
        No matches listed here
      </h1>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 8, maxWidth: 380, margin: '0 auto 8px' }}>
        This channel or page may not have matches listed for today or the coming week.
      </p>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 28, maxWidth: 380, margin: '0 auto 28px' }}>
        Schedules update daily — please check back soon.
      </p>
      <Link href="/" style={{
        display: 'inline-block',
        background: 'var(--navy)',
        color: '#fff',
        padding: '11px 26px',
        borderRadius: 8,
        fontWeight: 700,
        fontSize: '0.9rem',
        textDecoration: 'none',
      }}>
        ← Back to Today&apos;s Matches
      </Link>
    </div>
  );
}
