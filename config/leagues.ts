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
}

export const QUICK_LEAGUES: QuickLeague[] = [
  { label: 'World Cup',   flag: '🏆', id: 16 },
  { label: 'Champions L.', flag: '⭐', name: 'UEFA Champions League' },
  { label: 'Friendly',    flag: '🤝', name: 'International Friendly' },
  { label: 'EPL',         flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', name: 'Premier League' },
  { label: 'La Liga',     flag: '🇪🇸', name: 'La Liga' },
  { label: 'Serie A',     flag: '🇮🇹', name: 'Serie A' },
  { label: 'Bundesliga',  flag: '🇩🇪', name: 'Bundesliga' },
  { label: 'Ligue 1',     flag: '🇫🇷', name: 'Ligue 1' },
];
