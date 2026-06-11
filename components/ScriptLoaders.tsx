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
      {/* Google Ads Manager */}
      <Script src="/google-ads.js" strategy="lazyOnload" />
    </>
  );
}
