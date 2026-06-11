'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toSlug } from '@/lib/utils';

const QUICK_LEAGUES = [
  { name: 'World Cup', flag: '🏆', href: `/league/${toSlug('FIFA World Cup')}` },
  { name: 'Champions L.', flag: '⭐', href: `/league/${toSlug('UEFA Champions League')}` },
  { name: 'Friendly', flag: '🤝', href: `/league/${toSlug('International Friendly')}` },
  { name: 'EPL', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', href: `/league/${toSlug('Premier League')}` },
  { name: 'La Liga', flag: '🇪🇸', href: `/league/${toSlug('La Liga')}` },
  { name: 'Serie A', flag: '🇮🇹', href: `/league/${toSlug('Serie A')}` },
  { name: 'Bundesliga', flag: '🇩🇪', href: `/league/${toSlug('Bundesliga')}` },
  { name: 'Ligue 1', flag: '🇫🇷', href: `/league/${toSlug('Ligue 1')}` },
];

const NAV_LINKS = [
  { href: '/', label: 'Matches' },
  { href: '/channels', label: 'Channels' },
  { href: '/about', label: 'About' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) {
      router.push(`/?q=${encodeURIComponent(q.trim())}`);
      setOpen(false);
    }
  }

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">

      {/* ── Row 1: Logo + Search + App buttons ── */}
      <div className="nav-top">
        <div className="nav-top-inner">

          <Link href="/" className="nav-logo" aria-label="CricFoot home">
            <svg className="nav-logo-icon" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="20" cy="20" r="19" fill="#b91c1c"/>
              <circle cx="20" cy="20" r="19" fill="url(#rg1)"/>
              {/* pentagon patches */}
              <polygon points="20,5 24,13 20,11 16,13" fill="white" opacity="0.85"/>
              <polygon points="31,12 27,18 29,23 35,21" fill="white" opacity="0.7"/>
              <polygon points="29,30 23,27 20,32 24,36" fill="white" opacity="0.7"/>
              <polygon points="11,30 17,27 20,32 16,36" fill="white" opacity="0.7"/>
              <polygon points="9,12 13,18 11,23 5,21" fill="white" opacity="0.7"/>
              {/* arc on top representing soccer field curve */}
              <path d="M8 30 Q20 40 32 30" stroke="white" strokeWidth="1.5" fill="none" opacity="0.4"/>
              <circle cx="20" cy="20" r="19" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1"/>
              <defs>
                <radialGradient id="rg1" cx="38%" cy="30%">
                  <stop offset="0%" stopColor="#ef4444"/>
                  <stop offset="100%" stopColor="#7f1d1d"/>
                </radialGradient>
              </defs>
            </svg>
            <span className="nav-brand">Cric<span>Foot</span></span>
          </Link>

          <form className="nav-search-wrap" onSubmit={handleSearch} role="search">
            <input
              className="nav-search"
              type="search"
              placeholder="Search for league, team, channel..."
              aria-label="Search leagues, teams and channels"
              value={q}
              onChange={e => setQ(e.target.value)}
            />
          </form>

          <div className="nav-top-actions">
            <button className="nav-gear" aria-label="Settings" title="Settings" type="button">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </button>

            <a href="https://apps.apple.com" className="nav-app-btn" target="_blank" rel="noopener noreferrer" aria-label="Download on App Store">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <div>
                <span className="nav-app-sub">Download on the</span>
                <span className="nav-app-main">App Store</span>
              </div>
            </a>

            <a href="https://play.google.com" className="nav-app-btn" target="_blank" rel="noopener noreferrer" aria-label="Get it on Google Play">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="m3 20.5v-17c0-.83.94-1.3 1.6-.8l14 8.5c.6.37.6 1.23 0 1.6l-14 8.5c-.66.5-1.6.03-1.6-.8z"/>
              </svg>
              <div>
                <span className="nav-app-sub">GET IT ON</span>
                <span className="nav-app-main">Google Play</span>
              </div>
            </a>

            <button
              className={`nav-hamburger${open ? ' open' : ''}`}
              onClick={() => setOpen(o => !o)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              type="button"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </div>

      {/* ── Row 2: Dark-navy nav links ── */}
      <div className="nav-main">
        <div className="nav-main-inner">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`nav-main-link${pathname === href ? ' active' : ''}`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Row 3: Quick league shortcuts ── */}
      <div className="nav-leagues" aria-label="Popular leagues">
        <div className="nav-leagues-inner">
          {QUICK_LEAGUES.map(({ name, flag, href }) => (
            <Link key={name} href={href} className="nav-league-link">
              <span aria-hidden="true">{flag}</span>
              {name}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {open && (
        <div className="nav-mobile-menu" role="menu">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`nav-mobile-link${pathname === href ? ' active' : ''}`}
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
          <div style={{ padding: '10px 16px 14px', borderTop: '1px solid var(--border-lt)' }}>
            <form onSubmit={handleSearch}>
              <input
                style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: '0.875rem', fontFamily: 'inherit', color: 'var(--text)' }}
                type="search"
                placeholder="Search leagues, teams, channels..."
                value={q}
                onChange={e => setQ(e.target.value)}
                aria-label="Search"
              />
            </form>
          </div>
        </div>
      )}
    </nav>
  );
}
