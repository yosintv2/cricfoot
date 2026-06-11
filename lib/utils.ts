import { Match } from '@/types';

export function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function toYMD(d: Date): string {
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}

export function toISO(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fmtKick(unix: number | null | undefined): string {
  if (!unix) return '—:—';
  return new Date(unix * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function dateFromYMD(ymd: string): Date {
  const y = parseInt(ymd.slice(0, 4), 10);
  const m = parseInt(ymd.slice(4, 6), 10) - 1;
  const d = parseInt(ymd.slice(6, 8), 10);
  return new Date(y, m, d);
}

export function todayYMD(): string {
  return toYMD(new Date());
}

// Site-wide schedule window: yesterday + today + next 12 days (14 total).
// Days the API hasn't published yet just return [] from fetchMatches.
export function scheduleDays(): string[] {
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i - 1);
    return toYMD(d);
  });
}

export function prevDay(ymd: string): string {
  const d = dateFromYMD(ymd);
  d.setDate(d.getDate() - 1);
  return toYMD(d);
}

export function nextDay(ymd: string): string {
  const d = dateFromYMD(ymd);
  d.setDate(d.getDate() + 1);
  return toYMD(d);
}

export function isoFromYMD(ymd: string): string {
  return `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`;
}

const POPULAR_KEYS = [
  'ESPN', 'BBC', 'Sky Sports', 'beIN', 'TNT', 'DAZN', 'Paramount',
  'Fox Soccer', 'CBS Sports', 'Sport TV', 'Canal+', 'Eurosport', 'ITV',
  'BT Sport', 'Setanta', 'RMC Sport', 'TUDN', 'Univision', 'SuperSport', 'Arena Sport',
];

export function isPopular(ch: string): boolean {
  const lower = ch.toLowerCase();
  return POPULAR_KEYS.some(k => lower.includes(k.toLowerCase()));
}

export function buildChannelMap(matches: Match[]): Map<string, { matches: Match[]; countries: Set<string> }> {
  const map = new Map<string, { matches: Match[]; countries: Set<string> }>();
  matches.forEach(m => {
    (m.tv_channels ?? []).forEach(tv => {
      (tv.channels ?? []).forEach(ch => {
        if (!map.has(ch)) map.set(ch, { matches: [], countries: new Set() });
        const entry = map.get(ch)!;
        entry.matches.push(m);
        entry.countries.add(tv.country ?? '');
      });
    });
  });
  return map;
}

export function groupByLeague(matches: Match[]): Record<string, Match[]> {
  const byLeague: Record<string, Match[]> = {};
  matches.forEach(m => {
    const k = m.league || 'Other';
    if (!byLeague[k]) byLeague[k] = [];
    byLeague[k].push(m);
  });
  return Object.fromEntries(
    Object.entries(byLeague).sort(([a], [b]) =>
      a === 'Other' ? 1 : b === 'Other' ? -1 : a.localeCompare(b)
    )
  );
}

// URL-safe slug: lowercase, accents transliterated (Málaga → malaga), spaces →
// dashes, anything else stripped — so static-export folder names always match
// the requested URL with no percent-encoding.
export function toSlug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Display-only fallback when the original name can't be resolved from the API
// (slugs are lossy — always prefer slug-matching against real data).
export function fromSlug(slug: string): string {
  return decodeURIComponent(slug).replace(/-/g, ' ');
}

export function matchSlug(ymd: string, fixture: string): string {
  return `${ymd}-${toSlug(fixture)}`;
}

export function filterMatches(matches: Match[], q: string, country: string): Match[] {
  if (!q && !country) return matches;
  return matches.filter(m => {
    if (q) {
      const chs = (m.tv_channels ?? []).flatMap(tv => tv.channels ?? []).join(' ');
      const txt = `${m.fixture ?? ''} ${m.league ?? ''} ${m.venue ?? ''} ${chs}`.toLowerCase();
      if (!txt.includes(q.toLowerCase().trim())) return false;
    }
    if (country) {
      if (!(m.tv_channels ?? []).some(tv => tv.country === country)) return false;
    }
    return true;
  });
}

/* ── Country flag emoji ────────────────────────────────────── */

const COUNTRY_ISO: Record<string, string> = {
  'Afghanistan': 'AF', 'Albania': 'AL', 'Algeria': 'DZ', 'American Samoa': 'AS',
  'Andorra': 'AD', 'Angola': 'AO', 'Anguilla': 'AI', 'Antigua and Barbuda': 'AG',
  'Argentina': 'AR', 'Armenia': 'AM', 'Aruba': 'AW', 'Australia': 'AU',
  'Austria': 'AT', 'Azerbaijan': 'AZ', 'Bahamas': 'BS', 'Bahrain': 'BH',
  'Bangladesh': 'BD', 'Barbados': 'BB', 'Belarus': 'BY', 'Belgium': 'BE',
  'Belize': 'BZ', 'Benin': 'BJ', 'Bermuda': 'BM', 'Bhutan': 'BT',
  'Bolivia': 'BO', 'Bosnia and Herzegovina': 'BA', 'Botswana': 'BW', 'Brazil': 'BR',
  'Brunei': 'BN', 'Bulgaria': 'BG', 'Burkina Faso': 'BF', 'Cambodia': 'KH',
  'Cameroon': 'CM', 'Canada': 'CA', 'Cape Verde': 'CV', 'Cayman Islands': 'KY',
  'Chile': 'CL', 'China': 'CN', 'Colombia': 'CO', 'Congo': 'CG',
  'Costa Rica': 'CR', 'Croatia': 'HR', 'Cuba': 'CU', 'Cyprus': 'CY',
  'Czech Republic': 'CZ', 'Czechia': 'CZ', 'Denmark': 'DK', 'DRC': 'CD',
  'Dominican Republic': 'DO', 'Ecuador': 'EC', 'Egypt': 'EG', 'El Salvador': 'SV',
  'Eritrea': 'ER', 'Estonia': 'EE', 'Eswatini': 'SZ', 'Ethiopia': 'ET',
  'Fiji': 'FJ', 'Finland': 'FI', 'France': 'FR', 'Gambia': 'GM',
  'Georgia': 'GE', 'Germany': 'DE', 'Ghana': 'GH', 'Greece': 'GR',
  'Guadeloupe': 'GP', 'Guam': 'GU', 'Guatemala': 'GT', 'Guyana': 'GY',
  'Haiti': 'HT', 'Honduras': 'HN', 'Hong Kong': 'HK', 'Hungary': 'HU',
  'Iceland': 'IS', 'India': 'IN', 'Indonesia': 'ID', 'Iran': 'IR',
  'Iraq': 'IQ', 'Ireland': 'IE', 'Israel': 'IL', 'Italy': 'IT',
  'Ivory Coast': 'CI', 'Jamaica': 'JM', 'Japan': 'JP', 'Jordan': 'JO',
  'Kazakhstan': 'KZ', 'Kenya': 'KE', 'Kuwait': 'KW', 'Latvia': 'LV',
  'Lebanon': 'LB', 'Liberia': 'LR', 'Libya': 'LY', 'Lithuania': 'LT',
  'Luxembourg': 'LU', 'Macau': 'MO', 'Malawi': 'MW', 'Malaysia': 'MY',
  'Maldives': 'MV', 'Mali': 'ML', 'Malta': 'MT', 'Martinique': 'MQ',
  'Mauritania': 'MR', 'Mauritius': 'MU', 'Mexico': 'MX', 'Moldova': 'MD',
  'Mongolia': 'MN', 'Montenegro': 'ME', 'Morocco': 'MA', 'Mozambique': 'MZ',
  'Myanmar': 'MM', 'Namibia': 'NA', 'Nepal': 'NP', 'Netherlands': 'NL',
  'New Zealand': 'NZ', 'Nicaragua': 'NI', 'Niger': 'NE', 'Nigeria': 'NG',
  'North Korea': 'KP', 'North Macedonia': 'MK', 'Norway': 'NO', 'Oman': 'OM',
  'Pakistan': 'PK', 'Panama': 'PA', 'Papua New Guinea': 'PG', 'Paraguay': 'PY',
  'Peru': 'PE', 'Philippines': 'PH', 'Poland': 'PL', 'Portugal': 'PT',
  'Puerto Rico': 'PR', 'Qatar': 'QA', 'Romania': 'RO', 'Russia': 'RU',
  'Rwanda': 'RW', 'Saudi Arabia': 'SA', 'Senegal': 'SN', 'Serbia': 'RS',
  'Seychelles': 'SC', 'Sierra Leone': 'SL', 'Singapore': 'SG', 'Slovakia': 'SK',
  'Slovenia': 'SI', 'Somalia': 'SO', 'South Africa': 'ZA', 'South Korea': 'KR',
  'South Sudan': 'SS', 'Spain': 'ES', 'Sri Lanka': 'LK', 'Sudan': 'SD',
  'Suriname': 'SR', 'Sweden': 'SE', 'Switzerland': 'CH', 'Syria': 'SY',
  'Taiwan': 'TW', 'Tanzania': 'TZ', 'Thailand': 'TH', 'Timor-Leste': 'TL',
  'Togo': 'TG', 'Tonga': 'TO', 'Trinidad and Tobago': 'TT', 'Tunisia': 'TN',
  'Turkey': 'TR', 'Uganda': 'UG', 'Ukraine': 'UA', 'United Arab Emirates': 'AE',
  'United Kingdom': 'GB', 'United States': 'US', 'Uruguay': 'UY', 'Uzbekistan': 'UZ',
  'Vanuatu': 'VU', 'Venezuela': 'VE', 'Vietnam': 'VN', 'Yemen': 'YE',
  'Zambia': 'ZM', 'Zimbabwe': 'ZW', 'Kosovo': 'XK', 'International': '',
};

function isoToFlag(code: string): string {
  return code.toUpperCase().split('').map(c =>
    String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)
  ).join('');
}

export function countryFlag(country: string): string {
  const iso = COUNTRY_ISO[country];
  if (!iso) return '🌍';
  return isoToFlag(iso);
}

/* ── League flag / emoji ───────────────────────────────────── */

export function getLeagueFlag(league: string): string {
  const l = league.toLowerCase();
  if (l.includes('premier league') && !l.includes('russian') && !l.includes('saudi') && !l.includes('thai')) return '🏴󠁧󠁢󠁥󠁮󠁧󠁿';
  if (l.includes('la liga')) return '🇪🇸';
  if ((l.includes('serie a') || l.includes('serie b')) && !l.includes('brasil') && !l.includes('brazil') && !l.includes('brazil')) {
    if (l.includes('brasil') || l.includes('brazil')) return '🇧🇷';
    return '🇮🇹';
  }
  if (l.includes('bundesliga')) return '🇩🇪';
  if (l.includes('ligue 1') || l.includes('ligue 2')) return '🇫🇷';
  if (l.includes('champions league') || l.includes('ucl')) return '⭐';
  if (l.includes('europa league') || l.includes('conference league')) return '🏅';
  if (l.includes('world cup') || (l.includes('fifa') && l.includes('cup'))) return '🏆';
  if (l.includes('fa cup') || l.includes('carabao') || l.includes('efl cup')) return '🏆';
  if (l.includes('mls')) return '🇺🇸';
  if (l.includes('eredivisie')) return '🇳🇱';
  if (l.includes('primeira liga') || l.includes('portuguese')) return '🇵🇹';
  if (l.includes('turkish') || l.includes('süper lig') || l.includes('super lig')) return '🇹🇷';
  if (l.includes('scottish')) return '🏴󠁧󠁢󠁳󠁣󠁴󠁿';
  if (l.includes('liga mx')) return '🇲🇽';
  if (l.includes('brasileiro') || l.includes('brasileirao') || (l.includes('brazil') && l.includes('série'))) return '🇧🇷';
  if (l.includes('argentine') || l.includes('argentina') || l.includes('primera división')) return '🇦🇷';
  if (l.includes('j1') || l.includes('j-league') || l.includes('j league')) return '🇯🇵';
  if (l.includes('k league') || l.includes('k1 league')) return '🇰🇷';
  if (l.includes('chinese') || l.includes('csl') || l.includes('super league') && l.includes('china')) return '🇨🇳';
  if (l.includes('russian') || l.includes('premier-liga') && l.includes('russia')) return '🇷🇺';
  if (l.includes('belgian') || l.includes('jupiler') || l.includes('pro league')) return '🇧🇪';
  if (l.includes('saudi') || l.includes('roshn') || l.includes('pro league') && l.includes('saudi')) return '🇸🇦';
  if (l.includes('afcon') || l.includes('africa cup')) return '🌍';
  if (l.includes('copa america') || l.includes('conmebol')) return '🌎';
  if (l.includes('asian') || l.includes('afc')) return '🌏';
  if (l.includes('nations league')) return '🌍';
  if (l.includes('friendly') || l.includes('international')) return '🤝';
  if (l.includes('gambia') || l.includes('gff')) return '🇬🇲';
  if (l.includes('lebanon')) return '🇱🇧';
  if (l.includes('australia') || l.includes('npl') || l.includes('a-league')) return '🇦🇺';
  if (l.includes('belarus')) return '🇧🇾';
  if (l.includes('greek') || l.includes('super league') && l.includes('greece')) return '🇬🇷';
  if (l.includes('dutch')) return '🇳🇱';
  if (l.includes('swiss') || l.includes('super league') && l.includes('switz')) return '🇨🇭';
  if (l.includes('austria') || l.includes('bundesliga') && l.includes('austria')) return '🇦🇹';
  if (l.includes('danish') || l.includes('superliga') && l.includes('denmark')) return '🇩🇰';
  if (l.includes('norwegian') || l.includes('eliteserien')) return '🇳🇴';
  if (l.includes('swedish') || l.includes('allsvenskan')) return '🇸🇪';
  if (l.includes('polish') || l.includes('ekstraklasa')) return '🇵🇱';
  return '⚽';
}
