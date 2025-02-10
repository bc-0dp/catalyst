import { NextResponse } from 'next/server';
import { z } from 'zod';

export const CustomerGroupsSchema = z.nullable(
  z
    .object({
      id: z.number(),
      name: z.string(),
    })
    .array(),
);

export type CustomerGroupsType = z.infer<typeof CustomerGroupsSchema>;

export async function GET() {
  if (!process.env.BIGCOMMERCE_ACCESS_TOKEN) {
    // eslint-disable-next-line no-console
    console.error('BIGCOMMERCE_ACCESS_TOKEN is not set');

    return NextResponse.json({ status: 'error', error: 'Internal server error' }, { status: 500 });
  }

  try {
    const response = await fetch(
      `https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v2/customer_groups`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Auth-Token': process.env.BIGCOMMERCE_ACCESS_TOKEN,
        },
      },
    );

    const jsonResponse: unknown = await response.json();
    const result = CustomerGroupsSchema.safeParse(jsonResponse);

    if (!result.success) {
      throw result.error;
    }

    return NextResponse.json(result.data);
  } catch (error) {
    if (error instanceof Error) {
      return { status: 'error', error: error.message };
    }

    return { status: 'error', error: 'Something went wrong. Please try again.' };
  }
}
