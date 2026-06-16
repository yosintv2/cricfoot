'use client';

import { useEffect, useState } from 'react';
import { fmtKick } from '@/lib/utils';
import { useLang } from '@/contexts/LangContext';

// Deterministic GMT rendering (fixed locale + timezone) so server HTML and
// the client's first render are identical — a clean hydration. The effect
// then swaps in the visitor's local time. Never rely on
// suppressHydrationWarning here: React keeps mismatched server text in the
// DOM, and if the post-effect string equals the first client render, the
// re-render is a no-op diff and the stale UTC time stays visible.
function utcKick(unix?: number | null): string {
  if (!unix) return '—:—';
  return new Date(unix * 1000).toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit', timeZone: 'UTC',
  });
}

export default function LocalTime({ unix }: { unix?: number | null }) {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => { setTime(fmtKick(unix)); }, [unix]);
  return <span>{time ?? utcKick(unix)}</span>;
}

export function LocalDate({ unix, fallback }: { unix?: number | null; fallback?: string }) {
  const [date, setDate] = useState<string | null>(null);
  useEffect(() => {
    if (unix) {
      setDate(new Date(unix * 1000).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      }));
    }
  }, [unix]);
  return <span>{date ?? fallback ?? ''}</span>;
}

// LIVE while the match is underway (kickoff → +2h), FT once it's over.
// Computed client-side only — prerendered HTML can't know "now".
export function MatchStatus({ unix }: { unix?: number | null }) {
  const { t } = useLang();
  const [status, setStatus] = useState<'live' | 'over' | null>(null);
  useEffect(() => {
    if (!unix) return;
    const FULL_TIME = 2 * 3600;
    const update = () => {
      const now = Date.now() / 1000;
      if (now >= unix + FULL_TIME) setStatus('over');
      else if (now >= unix) setStatus('live');
      else setStatus(null);
    };
    update();
    const timer = setInterval(update, 60_000);
    return () => clearInterval(timer);
  }, [unix]);
  if (!status) return null;
  return (
    <span className={`match-status ${status}`}>
      {status === 'live' ? (t?.live ?? 'LIVE') : (t?.ft ?? 'FT')}
    </span>
  );
}
