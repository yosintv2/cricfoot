import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchMatches } from '@/lib/api';
import { fromSlug, toSlug, scheduleDays, countryFlag, dateFromYMD, fmtDate } from '@/lib/utils';
import { QUICK_LEAGUES } from '@/config/leagues';
import { LANG_CONFIG } from '@/config/translations';
import MatchCard from '@/components/MatchCard';
import DayLabel from '@/components/DayLabel';
import Faq from '@/components/Faq';

const { t } = LANG_CONFIG.es;
const SITE_URL = 'https://www.cricfoot.net';

interface Props { params: Promise<{ slug: string; country: string }> }

export async function generateStaticParams() {
  const allMatches = (await Promise.all(scheduleDays().map(fetchMatches))).flat();
  const combos = new Set<string>();

  allMatches.forEach(m => {
    if (!m.league) return;
    const cfg = QUICK_LEAGUES.find(l => l.id != null && l.id === m.league_id);
    const leagueSlug = cfg ? toSlug(cfg.label) : toSlug(m.league);
    (m.tv_channels ?? []).forEach(tv => {
      if (tv.country) combos.add(`${leagueSlug}|${toSlug(tv.country)}`);
    });
  });

  return [...combos].map(combo => {
    const [slug, country] = combo.split('|');
    return { slug, country };
  });
}

async function getData(slugParam: string, countryParam: string) {
  const slug = decodeURIComponent(slugParam);
  const countrySlug = decodeURIComponent(countryParam);

  const dayData = await Promise.all(
    scheduleDays().map(async ymd => ({ ymd, matches: await fetchMatches(ymd) }))
  );

  const cfg = QUICK_LEAGUES.find(l => toSlug(l.label) === slug);
  let leagueName: string | null = null;
  let countryName: string | null = null;

  outer: for (const { matches } of dayData) {
    for (const m of matches) {
      if (!leagueName && m.league) {
        if (cfg?.id != null && m.league_id === cfg.id) leagueName = m.league.split(',')[0].trim();
        else if (!cfg && toSlug(m.league) === slug) leagueName = m.league;
      }
      if (!countryName) {
        for (const tv of m.tv_channels ?? []) {
          if (tv.country && toSlug(tv.country) === countrySlug) { countryName = tv.country; break; }
        }
      }
      if (leagueName && countryName) break outer;
    }
  }

  leagueName = leagueName ?? (cfg?.label ?? fromSlug(slug));
  countryName = countryName ?? fromSlug(countrySlug);

  const upcomingDays = dayData
    .map(({ ymd, matches }) => ({
      ymd,
      matches: matches.filter(m => {
        const leagueMatch = cfg?.id != null ? m.league_id === cfg.id : m.league != null && toSlug(m.league) === slug;
        if (!leagueMatch) return false;
        return (m.tv_channels ?? []).some(tv => tv.country && toSlug(tv.country) === countrySlug);
      }),
    }))
    .filter(d => d.matches.length > 0);

  const channelSet = new Set<string>();
  upcomingDays.flatMap(d => d.matches).forEach(m => {
    (m.tv_channels ?? []).forEach(tv => {
      if (tv.country && toSlug(tv.country) === countrySlug) {
        (tv.channels ?? []).forEach(ch => channelSet.add(ch));
      }
    });
  });

  return { leagueName, countryName, upcomingDays, channels: [...channelSet].sort(), slug };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, country } = await params;
  const { leagueName, countryName } = await getData(slug, country);
  const flag = countryFlag(countryName);

  return {
    title: `${t.watchTitleCountry(leagueName, countryName)} ${flag} – CricFoot`,
    description: t.watchDescCountry(leagueName, countryName),
    keywords: `donde ver ${leagueName} en ${countryName}, ${leagueName} canal ${countryName}, ${leagueName} tv ${countryName}, ${leagueName} directo ${countryName}`,
    alternates: {
      canonical: `${SITE_URL}/es/ver/${decodeURIComponent(slug)}/${decodeURIComponent(country)}/`,
      languages: {
        'en': `${SITE_URL}/watch/${decodeURIComponent(slug)}/${decodeURIComponent(country)}/`,
        'es': `${SITE_URL}/es/ver/${decodeURIComponent(slug)}/${decodeURIComponent(country)}/`,
        'x-default': `${SITE_URL}/watch/${decodeURIComponent(slug)}/${decodeURIComponent(country)}/`,
      },
    },
  };
}

export default async function EsVerLeagueCountryPage({ params }: Props) {
  const { slug, country } = await params;
  const { leagueName, countryName, upcomingDays, channels } = await getData(slug, country);
  const totalMatches = upcomingDays.reduce((s, d) => s + d.matches.length, 0);
  const flag = countryFlag(countryName);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [{
      '@type': 'Question',
      name: `¿En qué canal se ve ${leagueName} en ${countryName}?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: channels.length > 0
          ? `${leagueName} se emite en ${countryName} en ${channels.slice(0, 5).join(', ')}.`
          : `Consulta la lista de partidos para ver los canales disponibles en ${countryName}.`,
      },
    }],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="page-head">
        <h1 className="page-title">
          {flag} {t.watchTitleCountry(leagueName, countryName)}
        </h1>
        <p className="page-sub">
          {channels.length > 0 ? `En ${channels.slice(0, 3).join(', ')}${channels.length > 3 ? ` + ${channels.length - 3} más` : ''}` : 'Canales TV y horarios'} · {totalMatches} partido{totalMatches !== 1 ? 's' : ''} programados
        </p>
      </header>

      {channels.length > 0 && (
        <section className="seo-section" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>
            <span className="y-bar" />{leagueName} — Canales TV en {countryName}
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {channels.map(ch => (
              <Link
                key={ch}
                href={`/channel/${toSlug(ch)}/`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '6px 14px', borderRadius: 20,
                  background: 'var(--bg-section)', border: '1px solid var(--border-lt)',
                  fontSize: '0.84rem', color: 'var(--navy)', fontWeight: 600, textDecoration: 'none',
                }}
              >
                📺 {ch}
              </Link>
            ))}
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t.disclaimer}</p>
        </section>
      )}

      <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 12px' }}>
        <span className="y-bar" />{leagueName} — Partidos en TV en {countryName}
      </h2>
      {upcomingDays.length === 0 ? (
        <div className="state-center">
          <div className="state-icon">📅</div>
          <div className="state-title">No hay partidos de {leagueName} con cobertura TV en {countryName} en los próximos 30 días</div>
          <div className="state-sub">Vuelve pronto — los horarios se actualizan a diario.</div>
          <Link href={`/es/ver/${decodeURIComponent(slug)}/`} className="btn-back" style={{ marginTop: 20, display: 'inline-flex' }}>
            ← {leagueName} en todos los países
          </Link>
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

      <div style={{ display: 'flex', gap: 10, margin: '4px 0 20px', flexWrap: 'wrap' }}>
        <Link href={`/es/ver/${decodeURIComponent(slug)}/`} className="btn-back">
          ← {leagueName} en todos los países
        </Link>
        <Link href={`/league/${decodeURIComponent(slug)}/country/${decodeURIComponent(country)}/`} className="btn-back">
          Calendario completo en {countryName} →
        </Link>
      </div>

      <section className="seo-section">
        <h2><span className="y-bar" />Ver {leagueName} en {countryName}</h2>
        <p>
          <strong>{leagueName}</strong> se emite en directo en <strong>{countryName}</strong>
          {channels.length > 0 && <> en <strong>{channels.slice(0, 3).join(', ')}{channels.length > 3 ? ' y más' : ''}</strong></>}.
          La lista anterior muestra todos los partidos de {leagueName} con cobertura TV confirmada en {countryName}
          durante los próximos 30 días, con los horarios de inicio convertidos a tu zona horaria local.
        </p>
      </section>

      <Faq
        title={`${leagueName} en ${countryName} — Preguntas frecuentes`}
        items={[
          {
            q: `¿En qué canal se ve ${leagueName} en ${countryName}?`,
            a: channels.length > 0
              ? `En ${countryName}, ${leagueName} se emite en ${channels.slice(0, 4).join(', ')}. Los derechos pueden variar según el partido, así que consulta siempre el partido específico para el canal exacto.`
              : `Haz clic en cualquier partido para ver el canal de ${countryName} para ese partido concreto.`,
          },
          {
            q: `¿Se puede ver ${leagueName} por streaming en ${countryName}?`,
            a: t.faq2a,
          },
          { q: t.faq3q, a: t.faq3a },
        ]}
      />
    </>
  );
}
