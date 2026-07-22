import type { NextConfig } from 'next';
import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: { unoptimized: true },
};

if (process.env.NODE_ENV === 'development') {
  setupDevPlatform();
}

export default nextConfig;
