import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchMatches } from '@/lib/api';
import { scheduleDays } from '@/lib/utils';
import HomeClient from '@/components/HomeClient';
import Faq from '@/components/Faq';
import { LANG_CONFIG } from '@/config/translations';

const { t } = LANG_CONFIG.es;
const SITE_URL = 'https://www.cricfoot.net';

export const metadata: Metadata = {
  title: t.siteTitle,
  description: t.siteDesc,
  keywords: 'fútbol en vivo hoy tv, partidos de fútbol hoy, fútbol en directo hoy, canales fútbol tv, ver fútbol en tv, premier league tv español, champions league hoy tv, copa del mundo tv',
  alternates: {
    canonical: `${SITE_URL}/es/`,
    languages: {
      'en': `${SITE_URL}/`,
      'es': `${SITE_URL}/es/`,
      'x-default': `${SITE_URL}/`,
    },
  },
  openGraph: {
    title: t.h1,
    description: t.siteDesc,
  },
};

const ES_FAQS = [
  {
    q: '¿Qué partidos de fútbol hay hoy en TV?',
    a: 'CricFoot muestra todos los partidos de fútbol en directo hoy, agrupados por liga con horarios en tu zona horaria local. Haz clic en cualquier partido para ver la lista completa de canales que lo transmiten en tu país.',
  },
  {
    q: '¿Dónde puedo ver fútbol en directo por TV?',
    a: 'Todo el fútbol en vivo por TV está aquí — todas las competiciones, todos los canales, todos los países. Haz clic en un partido para ver su tabla de emisores por país, o navega por canal, liga, equipo o país usando los menús.',
  },
  {
    q: '¿Cómo sé en qué canal va el partido?',
    a: 'Abre CricFoot, elige el día en las pestañas de fecha y haz clic en cualquier partido. Verás la lista completa de canales de televisión para cada país, para que encuentres el canal correcto desde donde estés.',
  },
  {
    q: '¿Los horarios están en mi zona horaria?',
    a: 'Sí. CricFoot convierte automáticamente todos los horarios de inicio a la zona horaria de tu dispositivo, así que siempre ves la hora local del país donde te encuentras.',
  },
  {
    q: '¿Qué ligas cubre CricFoot?',
    a: 'CricFoot cubre la Copa del Mundo FIFA, la UEFA Champions League, la Premier League, La Liga, la Serie A, la Bundesliga, la Ligue 1, la MLS y cientos de ligas y copas más en todo el mundo, actualizadas a diario.',
  },
  {
    q: '¿Es gratis usar CricFoot?',
    a: 'Sí, CricFoot es completamente gratuito. Es una guía de programación de TV — te mostramos dónde se emiten los partidos, pero no hacemos streaming ni alojamos ningún contenido.',
  },
  {
    q: '¿Con qué frecuencia se actualiza la programación?',
    a: 'Los horarios y los datos de canales se actualizan cada hora, cubriendo una ventana completa de 30 días — ayer, hoy y los próximos 29 días — para que la guía siempre refleje la información más reciente.',
  },
];

export default async function EsHomePage() {
  const allDayMatches = await Promise.all(
    scheduleDays().map(async (ymd) => ({ ymd, matches: await fetchMatches(ymd) }))
  );

  return (
    <>
      <header className="page-head">
        <h1 className="page-title">{t.h1}</h1>
        <p className="page-sub">{t.sub}</p>
      </header>

      <HomeClient allDayMatches={allDayMatches} />

      <section className="seo-section" aria-label="Más guías de TV">
        <h2><span className="y-bar" />Más guías de TV de fútbol</h2>
        <div className="tag-cloud">
          <Link href="/tonight/" className="tag-pill">🌙 Fútbol TV esta noche</Link>
          <Link href="/tomorrow/" className="tag-pill">📅 Fútbol TV mañana</Link>
          <Link href="/this-weekend/" className="tag-pill">🗓️ Fútbol este fin de semana</Link>
          <Link href="/world-cup-2026/" className="tag-pill">🏆 Copa del Mundo 2026 TV</Link>
          <Link href="/es/ver/" className="tag-pill">📺 ¿Dónde ver las ligas?</Link>
          <Link href="/countries/" className="tag-pill">🌍 Ver por país</Link>
        </div>
      </section>

      <section className="seo-section">
        <h2><span className="y-bar" />{t.seoH2}</h2>
        <p>{t.seoPara}</p>
      </section>

      <Faq items={ES_FAQS} />
    </>
  );
}
