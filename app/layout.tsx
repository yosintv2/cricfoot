import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScriptLoaders from '@/components/ScriptLoaders';
import AdUnit from '@/components/AdUnit';

export const metadata: Metadata = {
  title: 'CricFoot – Live Football on TV Today | Live Soccer TV Guide',
  description:
    'Live football on TV today: every soccer game with kick-off times and TV channels worldwide. Free live soccer TV guide for the Premier League, UEFA Champions League, La Liga, Serie A, Bundesliga and more.',
  keywords:
    'football today, football on tv, live football on tv, football on tv today, soccer games today, live soccer tv, football tv channels, premier league live tv, champions league tv schedule, cricfoot',
  authors: [{ name: 'CricFoot' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.cricfoot.net'),
  openGraph: {
    type: 'website',
    siteName: 'CricFoot',
    title: 'CricFoot - Football Live on TV | Live TV Channels',
    description:
      'Find live football TV schedules, match fixtures and channel listings for all major leagues worldwide.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CricFoot - Football Live on TV | Live TV Channels',
    description: 'Live football TV schedules, channel listings and match fixtures for all major leagues worldwide.',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://www.cricfoot.net' },
  manifest: '/site.webmanifest',
  applicationName: 'CricFoot',
  category: 'sports',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://www.cricfoot.net/#website',
        name: 'CricFoot',
        url: 'https://www.cricfoot.net/',
        description: 'CricFoot is your ultimate TV guide for live football matches worldwide.',
        publisher: { '@id': 'https://www.cricfoot.net/#organization' },
        potentialAction: {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: 'https://www.cricfoot.net/?q={search_term_string}' },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': 'https://www.cricfoot.net/#organization',
        name: 'CricFoot',
        url: 'https://www.cricfoot.net/',
        logo: {
          '@type': 'ImageObject',
          url: 'https://www.cricfoot.net/icon.svg',
        },
        description: 'Free worldwide football TV guide: match schedules, kick-off times and broadcaster listings.',
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#1a3a6b" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {/* SuperCounters hidden tracker */}
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '1px', overflow: 'hidden', visibility: 'hidden', zIndex: 9999 }} aria-hidden="true" />
        <Navbar />
        <div className="container">
          {children}
          <AdUnit />
        </div>
        <Footer />
        <ScriptLoaders />
      </body>
    </html>
  );
}
