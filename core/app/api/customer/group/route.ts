import { NextResponse } from 'next/server';

import { getCustomerGroupId } from '~/client/queries/get-customer';

export async function GET() {
  try {
    const { data } = await getCustomerGroupId();

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error) {
      return { status: 'error', error: error.message };
    }

    return { status: 'error', error: 'Something went wrong. Please try again.' };
  }
}
