import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchMatches } from '@/lib/api';
import { fromSlug, toSlug, scheduleDays, countryFlag, getLeagueFlag, dateFromYMD, fmtDate } from '@/lib/utils';
import { QUICK_LEAGUES } from '@/config/leagues';
import { LANG_CONFIG } from '@/config/translations';
import MatchCard from '@/components/MatchCard';
import DayLabel from '@/components/DayLabel';
import Faq from '@/components/Faq';

const { t } = LANG_CONFIG.es;
const SITE_URL = 'https://www.cricfoot.net';

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const allMatches = (await Promise.all(scheduleDays().map(fetchMatches))).flat();
  const slugs = new Set<string>();
  allMatches.forEach(m => {
    if (!m.league) return;
    const cfg = QUICK_LEAGUES.find(l => l.id != null && l.id === m.league_id);
    slugs.add(cfg ? toSlug(cfg.label) : toSlug(m.league));
  });
  return [...slugs].map(slug => ({ slug }));
}

async function getData(slugParam: string) {
  const slug = decodeURIComponent(slugParam);
  const dayData = await Promise.all(
    scheduleDays().map(async ymd => ({ ymd, matches: await fetchMatches(ymd) }))
  );
  const cfg = QUICK_LEAGUES.find(l => toSlug(l.label) === slug);

  let leagueName: string | null = null;
  outer: for (const { matches } of dayData) {
    for (const m of matches) {
      if (!m.league) continue;
      if (cfg?.id != null && m.league_id === cfg.id) { leagueName = m.league.split(',')[0].trim(); break outer; }
      else if (!cfg && toSlug(m.league) === slug) { leagueName = m.league; break outer; }
    }
  }
  leagueName = leagueName ?? (cfg?.label ?? fromSlug(slug));

  const upcomingDays = dayData
    .map(({ ymd, matches }) => ({
      ymd,
      matches: matches.filter(m => cfg?.id != null ? m.league_id === cfg.id : m.league != null && toSlug(m.league) === slug),
    }))
    .filter(d => d.matches.length > 0);

  const countryChannels = new Map<string, Set<string>>();
  upcomingDays.flatMap(d => d.matches).forEach(m => {
    (m.tv_channels ?? []).forEach(tv => {
      if (!tv.country) return;
      if (!countryChannels.has(tv.country)) countryChannels.set(tv.country, new Set());
      (tv.channels ?? []).forEach(ch => countryChannels.get(tv.country)!.add(ch));
    });
  });

  const broadcasters = [...countryChannels.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([country, chs]) => ({ country, channels: [...chs].sort() }));

  return { leagueName, upcomingDays, broadcasters, slug };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { leagueName } = await getData(slug);
  return {
    title: `${t.watchTitle(leagueName)} – Canales TV por País | CricFoot`,
    description: t.watchDesc(leagueName),
    keywords: `donde ver ${leagueName} en tv, ${leagueName} canal tv, ${leagueName} en directo, que canal pone ${leagueName}, ${leagueName} streaming`,
    alternates: {
      canonical: `${SITE_URL}/es/ver/${decodeURIComponent(slug)}/`,
      languages: {
        'en': `${SITE_URL}/watch/${decodeURIComponent(slug)}/`,
        'es': `${SITE_URL}/es/ver/${decodeURIComponent(slug)}/`,
        'x-default': `${SITE_URL}/watch/${decodeURIComponent(slug)}/`,
      },
    },
    openGraph: {
      title: t.watchTitle(leagueName),
      description: t.watchDesc(leagueName),
    },
  };
}

export default async function EsVerLeaguePage({ params }: Props) {
  const { slug } = await params;
  const { leagueName, upcomingDays, broadcasters } = await getData(slug);
  const totalMatches = upcomingDays.reduce((s, d) => s + d.matches.length, 0);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [{
      '@type': 'Question',
      name: t.faq1q(leagueName),
      acceptedAnswer: {
        '@type': 'Answer',
        text: broadcasters.length > 0
          ? t.faq1a(leagueName, broadcasters.slice(0, 5).map(b => `${b.country}: ${b.channels.slice(0, 2).join(', ')}`).join('; '))
          : `Consulta la lista de partidos para ver los canales por país.`,
      },
    }],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="page-head">
        <h1 className="page-title">{getLeagueFlag(leagueName)} {t.watchTitle(leagueName)}</h1>
        <p className="page-sub">
          {broadcasters.length} país{broadcasters.length !== 1 ? 'es' : ''} · {totalMatches} partido{totalMatches !== 1 ? 's' : ''} próximos · calendario de 30 días
        </p>
      </header>

      {/* Broadcaster table */}
      {broadcasters.length > 0 && (
        <section className="seo-section" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>
            <span className="y-bar" />{leagueName} – {t.broadcaster}
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-section)' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600, whiteSpace: 'nowrap' }}>País</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>{t.broadcaster}</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600, whiteSpace: 'nowrap' }}>Horario completo</th>
                </tr>
              </thead>
              <tbody>
                {broadcasters.map(b => (
                  <tr key={b.country} style={{ borderBottom: '1px solid var(--border-lt)' }}>
                    <td style={{ padding: '9px 12px', fontWeight: 500, whiteSpace: 'nowrap' }}>
                      {countryFlag(b.country)} {b.country}
                    </td>
                    <td style={{ padding: '9px 12px', color: 'var(--text-muted)' }}>
                      {b.channels.map((ch, i) => (
                        <span key={ch}>
                          <Link href={`/channel/${toSlug(ch)}/`} style={{ color: 'var(--navy)', fontWeight: 500 }}>{ch}</Link>
                          {i < b.channels.length - 1 && ', '}
                        </span>
                      ))}
                    </td>
                    <td style={{ padding: '9px 12px' }}>
                      <Link href={`/es/ver/${decodeURIComponent(slug)}/${toSlug(b.country)}/`} style={{ color: 'var(--navy)', fontSize: '0.8rem', fontWeight: 500 }}>
                        {b.country} →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 10 }}>
            {t.disclaimer}
          </p>
        </section>
      )}

      {/* Upcoming fixtures */}
      <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 12px' }}>
        <span className="y-bar" />{t.upcomingFixtures} — {leagueName}
      </h2>
      {upcomingDays.length === 0 ? (
        <div className="state-center">
          <div className="state-icon">📅</div>
          <div className="state-title">No hay partidos de {leagueName} en los próximos 30 días</div>
          <div className="state-sub">Vuelve pronto — los horarios se actualizan a diario.</div>
          <Link href="/es/ver/" className="btn-back" style={{ marginTop: 20, display: 'inline-flex' }}>← {t.allChannels}</Link>
        </div>
      ) : (
        upcomingDays.map(({ ymd, matches }) => {
          const full = fmtDate(dateFromYMD(ymd));
          return (
            <section key={ymd} className="day-section">
              <div className="day-section-header">
                <div>
                  <div className="day-section-label"><DayLabel ymd={ymd} /></div>
                  <div className="day-section-date">{full}</div>
                </div>
                <span className="day-section-count">{matches.length} {matches.length !== 1 ? t.matches : t.match}</span>
              </div>
              <div style={{ border: '1px solid var(--border-lt)', borderTop: 'none', borderRadius: '0 0 6px 6px', overflow: 'hidden', marginBottom: 4 }}>
                {matches.map((m, i) => <MatchCard key={i} match={m} ymd={ymd} />)}
              </div>
            </section>
          );
        })
      )}

      <div style={{ margin: '4px 0 20px' }}>
        <Link href={`/league/${slug}/`} className="btn-back">{t.viewFullSchedule}</Link>
      </div>

      <section className="seo-section">
        <h2><span className="y-bar" />Cómo ver {leagueName} en directo por TV</h2>
        <p>
          <strong>{leagueName}</strong> se emite en directo en{' '}
          <strong>{broadcasters.length} países</strong>. La tabla muestra todos los emisores
          oficiales por país — haz clic en cualquier canal para ver su programación completa de
          fútbol de 30 días, o haz clic en un país para ver solo los partidos de {leagueName}
          disponibles en ese territorio.
        </p>
        <p>
          Los horarios de inicio se convierten automáticamente a tu zona horaria local. Para ver{' '}
          <strong>{leagueName}</strong>, suscríbete al emisor oficial de tu país.
          CricFoot es solo una guía de TV: no aloja ni emite ningún contenido.
        </p>
      </section>

      <Faq
        title={`${leagueName} – Preguntas frecuentes`}
        items={[
          {
            q: t.faq1q(leagueName),
            a: broadcasters.length > 0
              ? t.faq1a(leagueName, broadcasters.slice(0, 5).map(b => `${b.country} (${b.channels.slice(0, 2).join(', ')})`).join(', '))
              : `Consulta la lista de partidos para ver los canales específicos por país.`,
          },
          { q: t.faq2q(leagueName), a: t.faq2a },
          { q: t.faq3q, a: t.faq3a },
          {
            q: `¿Con qué frecuencia se actualiza el calendario de ${leagueName}?`,
            a: `El calendario de partidos y la información de canales se actualiza cada hora. Si un partido o canal aún no está disponible, vuelve pronto — los nuevos partidos se publican en cuanto los emisores los confirman.`,
          },
        ]}
      />
    </>
  );
}
