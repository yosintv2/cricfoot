import { Match } from '@/types';
import { dateFromYMD, fmtDate } from '@/lib/utils';
import MatchCard from './MatchCard';
import DayLabel from './DayLabel';

interface DayData { ymd: string; matches: Match[] }

interface Props {
  days: DayData[];
  /** Used in aria-labels and the empty state, e.g. "Arsenal" or "Football in the United States". */
  subject: string;
  showLeague?: boolean;
  emptySub?: string;
  idPrefix?: string;
}

// Server-rendered day-by-day fixture list shared by the team, country,
// date-keyword and World Cup pages (same markup as LeaguePageClient's list).
export default function DayFixtureList({ days, subject, showLeague = true, emptySub, idPrefix = 'fday' }: Props) {
  if (days.length === 0) {
    return (
      <div className="state-center">
        <div className="state-icon">📅</div>
        <div className="state-title">No {subject} matches in the current 14-day window</div>
        <div className="state-sub">{emptySub ?? 'Check back soon — schedules update daily.'}</div>
      </div>
    );
  }

  return (
    <>
      {days.map(({ ymd, matches }) => {
        const full = fmtDate(dateFromYMD(ymd));
        return (
          <section key={ymd} id={`${idPrefix}-${ymd}`} className="day-section" aria-label={`${subject} matches on ${full}`}>
            <div className="day-section-header">
              <div>
                <div className="day-section-label"><DayLabel ymd={ymd} /></div>
                <div className="day-section-date">{full}</div>
              </div>
              <span className="day-section-count">{matches.length} match{matches.length !== 1 ? 'es' : ''}</span>
            </div>
            <div style={{ border: '1px solid var(--border-lt)', borderTop: 'none', borderRadius: '0 0 6px 6px', overflow: 'hidden', marginBottom: 4 }}>
              {matches.map((m, i) => <MatchCard key={i} match={m} ymd={ymd} showLeague={showLeague} />)}
            </div>
          </section>
        );
      })}
    </>
  );
}
