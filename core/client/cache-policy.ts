export const revalidate = process.env.DEFAULT_REVALIDATE_TARGET
  ? Number(process.env.DEFAULT_REVALIDATE_TARGET)
  : 3600;

export const anonymousCachePolicy = ({ tags }: { tags?: string[] }) => ({
  next: {
    revalidate,
  },
  ...(tags && { tags }),
});

export const shopperCachePolicy = ({
  customerAccessToken,
  tags,
}: {
  customerAccessToken?: string;
  tags?: string[];
}) => {
  if (customerAccessToken) {
    return {
      next: {
        // No-cache by default to limit Data Cache writes, 
        // configure CUSTOMER_REVALIDATE_TARGET to override
        // and cache customer API calls
        revalidate: process.env.CUSTOMER_REVALIDATE_TARGET
          ? Number(process.env.CUSTOMER_REVALIDATE_TARGET)
          : 0,
      },
      ...(tags && { tags }),
    };
  }

  return anonymousCachePolicy({ tags });
};

export const doNotCachePolicy = {
  next: {
    revalidate: 0,
  },
};

export const TAGS = {
  cart: 'cart',
  checkout: 'checkout',
  customer: 'customer',
} as const;
