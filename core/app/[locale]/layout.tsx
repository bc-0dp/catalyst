import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider, useMessages } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { PropsWithChildren } from 'react';
import Script from 'next/script';
import Head from 'next/head';

import '../globals.css';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

import { Notifications } from '../notifications';
import { Providers } from '../providers';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const RootLayoutMetadataQuery = graphql(`
  query RootLayoutMetadataQuery {
    site {
      settings {
        storeName
        seo {
          pageTitle
          metaDescription
          metaKeywords
        }
      }
    }
  }
`);

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await client.fetch({
    document: RootLayoutMetadataQuery,
    fetchOptions: { next: { revalidate } },
  });

  const storeName = data.site.settings?.storeName ?? '';

  const { pageTitle, metaDescription, metaKeywords } = data.site.settings?.seo || {};

  return {
    title: {
      template: `%s - ${storeName}`,
      default: pageTitle || storeName,
    },
    icons: {
      icon: '/favicon.ico', // app/favicon.ico/route.ts
    },
    description: metaDescription,
    keywords: metaKeywords ? metaKeywords.split(',') : null,
    other: {
      platform: 'bigcommerce.catalyst',
      build_sha: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? '',
    },
  };
}

const VercelComponents = () => {
  if (process.env.VERCEL !== '1') {
    return null;
  }

  return (
    <>
      {process.env.DISABLE_VERCEL_ANALYTICS !== 'true' && <Analytics />}
      {process.env.DISABLE_VERCEL_SPEED_INSIGHTS !== 'true' && <SpeedInsights />}
    </>
  );
};

interface Props extends PropsWithChildren {
  params: { locale: string };
}

export default function RootLayout({ children, params: { locale } }: Props) {
  // need to call this method everywhere where static rendering is enabled
  // https://next-intl-docs.vercel.app/docs/getting-started/app-router#add-setRequestLocale-to-all-layouts-and-pages
  setRequestLocale(locale);

  const messages = useMessages();

  return (
    <html className={`${inter.variable} font-sans`} lang={locale}>
      <body className="flex h-screen min-w-[375px] flex-col">
        <Head>
          <link rel="preload" href="http://localhost:3001/src/headless.ts" as="script" />
          <script type="module">
            {`
          import RefreshRuntime from 'http://localhost:3001/@react-refresh'
          RefreshRuntime.injectIntoGlobalHook(window)
          window.$RefreshReg$ = () => {}
          window.$RefreshSig$ = () => (type) => type
          window.__vite_plugin_react_preamble_installed__ = true
          `}
          </script>
          <script type="module" src="http://localhost:3001/@vite/client"></script>
        </Head>
        <Notifications />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
        <VercelComponents />

        <a href="/#/login">Bob</a>

        <Script id="b3-settings">
          {`window.B3 = {
            setting: {
              store_hash: 'n3u8oc5vgz', 
              channel_id: 1680735,
              platform: 'catalyst',
            },
          'dom.registerElement':
          '[href^="/login"]',            
          };`}
        </Script>
        <Script
          data-channelid="1680735"
          data-storehash="n3u8oc5vgz"
          src="http://localhost:3001/src/headless.ts"
          type="module"
        />
      </body>
    </html>
  );
}

export const fetchCache = 'default-cache';
