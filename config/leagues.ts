/**
 * ─── TOP LEAGUE BAR — EDIT ME ────────────────────────────────────────────
 *
 * These are the quick-links shown in the bar under the main navigation.
 * Add, remove or reorder entries freely.
 *
 * Each entry:
 *   label — text shown in the bar; also becomes the URL,
 *           e.g. "World Cup" → /league/world-cup/
 *   flag  — emoji shown before the label
 *   id    — "league_id" from the API (preferred). The page aggregates ALL
 *           matches with that id, e.g. id 16 covers "FIFA World Cup,
 *           Group A", "Group B", … in one page.
 *   name  — alternative to id: exact league name from the API,
 *           matches by name only.
 *
 * Use id when you know it; fall back to name otherwise.
 * Entries with an id are also pinned to the top of the home page
 * match list, in the order they appear here.
 */

export interface QuickLeague {
  label: string;
  flag: string;
  id?: number;
  name?: string;
  /** Override the default /league/<label-slug>/ destination (e.g. a hub page). */
  href?: string;
}

// API league_id shared by every "FIFA World Cup, Group X" entry.
export const WORLD_CUP_ID = 16;

export const QUICK_LEAGUES: QuickLeague[] = [
  { label: 'World Cup',   flag: '🏆', id: WORLD_CUP_ID, href: '/world-cup-2026' },
  { label: 'UEFA Champions League.', flag: '⭐', id: 7 },
  { label: 'EPL',         flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', id: 17 },
  { label: 'La Liga',     flag: '🇪🇸', id: 8 },
  { label: 'Serie A',     flag: '🇮🇹', id: 23 },
  { label: 'Bundesliga',  flag: '🇩🇪', id: 35 },
  { label: 'Ligue 1',     flag: '🇫🇷', id: 34 },
  { label: 'Friendly',    flag: '🤝', id: 851 },
];
