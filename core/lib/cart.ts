'use server';

import { cookies } from 'next/headers';
import { getSessionCustomerAccessToken } from '~/auth';
import { createCart } from '~/client/mutations/create-cart';
import { getCart } from '~/client/queries/get-cart';

export async function getCartId(): Promise<string | undefined> {
  const cookieStore = cookies();
  const cartId = cookieStore.get('cartId')?.value;
  return cartId;
}

export async function setCartId(cartId: string): Promise<void> {
  const cookieStore = cookies();
  cookieStore.set('cartId', cartId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

export async function clearCartId(): Promise<void> {
  const cookieStore = cookies();
  cookieStore.delete('cartId');
}

export async function migrateCartToNewRegion(): Promise<void> {
  const currentCartId = await getCartId();

  if (!currentCartId) {
    return;
  }

  console.log('Migrating cart (currentCartId):', currentCartId);

  try {
    // 1. Get the current cart content
    const cart = await getCart(currentCartId);

    if (!cart) {
      await clearCartId();
      return;
    }

    console.log('Migrating cart (content):', cart);

    // 2. Build line items from current cart
    const lineItems = [];

    // Process physical items
    cart.lineItems.physicalItems.forEach((item) => {
      // Skip if the item doesn't have required fields
      if (!item.productEntityId || !item.quantity) return;

      const lineItem = {
        quantity: item.quantity,
        productEntityId: item.productEntityId,
        variantEntityId: item.variantEntityId,
      };

      // Add option selections if present
      if (item.selectedOptions?.length) {
        lineItem.optionSelections = item.selectedOptions.map((option) => {
          // Handle different option types based on their properties
          if ('valueEntityId' in option) {
            return {
              optionEntityId: option.entityId,
              optionValueEntityId: option.valueEntityId,
            };
          }
          if ('number' in option) {
            return {
              optionEntityId: option.entityId,
              number: option.number,
            };
          }
          if ('text' in option) {
            return {
              optionEntityId: option.entityId,
              text: option.text,
            };
          }
          if ('date' in option && option.date) {
            return {
              optionEntityId: option.entityId,
              date: option.date.utc,
            };
          }
          return { optionEntityId: option.entityId };
        });
      }

      lineItems.push(lineItem);
    });

    // Process digital items
    cart.lineItems.digitalItems.forEach((item) => {
      // Skip if the item doesn't have required fields
      if (!item.productEntityId || !item.quantity) return;

      const lineItem = {
        quantity: item.quantity,
        productEntityId: item.productEntityId,
        variantEntityId: item.variantEntityId,
      };

      // Add option selections if present
      if (item.selectedOptions?.length) {
        lineItem.optionSelections = item.selectedOptions.map((option) => {
          if ('valueEntityId' in option) {
            return {
              optionEntityId: option.entityId,
              optionValueEntityId: option.valueEntityId,
            };
          }
          if ('number' in option) {
            return {
              optionEntityId: option.entityId,
              number: option.number,
            };
          }
          if ('text' in option) {
            return {
              optionEntityId: option.entityId,
              text: option.text,
            };
          }
          if ('date' in option && option.date) {
            return {
              optionEntityId: option.entityId,
              date: option.date.utc,
            };
          }
          return { optionEntityId: option.entityId };
        });
      }

      lineItems.push(lineItem);
    });

    // 3. Create a new cart with the items
    if (lineItems.length > 0) {
      try {
        // First clear the old cart cookie to ensure we're creating a cart in the new region
        await clearCartId();

        const createCartResponse = await createCart(lineItems);
        const newCartId = createCartResponse.data?.cart?.createCart?.cart?.entityId;

        console.log('Migrating cart (newCartId):', newCartId);

        if (newCartId) {
          // Set the new cart ID in cookies
          await setCartId(newCartId);
        }
      } catch (error) {
        console.error('Failed to create new cart:', error);
      }
    }
  } catch (error) {
    console.error('Failed to migrate cart:', error);
    // Ensure the cart cookie is cleared even if migration fails
  }
}
