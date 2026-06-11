'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const AD_CLIENT = 'ca-pub-5525538810839147';
const AD_SLOT = '4345862479';

// Responsive AdSense unit shown on every page. Keyed by pathname so
// client-side navigation gets a fresh <ins> and a fresh push().
export default function AdUnit() {
  const pathname = usePathname();
  const pushed = useRef<string | null>(null);

  useEffect(() => {
    if (pushed.current === pathname) return;
    pushed.current = pathname;
    try {
      ((window as unknown as { adsbygoogle: unknown[] }).adsbygoogle =
        (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle || []).push({});
    } catch { /* blocked or script not loaded yet */ }
  }, [pathname]);

  return (
    <div style={{ margin: '20px 0', textAlign: 'center', minHeight: 50 }} aria-hidden="true">
      <ins
        key={pathname}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={AD_SLOT}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
