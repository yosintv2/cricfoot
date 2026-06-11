'use client';

import { useEffect, useState } from 'react';

// Shows which timezone the kickoff times are displayed in, resolved in the
// visitor's browser (static export can't know it at build time).
export default function TzNote() {
  const [tz, setTz] = useState<string | null>(null);
  useEffect(() => {
    try { setTz(Intl.DateTimeFormat().resolvedOptions().timeZone); } catch { /* keep generic text */ }
  }, []);
  return (
    <span suppressHydrationWarning>
      Times in your timezone{tz ? ` (${tz.replace(/_/g, ' ')})` : ''}
    </span>
  );
}
