## INSTALLATION

### 1. Install package in `/core/features/b2b`

### 2. Update package.json scripts
`core/package.json`
```json
  "scripts": {
    "dev": "npm run generate && npm run generate:b2b && next dev",
    "generate": "dotenv -e .env.local -- node ./scripts/generate.cjs",
    "generate:b2b": "dotenv -e .env.local -- node ./features/b2b/scripts/generate.js",
    "build:analyze": "ANALYZE=true npm run build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
```

### 3. Add B2B Login Function

`core/auth/index.ts`
```typescript
const loginWithB2B = async ({
  customerId,
  customerAccessToken,
}: {
  customerId: number;
  customerAccessToken: { value: string; expiresAt: string };
}) => {
  if (process.env.B2B_ENABLED !== 'true') return null;

  try {
    const { b2bClient } = await import('~/features/b2b/client');
    return await b2bClient.loginWithB2B({ customerId, customerAccessToken });
  } catch (error) {
    console.error('🚨 [B2B LOGIN] Failed:', error);
    return null; // Don't break standard auth
  }
};
```

### 4. Update loginWithPassword Function and loginWithJwt Function

`core/auth/index.ts` (after customer validation)
```typescript
  const b2bToken = await loginWithB2B({
    customerId: result.customer.entityId,
    customerAccessToken: {
      value: result.customerAccessToken.value,
      expiresAt: result.customerAccessToken.expiresAt,
    },
  });
```

### 5. Add B2B Token to User Object

`core/auth/index.ts` (in return statement)
```typescript
return {
  name: `${result.customer.firstName} ${result.customer.lastName}`,
  email: result.customer.email,
  customerAccessToken: result.customerAccessToken.value,
  cartId: result.cart?.entityId,
  ...(b2bToken && { b2bToken }),
};
```

### 6. Update Session Callbacks

`core/auth/index.ts` (in JWT callback)
```typescript
if (token.user?.b2bToken) {
  newToken.b2bToken = token.user.b2bToken;
}
```

`core/auth/index.ts` (in session callback)
```typescript
if (token.b2bToken) {
  session.b2bToken = token.b2bToken;
}
```

### 7. Update Types

`core/auth/types.ts`
```typescript
declare module 'next-auth' {
  interface Session {
    user?: User;
    b2bToken?: string;
  }

  interface User {
    name?: string | null;
    email?: string | null;
    cartId?: string | null;
    customerAccessToken?: string;
    impersonatorId?: string | null;
    b2bToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    user?: User;
    b2bToken?: string;
  }
}
```

### 8. Environment Variables

`.env.local`
```bash
B2B_ENABLED=true
B2B_API_TOKEN=your_b2b_api_token
```

## Usage
Throughout Catalyst we can access the B2B token:

```
const session = await auth();
if (session?.b2bToken) {
    // TODO
}
```