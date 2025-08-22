import 'next-auth';
import 'next-auth/jwt';
import type { ResultOf } from 'gql.tada';
import type { CURRENT_USER_QUERY } from './client/queries/current-user';

type B2BUser = ResultOf<typeof CURRENT_USER_QUERY>['currentUser'];

declare module 'next-auth' {
  interface User {
    b2bToken?: string;
    b2bUser?: B2BUser;
  }

  interface Session {
    b2bToken?: string;
    b2bUser?: B2BUser;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    b2bToken?: string;
    b2bUser?: B2BUser;
  }
}
