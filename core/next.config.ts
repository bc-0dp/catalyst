import createWithMakeswift from '@makeswift/runtime/next/plugin';
import bundleAnalyzer from '@next/bundle-analyzer';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

import { fetchRegionLocales, writeBuildConfig } from './build-config/writer';
import { cspHeader } from './lib/content-security-policy';

const withMakeswift = createWithMakeswift({ previewMode: false });
const withNextIntl = createNextIntlPlugin();

export default async (): Promise<NextConfig> => {
  // First, fetch and write region locales to build config
  await buildRegionLocales();

  let nextConfig: NextConfig = {
    reactStrictMode: true,
    experimental: {
      optimizePackageImports: ['@icons-pack/react-simple-icons'],
      ppr: 'incremental',
    },
    typescript: {
      ignoreBuildErrors: !!process.env.CI,
    },
    eslint: {
      ignoreDuringBuilds: !!process.env.CI,
      dirs: ['app', 'client', 'components', 'lib', 'middlewares'],
    },
    // default URL generation in BigCommerce uses trailing slash
    trailingSlash: process.env.TRAILING_SLASH !== 'false',
    // eslint-disable-next-line @typescript-eslint/require-await
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'Content-Security-Policy',
              value: cspHeader.replace(/\n/g, ''),
            },
            {
              key: 'Link',
              value: `<https://${process.env.NEXT_PUBLIC_BIGCOMMERCE_CDN_HOSTNAME ?? 'cdn11.bigcommerce.com'}>; rel=preconnect`,
            },
          ],
        },
      ];
    },
  };

  // Apply withNextIntl to the config
  nextConfig = withNextIntl(nextConfig);

  // Apply withMakeswift to the config
  nextConfig = withMakeswift(nextConfig);

  if (process.env.ANALYZE === 'true') {
    const withBundleAnalyzer = bundleAnalyzer();
    nextConfig = withBundleAnalyzer(nextConfig);
  }

  return nextConfig;
};

/**
 * Builds the region-specific locale configuration
 * This runs during Next.js build process to create a build-config.json file
 * with locales for each configured region
 */
async function buildRegionLocales() {
  console.log('Fetching locales for all regions...');

  try {
    // Fetch locales for all regions
    const regionLocales = await fetchRegionLocales();

    // Write only the region-specific locales, no backwards compatibility
    await writeBuildConfig({
      regionLocales,
      // No more locales array
    });

    console.log('Region locales successfully written to build-config.json');
  } catch (error) {
    console.error('Failed to build region locales:', error);
    // Fallback to empty configuration
    await writeBuildConfig({
      regionLocales: {},
    });
  }
}
