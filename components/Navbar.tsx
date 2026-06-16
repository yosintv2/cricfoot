'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toSlug } from '@/lib/utils';
import { QUICK_LEAGUES } from '@/config/leagues';
import { LANG_CONFIG, SUPPORTED_LANGS, Lang } from '@/config/translations';
import { useLang } from '@/contexts/LangContext';
import Logo from './Logo';

function quickLeagueHref(l: { label: string; href?: string }): string {
  return l.href ?? `/league/${toSlug(l.label)}`;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { lang, t, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [q, setQ] = useState('');
  const langRef = useRef<HTMLDivElement>(null);

  // Close language dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    if (langOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [langOpen]);

  const navLinks = [
    { href: '/', label: t?.navMatches ?? 'Matches' },
    { href: '/world-cup-2026', label: t?.navWorldCup ?? 'World Cup 2026' },
    { href: '/channels', label: t?.navChannels ?? 'Channels' },
    { href: '/countries', label: t?.navCountries ?? 'Countries' },
    { href: '/about', label: t?.navAbout ?? 'About' },
  ];

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) {
      router.push(`/?q=${encodeURIComponent(q.trim())}`);
      setOpen(false);
    }
  }

  const currentFlag = lang ? LANG_CONFIG[lang].flag : '🌐';
  const currentCode = lang ? lang.toUpperCase() : 'EN';

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">

      {/* ── Row 1: Logo + Search + App buttons ── */}
      <div className="nav-top">
        <div className="nav-top-inner">

          <Link href="/" className="nav-logo" aria-label="CricFoot home">
            <Logo size={40} />
            <span className="nav-brand">Cric<span>Foot</span></span>
          </Link>

          <form className="nav-search-wrap" onSubmit={handleSearch} role="search">
            <input
              className="nav-search"
              type="search"
              placeholder={t?.navSearchPlaceholder ?? 'Search for league, team, channel...'}
              aria-label="Search leagues, teams and channels"
              value={q}
              onChange={e => setQ(e.target.value)}
            />
          </form>

          <div className="nav-top-actions">
            {/* Language picker */}
            <div className="nav-lang-wrap" ref={langRef}>
              <button
                className="nav-lang-btn"
                onClick={() => setLangOpen(o => !o)}
                aria-label="Select language"
                aria-expanded={langOpen}
                type="button"
              >
                <span>{currentFlag}</span>
                <span className="nav-lang-code">{currentCode}</span>
                <span className="nav-lang-caret" aria-hidden="true">▾</span>
              </button>
              {langOpen && (
                <div className="nav-lang-menu" role="listbox" aria-label="Select language">
                  <button
                    className={`nav-lang-option${!lang ? ' active' : ''}`}
                    onClick={() => { setLang(null); setLangOpen(false); }}
                    role="option"
                    aria-selected={!lang}
                    type="button"
                  >
                    🇬🇧 English
                  </button>
                  {SUPPORTED_LANGS.map(l => (
                    <button
                      key={l}
                      className={`nav-lang-option${lang === l ? ' active' : ''}`}
                      onClick={() => { setLang(l as Lang); setLangOpen(false); }}
                      role="option"
                      aria-selected={lang === l}
                      type="button"
                    >
                      {LANG_CONFIG[l].flag} {LANG_CONFIG[l].nativeName}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <a href="https://apps.apple.com" className="nav-app-btn" target="_blank" rel="noopener noreferrer" aria-label="Download on App Store">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <div>
                <span className="nav-app-sub">Download on the</span>
                <span className="nav-app-main">{t?.appStoreLabel ?? 'App Store'}</span>
              </div>
            </a>

            <a href="https://play.google.com" className="nav-app-btn" target="_blank" rel="noopener noreferrer" aria-label="Get it on Google Play">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="m3 20.5v-17c0-.83.94-1.3 1.6-.8l14 8.5c.6.37.6 1.23 0 1.6l-14 8.5c-.66.5-1.6.03-1.6-.8z"/>
              </svg>
              <div>
                <span className="nav-app-sub">GET IT ON</span>
                <span className="nav-app-main">{t?.googlePlayLabel ?? 'Google Play'}</span>
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
          {navLinks.map(({ href, label }) => (
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
          {QUICK_LEAGUES.map(l => (
            <Link key={l.label} href={quickLeagueHref(l)} className="nav-league-link">
              <span aria-hidden="true">{l.flag}</span>
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {open && (
        <div className="nav-mobile-menu" role="menu">
          {navLinks.map(({ href, label }) => (
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

          {/* Language selector in mobile menu */}
          <div className="nav-mobile-lang" role="group" aria-label="Select language">
            <div className="nav-mobile-lang-label">Language</div>
            <div className="nav-mobile-lang-options">
              <button
                className={`nav-mobile-lang-opt${!lang ? ' active' : ''}`}
                onClick={() => { setLang(null); setOpen(false); }}
                type="button"
              >
                🇬🇧 EN
              </button>
              {SUPPORTED_LANGS.map(l => (
                <button
                  key={l}
                  className={`nav-mobile-lang-opt${lang === l ? ' active' : ''}`}
                  onClick={() => { setLang(l as Lang); setOpen(false); }}
                  type="button"
                >
                  {LANG_CONFIG[l].flag} {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: '10px 16px 14px', borderTop: '1px solid var(--border-lt)' }}>
            <form onSubmit={handleSearch}>
              <input
                style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: '0.875rem', fontFamily: 'inherit', color: 'var(--text)' }}
                type="search"
                placeholder={t?.navSearchPlaceholder ?? 'Search leagues, teams, channels...'}
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
