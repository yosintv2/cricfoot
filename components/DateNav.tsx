'use client';

import { useRouter, usePathname } from 'next/navigation';
import { dateFromYMD, fmtDate, isoFromYMD, prevDay, nextDay, todayYMD } from '@/lib/utils';
import { toYMD } from '@/lib/utils';

interface Props {
  currentYMD: string;
  variant?: 'hero' | 'compact';
}

export default function DateNav({ currentYMD, variant = 'compact' }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const today = todayYMD();

  function go(ymd: string) {
    if (ymd === today) {
      router.push(pathname);
    } else {
      router.push(`${pathname}?date=${ymd}`);
    }
  }

  const d = dateFromYMD(currentYMD);
  const displayDate = fmtDate(d);
  const isoValue = isoFromYMD(currentYMD);

  if (variant === 'hero') {
    return (
      <div className="hero-controls">
        <button className="btn-day" onClick={() => go(prevDay(currentYMD))} aria-label="Previous day">
          ‹
        </button>
        <div className="date-display-hero" aria-live="polite">{displayDate}</div>
        <button className="btn-day" onClick={() => go(nextDay(currentYMD))} aria-label="Next day">
          ›
        </button>
        <input
          type="date"
          className="date-input"
          value={isoValue}
          onChange={e => {
            const [y, mo, d] = e.target.value.split('-').map(Number);
            const nd = new Date(y, mo - 1, d);
            go(toYMD(nd));
          }}
          aria-label="Pick a date"
        />
        <button className="btn-today" onClick={() => go(today)}>Today</button>
      </div>
    );
  }

  return (
    <div className="date-nav-row">
      <button className="btn-day-dark" onClick={() => go(prevDay(currentYMD))} aria-label="Previous day">‹</button>
      <div className="date-display-dark" aria-live="polite">{displayDate}</div>
      <button className="btn-day-dark" onClick={() => go(nextDay(currentYMD))} aria-label="Next day">›</button>
      <button className="btn-today-accent" onClick={() => go(today)}>Today</button>
    </div>
  );
}
