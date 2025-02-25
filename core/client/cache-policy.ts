export const TAGS = {
  cart: 'cart',
  checkout: 'checkout',
  customer: 'customer',
  product: 'product',
  category: 'category',
  brand: 'brand',
  page: 'page',
} as const;

export const revalidate = process.env.DEFAULT_REVALIDATE_TARGET
  ? Number(process.env.DEFAULT_REVALIDATE_TARGET)
  : 3600;

interface GetTagsProps {
  entityType?: (typeof TAGS)[keyof typeof TAGS];
  entityId?: string | number;
  channelId?: string;
}

/**
 * Return standard tags to ensure all resources are cached consistently
 * Allows for cache invalidation of related resources when a single entity is updated
 */
const getTags = ({ entityType, entityId, channelId }: GetTagsProps) => {
  const storeTag = `store/${process.env.BIGCOMMERCE_STORE_HASH}`;
  channelId = channelId ?? process.env.BIGCOMMERCE_CHANNEL_ID;
  const channelTag = `${storeTag}/channel/${channelId}`;

  const tags = [
    storeTag,
    channelTag,
  ];

  if (entityType) {
    // Global store tag for entity type
    tags.push(`${storeTag}/${entityType}`);
    // Channel tag for entity type
    tags.push(`${channelTag}/${entityType}`);

    if (entityId) {
      // Global store entity ID tag for entity
      tags.push(`${storeTag}/${entityType}:${entityId}`);
      // Channel entity ID tag for entity
      tags.push(`${channelTag}/${entityType}:${entityId}`);
    }
  }

  return tags;
};

/**
 * Anonymous cache policies for fetching data that is the same for all shoppers
 */

export const anonymousCachePolicyWithEntityTags = ({ entityType, entityId, channelId }: GetTagsProps) => ({
  next: {
    tags: getTags({ entityType, entityId, channelId }),
  },
});

export const anonymousCachePolicy = (channelId?: string) => anonymousCachePolicyWithEntityTags({ channelId });

/**
 * Do not cache policies for fetching data that is different for each shopper or otherwise should not be cached
 */

export const doNotCachePolicyWithEntityTags = ({ entityType, entityId, channelId }: GetTagsProps) => ({
  cache: 'no-store' as const,
  next: {
    tags: getTags({ entityType, entityId, channelId }),
  },
});

export const doNotCachePolicy = (channelId?: string) => doNotCachePolicyWithEntityTags({ channelId });

/**
 * Shopper cache policies for fetching data that is cacheable for guests, but not for logged in shoppers
 * 
 * Use this strategy for data that may change once a shopper logs in such as Customer Group-based data
 */

export const shopperCachePolicyWithEntityTags = ({
  customerAccessToken,
  entityType,
  entityId,
  channelId,
}: GetTagsProps & { customerAccessToken: string | undefined }) => {
  if (customerAccessToken) {
    // No-store by default to limit Data Cache writes 
    // as the expected hit rate is low
    return doNotCachePolicyWithEntityTags({ entityType, entityId, channelId });
  }

  return anonymousCachePolicyWithEntityTags({ entityType, entityId, channelId });
};

export const shopperCachePolicy = (customerAccessToken: string | undefined, channelId?: string) =>
  shopperCachePolicyWithEntityTags({ customerAccessToken, channelId });
