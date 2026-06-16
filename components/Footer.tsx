'use client';

import Link from 'next/link';
import { toSlug } from '@/lib/utils';
import { useLang } from '@/contexts/LangContext';
import Logo from './Logo';

const TOP_LEAGUES = [
  'Premier League',
  'UEFA Champions League',
  'La Liga',
  'Serie A',
  'Bundesliga',
  'Ligue 1',
];

export default function Footer() {
  const { t } = useLang();
  const year = new Date().getFullYear();

  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-grid">
          <div>
            <div className="footer-logo-row">
              <Logo size={30} />
              <span className="footer-brand-name">CricFoot</span>
            </div>
            <p className="footer-desc">
              {t?.footerDescription ?? 'Your ultimate TV guide for live football and soccer matches worldwide. Find comprehensive schedules, match fixtures, and channel listings for all major leagues.'}
            </p>
            <p className="footer-disclaimer">
              {t?.footerDisclaimer ?? 'We provide TV listings and schedules only. We do not stream or broadcast any content.'}
            </p>
          </div>

          <div>
            <div className="footer-col-title">{t?.footerQuickLinks ?? 'Quick Links'}</div>
            <div className="footer-links">
              <Link href="/" className="footer-link">Home / Today&apos;s Matches</Link>
              <Link href="/world-cup-2026" className="footer-link">World Cup 2026 TV Guide</Link>
              <Link href="/channels" className="footer-link">All Channels</Link>
              <Link href="/countries" className="footer-link">Browse by Country</Link>
              <Link href="/about" className="footer-link">About Us</Link>
              <Link href="/privacy/" className="footer-link">Privacy Policy</Link>
            </div>
          </div>

          <div>
            <div className="footer-col-title">{t?.footerTopLeagues ?? 'Top Leagues'}</div>
            <div className="footer-links">
              {TOP_LEAGUES.map(l => (
                <Link key={l} href={`/league/${toSlug(l)}`} className="footer-link">
                  {l}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="footer-col-title">{t?.footerPopularSearches ?? 'Popular Searches'}</div>
            <div className="footer-links">
              <Link href="/" className="footer-link">Live Football Match Today</Link>
              <Link href="/" className="footer-link">Live Football on TV</Link>
              <Link href="/tonight" className="footer-link">Football on TV Tonight</Link>
              <Link href="/tomorrow" className="footer-link">Football on TV Tomorrow</Link>
              <Link href="/this-weekend" className="footer-link">Football This Weekend</Link>
              <Link href="/world-cup-2026" className="footer-link">Where to Watch World Cup 2026</Link>
              <Link href="/channels" className="footer-link">Live Soccer TV Channels</Link>
            </div>
          </div>
        </div>

      </div>
      <div className="footer-inner" style={{ paddingTop: 0, paddingBottom: 16 }}>
        <div className="footer-bottom">
          <span>{t?.footerCopyright ?? `© ${year} CricFoot. TV listings & schedules only.`}</span>
          <span>All kick-off times shown in your local timezone.</span>
        </div>
      </div>
    </footer>
  );
}
