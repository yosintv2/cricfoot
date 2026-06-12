import Link from 'next/link';
import { dateFromYMD, isoFromYMD } from '@/lib/utils';

// Home-style date tab strip (server-rendered) — each tab links to its
// /schedules/ page; the page's own date is highlighted.
export default function DateTabs({ days, activeYmd }: { days: string[]; activeYmd?: string }) {
  return (
    <div className="date-tabs-wrap" aria-label="Select day">
      <div className="date-tabs">
        {days.map((ymd, idx) => {
          const d = dateFromYMD(ymd);
          const active = ymd === activeYmd;
          return (
            <Link
              key={ymd}
              href={`/schedules/${isoFromYMD(ymd)}/`}
              prefetch={false}
              className={`date-tab${active ? ' active' : ''}${idx >= 7 ? ' date-tab-far' : ''}`}
              aria-current={active ? 'date' : undefined}
            >
              <span className="date-tab-day">{d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}</span>
              <span className="date-tab-num">{d.getDate()}</span>
              <span className="date-tab-month">{d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
