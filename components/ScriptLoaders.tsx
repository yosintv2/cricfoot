'use client';

import Script from 'next/script';

export default function ScriptLoaders() {
  return (
    <>
      {/* Google Analytics 4 */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-S4LDBJ7YNB"
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-S4LDBJ7YNB');`}
      </Script>
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
