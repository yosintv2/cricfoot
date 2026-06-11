import { Match } from '@/types';
import { dateFromYMD, fmtDate, groupByLeague } from '@/lib/utils';
import LeagueSection from './LeagueSection';
import DayLabel from './DayLabel';

interface DayData { ymd: string; matches: Match[] }

// Server-rendered full-day schedule grouped by league (home-page style),
// shared by the date-keyword pages (/tomorrow, /tonight, /this-weekend).
export default function DaySchedule({ days, subject }: { days: DayData[]; subject: string }) {
  const nonEmpty = days.filter(d => d.matches.length > 0);

  if (nonEmpty.length === 0) {
    return (
      <div className="state-center">
        <div className="state-icon">📅</div>
        <div className="state-title">No {subject} matches published yet</div>
        <div className="state-sub">Listings update daily — check back soon.</div>
      </div>
    );
  }

  return (
    <>
      {nonEmpty.map(({ ymd, matches }) => {
        const full = fmtDate(dateFromYMD(ymd));
        return (
          <section key={ymd} className="day-section" aria-label={`Matches on ${full}`}>
            <div className="day-section-header">
              <div>
                <div className="day-section-label"><DayLabel ymd={ymd} /></div>
                <div className="day-section-date">{full}</div>
              </div>
              <span className="day-section-count">{matches.length} match{matches.length !== 1 ? 'es' : ''}</span>
            </div>
            <div style={{ marginTop: 10 }}>
              {Object.entries(groupByLeague(matches)).map(([league, ms]) => (
                <LeagueSection key={league} league={league} matches={ms} ymd={ymd} />
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
