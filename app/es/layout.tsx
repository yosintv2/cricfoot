import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    languages: {
      'en': 'https://www.cricfoot.net/',
      'es': 'https://www.cricfoot.net/es/',
      'x-default': 'https://www.cricfoot.net/',
    },
  },
};

export default function EsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
