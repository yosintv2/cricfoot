import type { Metadata } from 'next';
import { fetchMatches } from '@/lib/api';
import { fromSlug, toSlug, scheduleDays, countryFlag } from '@/lib/utils';
import { QUICK_LEAGUES } from '@/config/leagues';
import LeaguePageClient from '@/components/LeaguePageClient';
import Faq from '@/components/Faq';

interface Props {
  params: Promise<{ name: string; country: string }>;
}

export async function generateStaticParams() {
  const allMatches = (await Promise.all(scheduleDays().map(fetchMatches))).flat();
  const combos = new Set<string>();

  allMatches.forEach(m => {
    if (!m.league) return;
    // Use QUICK_LEAGUES label slug when the league matches by id, else use the league name slug
    const cfg = QUICK_LEAGUES.find(l => l.id != null && l.id === m.league_id);
    const leagueSlug = cfg ? toSlug(cfg.label) : toSlug(m.league);
    (m.tv_channels ?? []).forEach(tv => {
      if (tv.country) combos.add(`${leagueSlug}|${toSlug(tv.country)}`);
    });
  });

  return [...combos].map(combo => {
    const [name, country] = combo.split('|');
    return { name, country };
  });
}

async function getData(nameParam: string, countryParam: string) {
  const leagueSlug = decodeURIComponent(nameParam);
  const countrySlug = decodeURIComponent(countryParam);

  const dayData = await Promise.all(
    scheduleDays().map(async (ymd) => ({ ymd, matches: await fetchMatches(ymd) }))
  );

  const cfg = QUICK_LEAGUES.find(l => toSlug(l.label) === leagueSlug);

  let leagueName: string | null = null;
  let countryName: string | null = null;

  outer: for (const { matches } of dayData) {
    for (const m of matches) {
      if (!leagueName && m.league) {
        if (cfg?.id != null && m.league_id === cfg.id) {
          leagueName = m.league.split(',')[0].trim();
        } else if (!cfg && toSlug(m.league) === leagueSlug) {
          leagueName = m.league;
        }
      }
      if (!countryName) {
        for (const tv of m.tv_channels ?? []) {
          if (tv.country && toSlug(tv.country) === countrySlug) {
            countryName = tv.country;
            break;
          }
        }
      }
      if (leagueName && countryName) break outer;
    }
  }

  leagueName = leagueName ?? (cfg?.label ?? fromSlug(leagueSlug));
  countryName = countryName ?? fromSlug(countrySlug);

  const upcomingDays = dayData
    .map(({ ymd, matches }) => ({
      ymd,
      matches: matches.filter(m => {
        const leagueMatch = cfg?.id != null
          ? m.league_id === cfg.id
          : m.league != null && toSlug(m.league) === leagueSlug;
        if (!leagueMatch) return false;
        return (m.tv_channels ?? []).some(tv => tv.country && toSlug(tv.country) === countrySlug);
      }),
    }))
    .filter(d => d.matches.length > 0);

  return { leagueName, countryName, upcomingDays };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name, country } = await params;
  const { leagueName, countryName } = await getData(name, country);
  const flag = countryFlag(countryName);

  return {
    title: `${leagueName} on TV in ${countryName} ${flag} – ${leagueName} ${countryName} TV Schedule | CricFoot`,
    description: `Watch ${leagueName} on TV in ${countryName}: every match, kick-off time in your local timezone and the ${countryName} TV channels broadcasting each ${leagueName} fixture live.`,
    keywords: `${leagueName} TV ${countryName}, ${leagueName} ${countryName} channel, watch ${leagueName} in ${countryName}, ${leagueName} live TV ${countryName}, ${leagueName} broadcast ${countryName}`,
    openGraph: {
      title: `${leagueName} on TV in ${countryName} – TV Schedule & Channels`,
      description: `Every ${leagueName} match on TV in ${countryName} with kick-off times and broadcaster listings.`,
    },
    twitter: {
      title: `${leagueName} TV Schedule in ${countryName} | CricFoot`,
      description: `${leagueName} matches on TV in ${countryName} — kick-off times and channels.`,
    },
    alternates: {
      canonical: `/league/${decodeURIComponent(name)}/country/${decodeURIComponent(country)}/`,
    },
  };
}

export default async function LeagueCountryPage({ params }: Props) {
  const { name, country } = await params;
  const { leagueName, countryName, upcomingDays } = await getData(name, country);
  const totalMatches = upcomingDays.reduce((s, d) => s + d.matches.length, 0);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.cricfoot.net/' },
      { '@type': 'ListItem', position: 2, name: leagueName, item: `https://www.cricfoot.net/league/${decodeURIComponent(name)}/` },
      { '@type': 'ListItem', position: 3, name: `${leagueName} TV in ${countryName}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LeaguePageClient
        leagueName={leagueName}
        upcomingDays={upcomingDays}
        totalMatches={totalMatches}
        countryName={countryName}
      />
      <Faq
        title={`${leagueName} in ${countryName} — FAQs`}
        items={[
          {
            q: `What channel is ${leagueName} on in ${countryName}?`,
            a: totalMatches > 0
              ? `Click any fixture above to see the full list of ${countryName} broadcasters carrying that ${leagueName} match. Every listed channel holds official rights for ${countryName}.`
              : `There are no ${leagueName} matches with confirmed ${countryName} TV coverage in the next 30 days. Schedules update daily — check back soon.`,
          },
          {
            q: `How can I watch ${leagueName} live in ${countryName}?`,
            a: `Use the ${countryName} broadcaster listed next to each fixture — most offer an official app or streaming service alongside their TV broadcast. CricFoot is a TV guide only and does not stream or broadcast any content.`,
          },
          {
            q: `Are ${leagueName} kick-off times shown in ${countryName} local time?`,
            a: `Yes — every kick-off time on CricFoot is automatically converted to your device's local timezone, so you always see the correct local time for ${countryName}.`,
          },
        ]}
      />
    </>
  );
}
