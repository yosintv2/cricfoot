'use client';

import { useEffect, useState } from 'react';
import { fmtKick } from '@/lib/utils';

// Static export bakes the build server's timezone into prerendered HTML.
// These re-render kickoff time/date in the visitor's local timezone after
// mount; suppressHydrationWarning covers the first-paint mismatch.
export default function LocalTime({ unix }: { unix?: number | null }) {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => { setTime(fmtKick(unix)); }, [unix]);
  return <span suppressHydrationWarning>{time ?? fmtKick(unix)}</span>;
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
  return <span suppressHydrationWarning>{date ?? fallback ?? ''}</span>;
}
