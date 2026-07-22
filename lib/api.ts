import { Match } from '@/types';
import { toYMD, scheduleDays } from '@/lib/utils';

const API_BASE = 'https://cf.singhs.com.np/date';

const matchCache = new Map<string, Match[]>();

export async function fetchMatches(dateOrYMD: Date | string): Promise<Match[]> {
  const ymd = typeof dateOrYMD === 'string' ? dateOrYMD : toYMD(dateOrYMD);
  if (matchCache.has(ymd)) return matchCache.get(ymd)!;
  try {
    const res = await fetch(`${API_BASE}/${ymd.slice(0, 4)}/${ymd}.json`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) { matchCache.set(ymd, []); return []; }
    const data = await res.json();
    const matches = Array.isArray(data) ? data : [];
    matchCache.set(ymd, matches);
    return matches;
  } catch {
    matchCache.set(ymd, []);
    return [];
  }
}

// Prefetch the 30-day window once — every generateStaticParams or page that
// calls scheduleDays().map(fetchMatches) will hit the cache instead of the network.
export async function prefetchWindow(): Promise<{ ymd: string; matches: Match[] }[]> {
  const ymds = scheduleDays();
  const results = await Promise.all(ymds.map(async (ymd) => ({ ymd, matches: await fetchMatches(ymd) })));
  return results;
}
