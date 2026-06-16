import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchMatches } from '@/lib/api';
import { toSlug, scheduleDays, getLeagueFlag } from '@/lib/utils';
import { QUICK_LEAGUES } from '@/config/leagues';
import { LANG_CONFIG } from '@/config/translations';

const { t } = LANG_CONFIG.es;
const SITE_URL = 'https://www.cricfoot.net';

export const metadata: Metadata = {
  title: '¿Dónde ver fútbol en TV? – Todas las ligas por país | CricFoot',
  description: 'Descubre dónde ver cada liga de fútbol en TV — Premier League, Champions League, Copa del Mundo y más. Navega por liga y país para encontrar tu canal y horario.',
  keywords: 'donde ver fútbol en tv, canales fútbol tv por país, ver premier league en tv, champions league canal, copa del mundo tv, fútbol streaming',
  alternates: {
    canonical: `${SITE_URL}/es/ver/`,
    languages: {
      'en': `${SITE_URL}/watch/`,
      'es': `${SITE_URL}/es/ver/`,
      'x-default': `${SITE_URL}/watch/`,
    },
  },
};

interface LeagueCard {
  slug: string;
  label: string;
  flag: string;
  matchCount: number;
  countryCount: number;
  topChannels: string[];
}

async function getData(): Promise<LeagueCard[]> {
  const allMatches = (await Promise.all(scheduleDays().map(fetchMatches))).flat();

  const leagueMap = new Map<string, {
    label: string; flag: string; matches: number;
    countries: Set<string>; channels: Set<string>;
  }>();

  allMatches.forEach(m => {
    if (!m.league) return;
    const cfg = QUICK_LEAGUES.find(l => l.id != null && l.id === m.league_id)
      ?? QUICK_LEAGUES.find(l => l.name === m.league);
    const label = cfg?.label ?? m.league;
    const slug = cfg ? toSlug(cfg.label) : toSlug(m.league);
    const flag = cfg?.flag ?? getLeagueFlag(m.league);

    if (!leagueMap.has(slug)) {
      leagueMap.set(slug, { label, flag, matches: 0, countries: new Set(), channels: new Set() });
    }
    const entry = leagueMap.get(slug)!;
    entry.matches++;
    (m.tv_channels ?? []).forEach(tv => {
      if (tv.country) entry.countries.add(tv.country);
      (tv.channels ?? []).forEach(ch => entry.channels.add(ch));
    });
  });

  const quickSlugs = QUICK_LEAGUES.map(q => toSlug(q.label));
  const cards: LeagueCard[] = [];

  quickSlugs.forEach(slug => {
    const e = leagueMap.get(slug);
    if (e) cards.push({ slug, label: e.label, flag: e.flag, matchCount: e.matches, countryCount: e.countries.size, topChannels: [...e.channels].sort().slice(0, 3) });
  });
  [...leagueMap.entries()]
    .filter(([slug]) => !quickSlugs.includes(slug))
    .sort(([, a], [, b]) => a.label.localeCompare(b.label))
    .forEach(([slug, e]) => cards.push({ slug, label: e.label, flag: e.flag, matchCount: e.matches, countryCount: e.countries.size, topChannels: [...e.channels].sort().slice(0, 3) }));

  return cards;
}

export default async function EsVerIndexPage() {
  const leagues = await getData();
  const totalMatches = leagues.reduce((s, l) => s + l.matchCount, 0);

  return (
    <>
      <header className="page-head">
        <h1 className="page-title">📺 ¿Dónde ver fútbol en TV?</h1>
        <p className="page-sub">
          {leagues.length} liga{leagues.length !== 1 ? 's' : ''} · {totalMatches} partidos próximos · actualizado cada hora
        </p>
      </header>

      <section className="seo-section" style={{ marginBottom: 24 }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
          Elige tu liga y descubre todos los canales que la emiten en tu país,
          horarios de inicio en tu zona horaria y el calendario completo de los próximos 30 días.
        </p>
      </section>

      {leagues.length === 0 ? (
        <div className="state-center">
          <div className="state-icon">📅</div>
          <div className="state-title">No hay partidos en los próximos 30 días</div>
          <div className="state-sub">Vuelve pronto — los horarios se actualizan cada hora.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, marginBottom: 32 }}>
          {leagues.map(league => (
            <Link
              key={league.slug}
              href={`/es/ver/${league.slug}/`}
              style={{
                display: 'flex', flexDirection: 'column', gap: 8,
                padding: '14px 16px',
                background: 'var(--bg-section)', border: '1px solid var(--border-lt)',
                borderRadius: 8, textDecoration: 'none', color: 'inherit',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.3rem' }}>{league.flag}</span>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--navy)' }}>{league.label}</span>
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <span>🌍 {league.countryCount} país{league.countryCount !== 1 ? 'es' : ''}</span>
                <span>📅 {league.matchCount} partido{league.matchCount !== 1 ? 's' : ''}</span>
              </div>
              {league.topChannels.length > 0 && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  📺 {league.topChannels.join(' · ')}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      <section className="seo-section">
        <h2><span className="y-bar" />¿Cómo encontrar fútbol en TV?</h2>
        <p>
          CricFoot reúne datos de emisión en directo de cientos de canales de TV en todo el mundo.
          Selecciona cualquier liga para ver <strong>todos los emisores por país</strong>,
          incluyendo canales de cable, TV por satélite y servicios de streaming oficiales.
          Los horarios de inicio se ajustan automáticamente a tu zona horaria local.
        </p>
      </section>
    </>
  );
}
