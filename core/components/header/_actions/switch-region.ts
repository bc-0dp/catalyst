'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function switchRegion(formData: FormData) {
  const region = formData.get('region');

  if (region !== 'eu' && region !== 'row') {
    throw new Error('Invalid region');
  }

  (await cookies()).set('region', region, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });

  revalidatePath('/');
}
