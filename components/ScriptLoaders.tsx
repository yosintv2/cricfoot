'use client';

import Script from 'next/script';

export default function ScriptLoaders() {
  return (
    <>
      {/* Google Analytics 4 — consent mode default: denied until user accepts */}
      <Script id="ga4-consent-default" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied'});`}
      </Script>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-S4LDBJ7YNB"
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`gtag('js',new Date());gtag('config','G-S4LDBJ7YNB');if(localStorage.getItem('cookie-consent')==='accepted'){gtag('consent','update',{analytics_storage:'granted',ad_storage:'granted'});}`}
      </Script>
      {/* Google AdSense — Auto ads handles all placements */}
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5525538810839147"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      {/* Whos.amung.us analytics */}
      <Script id="_waumbx" strategy="afterInteractive">
        {`var _wau = _wau || []; _wau.push(["dynamic", "creaxi049d", "mbx", "c4302bffffff", "small"]);`}
      </Script>
      <Script async src="https://waust.at/d.js" strategy="afterInteractive" />
    </>
  );
}
