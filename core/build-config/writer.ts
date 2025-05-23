import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { createClient } from '@bigcommerce/catalyst-client';
import { graphql } from '../client/graphql';
import { regions } from '../regions.config';

import { buildConfigSchema } from './schema';

const destinationPath = dirname(fileURLToPath(import.meta.url));
const CONFIG_FILE = join(destinationPath, 'build-config.json');

// Define the locale query
const LocaleQuery = graphql(`
  query LocaleQuery {
    site {
      settings {
        locales {
          code
          isDefault
        }
      }
    }
  }
`);

// This function fetches locales for all configured regions
export async function fetchRegionLocales() {
  const regionLocales = {};

  // Query locales for each region using its channel ID
  for (const region of regions) {
    console.log(`Fetching locales for region ${region.id} (channel ${region.channelId})`);

    try {
      // Create a region-specific client without relying on Next.js request context
      const regionClient = createClient({
        storefrontToken: process.env.BIGCOMMERCE_STOREFRONT_TOKEN ?? '',
        xAuthToken: process.env.BIGCOMMERCE_ACCESS_TOKEN ?? '',
        storeHash: process.env.BIGCOMMERCE_STORE_HASH ?? '',
        channelId: region.channelId,
        // Skip any functions that might use headers() or other request-specific APIs
        getChannelId: () => Promise.resolve(region.channelId),
        // Skip any before/after request hooks that might use request context
        beforeRequest: () => Promise.resolve({}),
      });

      // Use the region-specific client
      const { data } = await regionClient.fetch({
        document: LocaleQuery,
        fetchOptions: { cache: 'no-store' },
      });

      const locales = data?.site?.settings?.locales || [];
      const defaultLocale =
        locales.find((l) => l.isDefault)?.code ||
        (locales.length > 0 ? locales[0].code : undefined);

      // Store the region's locales
      regionLocales[region.id] = {
        locales,
        defaultLocale,
      };

      console.log(`Found ${locales.length} locales for region ${region.id}`);
    } catch (error) {
      console.error(`Error fetching locales for region ${region.id}:`, error);
    }
  }

  return regionLocales;
}

// writeBuildConfig function remains unchanged
export async function writeBuildConfig(data) {
  try {
    // Validate the data
    buildConfigSchema.parse(data);

    // Write the data to the config file
    await writeFile(CONFIG_FILE, JSON.stringify(data, null, 2), 'utf8');
    console.log('Successfully wrote build-config.json');

    return data;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Data validation failed:', error.errors);
    } else {
      console.error('Error writing build-config.json:', error);
    }

    throw error;
  }
}