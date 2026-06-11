'use client';

import Script from 'next/script';

export default function ScriptLoaders() {
  return (
    <>
      {/* SuperCounters online visitor tracker */}
      <Script
        src="//widget.supercounters.com/ssl/online_i.js"
        strategy="afterInteractive"
        onReady={() => {
          if (typeof (window as any).sc_online_i === 'function') {
            (window as any).sc_online_i(1735248, 'ffffff', 'ffffff');
          }
        }}
      />
      {/* Google Ads Manager */}
      <Script src="/google-ads.js" strategy="lazyOnload" />
    </>
  );
}
