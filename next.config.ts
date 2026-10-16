import type { NextConfig } from 'next';

// GitHub Pages serves ordinary repositories from /<repository-name>/.
// GitHub Actions sets this at build time; local development uses /.
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/$/, '');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  ...(basePath ? { basePath } : {}),
};

export default nextConfig;
