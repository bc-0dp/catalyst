## Features

- **Conditional Loading**: B2B modules are only loaded when `B2B_ENABLED=true`
- **Type Safety**: Full GraphQL introspection with `gql.tada` for B2B user types
- **Error Handling**: Graceful fallbacks that don't break standard authentication
- **Modular Architecture**: All B2B functionality contained within `/features/b2b`
- **Session Integration**: B2B token and user data automatically available in NextAuth sessions

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

### 3. Add B2B Functions with Conditional Loading

`core/auth/index.ts`
```typescript
const getB2BFunctions = async () => {
  if (process.env.B2B_ENABLED !== 'true') {
    return {
      loginWithB2B: async () => null,
      fetchB2BUser: async () => null,
    };
  }

  try {
    const { loginWithB2B, fetchB2BUser } = await import('~/features/b2b/auth');
    return { loginWithB2B, fetchB2BUser };
  } catch (error) {
    console.error('[B2B] Failed to load B2B module:', error);
    return {
      loginWithB2B: async () => null,
      fetchB2BUser: async () => null,
    };
  }
};
```

### 4. Update loginWithPassword Function and loginWithJwt Function

`core/auth/index.ts` (after customer validation)
```typescript
  // B2B Integration
  const { loginWithB2B, fetchB2BUser } = await getB2BFunctions();
  
  const b2bToken = await loginWithB2B({
    customerId: result.customer.entityId,
    customerAccessToken: {
      value: result.customerAccessToken.value,
      expiresAt: result.customerAccessToken.expiresAt,
    },
  });

  const b2bUser = b2bToken ? await fetchB2BUser(b2bToken) : null;
```

### 5. Add B2B Token and User to User Object

`core/auth/index.ts` (in return statement)
```typescript
return {
  name: `${result.customer.firstName} ${result.customer.lastName}`,
  email: result.customer.email,
  customerAccessToken: result.customerAccessToken.value,
  cartId: result.cart?.entityId,
  ...(b2bToken && { b2bToken }),
  ...(b2bUser && { b2bUser }),
};
```

### 6. Update Session Callbacks

`core/auth/index.ts` (in JWT callback)
```typescript
if (user?.b2bToken) {
  token.b2bToken = user.b2bToken;
}

if (user?.b2bUser) {
  token.b2bUser = user.b2bUser;
}
```

`core/auth/index.ts` (in session callback)
```typescript
if (token.b2bToken) {
  session.b2bToken = token.b2bToken;
}

if (token.b2bUser) {
  session.b2bUser = token.b2bUser;
}
```

### 7. Environment Variables

`.env.local`
```bash
B2B_ENABLED=true
B2B_API_TOKEN=your_b2b_api_token
```

## Usage
Throughout Catalyst we can access the B2B token and user data:

```typescript
const session = await auth();
if (session?.b2bToken) {
  // Access B2B token
  console.log('B2B Token:', session.b2bToken);
}

if (session?.b2bUser) {
  // Access B2B user data with full type safety
  console.log('B2B User:', session.b2bUser);
}
```
