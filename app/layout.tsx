import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScriptLoaders from '@/components/ScriptLoaders';
import AdUnit from '@/components/AdUnit';
import SuperCounter from '@/components/SuperCounter';
import CookieBanner from '@/components/CookieBanner';

export const metadata: Metadata = {
  title: 'Live Football Match Today – Live Football on TV | CricFoot',
  description:
    'Live football match today: every game with kick-off times in your local timezone and the channels showing live football on TV worldwide. Free guide for the World Cup, Premier League, Champions League, La Liga and more.',
  keywords:
    'live football match today, live football on tv, football match today, live football today, football on tv today, live soccer tv, football tv channels, premier league live tv, champions league tv schedule, cricfoot',
  authors: [{ name: 'CricFoot' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.cricfoot.net'),
  openGraph: {
    type: 'website',
    siteName: 'CricFoot',
    title: 'Live Football Match Today – Live Football on TV | CricFoot',
    description:
      'Every live football match today with kick-off times and TV channel listings for all major leagues worldwide.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Live Football Match Today – Live Football on TV | CricFoot',
    description: 'Every live football match today with kick-off times and TV channels worldwide.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://www.cricfoot.net/',
    languages: {
      'en': 'https://www.cricfoot.net/',
      'es': 'https://www.cricfoot.net/es/',
      'x-default': 'https://www.cricfoot.net/',
    },
  },
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
        {/* SuperCounters online tracker — renders inside this in-body container */}
        <SuperCounter />
        <Navbar />
        <div className="container">
          {children}
          <AdUnit />
        </div>
        <Footer />
        <CookieBanner />
        <ScriptLoaders />
      </body>
    </html>
  );
}
