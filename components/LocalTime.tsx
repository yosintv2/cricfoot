'use client';

import { useEffect, useState } from 'react';
import { fmtKick } from '@/lib/utils';

// Static export bakes the build server's timezone into prerendered HTML.
// This re-renders the kickoff in the visitor's local timezone after mount;
// suppressHydrationWarning covers the server/client mismatch on first paint.
export default function LocalTime({ unix }: { unix?: number | null }) {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => { setTime(fmtKick(unix)); }, [unix]);
  return <span suppressHydrationWarning>{time ?? fmtKick(unix)}</span>;
}
