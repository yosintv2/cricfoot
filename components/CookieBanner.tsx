'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLang } from '@/contexts/LangContext';

export default function CookieBanner() {
  const { t } = useLang();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('cookie-consent')) setShow(true);
  }, []);

  const updateConsent = (granted: boolean) => {
    const status = granted ? 'accepted' : 'declined';
    localStorage.setItem('cookie-consent', status);
    setShow(false);
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      (window as any).gtag('consent', 'update', {
        analytics_storage: granted ? 'granted' : 'denied',
        ad_storage: granted ? 'granted' : 'denied',
      });
    }
  };

  if (!show) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-label="Cookie consent">
      <p className="cookie-banner-text">
        {t?.cookieText ?? 'We use cookies for analytics and personalised ads.'}{' '}
        <Link href="/privacy/" className="cookie-banner-link">Privacy Policy</Link>
      </p>
      <div className="cookie-banner-actions">
        <button className="cookie-btn-accept" onClick={() => updateConsent(true)}>
          {t?.cookieAccept ?? 'Accept All'}
        </button>
        <button className="cookie-btn-decline" onClick={() => updateConsent(false)}>
          {t?.cookieDecline ?? 'Decline'}
        </button>
      </div>
    </div>
  );
}
