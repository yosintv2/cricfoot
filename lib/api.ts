import { Match } from '@/types';
import { toYMD } from '@/lib/utils';

const API_BASE = 'https://cf.singhs.com.np/date';

export async function fetchMatches(dateOrYMD: Date | string): Promise<Match[]> {
  const ymd = typeof dateOrYMD === 'string' ? dateOrYMD : toYMD(dateOrYMD);
  try {
    const res = await fetch(`${API_BASE}/${ymd.slice(0, 4)}/${ymd}.json`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
