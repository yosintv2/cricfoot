'use client';

import Script from 'next/script';

export default function ScriptLoaders() {
  return (
    <>
      {/* Google AdSense */}
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5525538810839147"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
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
