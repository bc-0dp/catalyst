'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
// import { migrateCartToNewRegion } from '~/lib/cart';
import { getRegionById } from '~/regions.config';
import { buildConfig } from '~/build-config/reader';
import { redirect } from '~/i18n/routing';

export async function switchRegion(formData: FormData) {
  const regionId = formData.get('region')?.toString();

  if (!regionId || !getRegionById(regionId)) {
    throw new Error('Invalid region');
  }

  // Set the region cookie
  (await cookies()).set('region', regionId as string, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });

  // Get the current locale from cookies
  const currentLocale = (await cookies()).get('NEXT_LOCALE')?.value;

  // Get region-specific locale information from the build config
  const regionLocales = buildConfig.get('regionLocales')?.[regionId];

  if (regionLocales) {
    // Check if current locale is available in the new region
    const isLocaleAvailable =
      currentLocale && regionLocales.locales.some((locale) => locale.code === currentLocale);

    // If current locale isn't available in the new region, redirect to the default locale
    if (!isLocaleAvailable && regionLocales.locales.length > 0) {
      // Get the default locale for this region
      const defaultLocale =
        (regionLocales.defaultLocale ||
        regionLocales.locales.find((l) => l.isDefault)?.code ||
        regionLocales.locales[0]?.code) ?? 'default-locale';

      console.log(
        `Switching locale from ${currentLocale} to ${defaultLocale} for region ${regionId}`,
      );

      // Migrate cart to new region (commented out for now)
      // await migrateCartToNewRegion();

      // Revalidate the path to update components
      revalidatePath('/', 'layout');

      // Redirect to home with the new locale
      redirect({
        href: '/',
        locale: defaultLocale,
      });

      return; // Early return as we're redirecting
    }
  }

  // If we're not changing locales, just migrate cart and revalidate
  // await migrateCartToNewRegion();
  revalidatePath('/', 'layout');
}