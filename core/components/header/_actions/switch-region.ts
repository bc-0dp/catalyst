'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { migrateCartToNewRegion } from '~/lib/cart';
import { getRegionById } from '~/regions.config';

export async function switchRegion(formData: FormData) {
  const region = formData.get('region');

  if (!getRegionById(region?.toString())) {
    throw new Error('Invalid region');
  }

  (await cookies()).set('region', region as string, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
  
  // Migrate cart to new region
  await migrateCartToNewRegion();
    
  revalidatePath('/');
}
