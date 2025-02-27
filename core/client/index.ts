import { createClient } from '@bigcommerce/catalyst-client';
import { headers, cookies } from 'next/headers';
import { getLocale as getServerLocale } from 'next-intl/server';

import { getChannelIdFromLocale } from '../channels.config';
import { getChannelIdFromRegion } from '../regions.config';

import { backendUserAgent } from '../userAgent';

const getLocale = async () => {
  try {
    const locale = await getServerLocale();

    return locale;
  } catch {
    /**
     * Next-intl `getLocale` only works on the server, and when middleware has run.
     *
     * Instances when `getLocale` will not work:
     * - Requests in middlewares
     * - Requests in `generateStaticParams`
     * - Request in api routes
     * - Requests in static sites without `setRequestLocale`
     */
  }
};

export const client = createClient({
  storefrontToken: process.env.BIGCOMMERCE_STOREFRONT_TOKEN ?? '',
  xAuthToken: process.env.BIGCOMMERCE_ACCESS_TOKEN ?? '',
  storeHash: process.env.BIGCOMMERCE_STORE_HASH ?? '',
  channelId: process.env.BIGCOMMERCE_CHANNEL_ID,
  backendUserAgentExtensions: backendUserAgent,
  logger:
    (process.env.NODE_ENV !== 'production' && process.env.CLIENT_LOGGER !== 'false') ||
    process.env.CLIENT_LOGGER === 'true',
  getChannelId: async (defaultChannelId: string) => {
    try {
      // First try to get channelId from region cookie
      const cookieStore = await cookies();
      const regionCookie = await cookieStore.get('region');
      const region = regionCookie?.value;

      if (region) {
        const channelId = getChannelIdFromRegion(region);
        if (channelId) return channelId;
      }

      // Then try to get channelId from locale
      const locale = await getLocale();
      const localeChannelId = getChannelIdFromLocale(locale);

      if (localeChannelId) {
        return localeChannelId;
      }

      // Fall back to default channelId
      return defaultChannelId;
    } catch (error) {
      console.error('Error getting channelId:', error);
      return defaultChannelId;
    }
  },
  beforeRequest: async (fetchOptions) => {
    // We can't serialize a `Headers` object within this method so we have to opt into using a plain object
    const requestHeaders: Record<string, string> = {};
    const locale = await getLocale();

    if (fetchOptions?.cache && ['no-store', 'no-cache'].includes(fetchOptions.cache)) {
      const ipAddress = (await headers()).get('X-Forwarded-For');

      if (ipAddress) {
        requestHeaders['X-Forwarded-For'] = ipAddress;
        requestHeaders['True-Client-IP'] = ipAddress;
      }
    }

    if (locale) {
      requestHeaders['Accept-Language'] = locale;
    }

    // Add the region-based channelId to the request headers
    try {
      const cookieStore = await cookies();
      const regionCookie = await cookieStore.get('region');
      const region = regionCookie?.value;

      if (region) {
        const channelId = getChannelIdFromRegion(region);
        if (channelId) {
          requestHeaders['x-bc-channel-id'] = channelId;
        }
      }
    } catch (error) {
      console.error('Error setting x-bc-channel-id header:', error);
    }

    return {
      headers: requestHeaders,
    };
  },
});
