import { initGraphQLTada } from 'gql.tada';

import type { introspection } from '../bigcommerce-b2b-graphql';

export const graphql = initGraphQLTada<{
  introspection: introspection;
  scalars: {
    DateTime: string;
    BigDecimal: number;
    UUID: string;
  };
  disableMasking: true;
}>();

export type { FragmentOf, ResultOf, VariablesOf } from 'gql.tada';
export { readFragment } from 'gql.tada';
