'use client';

import { useEffect, useState } from 'react';
import { todayYMD, toYMD, dateFromYMD, fmtDate } from '@/lib/utils';
import { useLang } from '@/contexts/LangContext';

// "Today"/"Tomorrow" depend on the visitor's current date, which static
// export can't know at build time — prerendered HTML shows the full date
// and this upgrades the label after mount.
export default function DayLabel({ ymd }: { ymd: string }) {
  const { t } = useLang();
  const full = fmtDate(dateFromYMD(ymd));
  const [label, setLabel] = useState(full);
  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    if (ymd === todayYMD()) setLabel(t?.today ?? 'Today');
    else if (ymd === toYMD(d)) setLabel(t?.tomorrow ?? 'Tomorrow');
    else setLabel(full);
  }, [ymd, full, t]);
  // fmtDate is locale-fixed, so server HTML and first client render match;
  // the effect upgrade is a real diff and always reaches the DOM.
  return <span>{label}</span>;
}
