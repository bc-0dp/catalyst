'use server';

import { cookies } from 'next/headers';

export async function getCartId(): Promise<string | undefined> {
  const cookieStore = await cookies();
  const cartId = cookieStore.get('cartId')?.value;

  return cartId;
}

export async function setCartId(cartId: string): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set('cartId', cartId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

export async function clearCartId(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete('cartId');
}

// 1. Get the cart content
// 2. Clear the cart content and clear the cookie
// 3. Create a new cart for the region and set the cookie
// 4. Add the cart content to the new cart
export async function migrateCartToNewRegion(): Promise<void> {
    todo();
}
