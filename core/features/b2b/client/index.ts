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

  async request<T extends { kind: string }>(
    document: T,
    variables?: VariablesOf<T>,
    b2bToken?: string,
  ): Promise<B2BGraphQLResponse<ResultOf<T>>> {
    const queryString = print(document as any);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    
    if (b2bToken) {
      headers.Authorization = `Bearer ${b2bToken}`;
    } else {
      headers.Authorization = `Bearer ${process.env.BIGCOMMERCE_STOREFRONT_TOKEN}`;
    }
    
    const response = await fetch(`${this.apiEndpoint}/graphql`, {
      method: 'POST',
      headers,
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
        `Failed to login. Status: ${res.status}, Message: ${err.detail || err.meta?.message || 'Unknown error'}`,
      );
    }

    return B2BTokenResponseSchema.parse(json).data.token[0];
  }

  async getCurrentUser(b2bToken: string) {
    try {
      const { CURRENT_USER_QUERY } = await import('./queries/current-user');
      const result = await this.request(CURRENT_USER_QUERY, {}, b2bToken);
      return result.data || null;
    } catch (error) {
      console.error('Failed to fetch B2B current user:', error);
      return null;
    }
  }
}

export const b2bClient = new B2BClient();
