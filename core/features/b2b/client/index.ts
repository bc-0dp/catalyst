import type { ResultOf, VariablesOf } from 'gql.tada';
import { print } from 'graphql';

import type { B2BGraphQLResponse, LoginWithB2BParams, EnvConfig } from './types';
import { EnvSchema, ErrorResponseSchema, B2BTokenResponseSchema } from './types';

export class B2BClient {
  private readonly apiEndpoint = 'https://api-b2b.bigcommerce.com';
  private readonly env = EnvSchema.parse({
    B2B_API_TOKEN: process.env.B2B_API_TOKEN,
    BIGCOMMERCE_CHANNEL_ID: process.env.BIGCOMMERCE_CHANNEL_ID,
  });

  async request<T extends string>(
    document: T,
    variables?: VariablesOf<T>,
  ): Promise<B2BGraphQLResponse<ResultOf<T>>> {
    const queryString = print(document as any);

    const response = await fetch(`${this.apiEndpoint}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${process.env.BIGCOMMERCE_STOREFRONT_TOKEN}`,
      },
      body: JSON.stringify({ query: queryString, variables }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async loginWithB2B({ customerId, customerAccessToken }: LoginWithB2BParams): Promise<string> {
    const { B2B_API_TOKEN, BIGCOMMERCE_CHANNEL_ID } = this.env;

    const res = await fetch(`${this.apiEndpoint}/api/io/auth/customers/storefront`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        authToken: B2B_API_TOKEN,
      },
      body: JSON.stringify({
        channelId: BIGCOMMERCE_CHANNEL_ID,
        customerId,
        customerAccessToken,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      const err = ErrorResponseSchema.parse(json);
      throw new Error(
        `Failed to login. Status: ${res.status}, Message: ${err.detail || err.meta?.message || 'Unknown error'}`
      );
    }

    return B2BTokenResponseSchema.parse(json).data.token[0];
  }
}

export const b2bClient = new B2BClient();
