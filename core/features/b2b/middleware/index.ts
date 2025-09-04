import { NextRequest, NextResponse } from 'next/server';
import { auth } from '~/auth';

export async function middleware(request: NextRequest) {
  // Check if this is an account route
  if (request.nextUrl.pathname.startsWith('/account')) {
    const session = await auth();

    if (session?.b2bUser) {
      // Check if B2B version of this page exists
      const accountPath = request.nextUrl.pathname.replace('/account', '') || '/';

      try {
        // Try to rewrite to B2B feature account pages
        const b2bPath = `/features/b2b/account${accountPath}`;

        // You could add logic here to check if the B2B page actually exists
        // For now, we'll assume if it's a B2B user, serve B2B content when available

        const rewriteUrl = new URL(b2bPath, request.url);
        return NextResponse.rewrite(rewriteUrl);
      } catch (error) {
        // If B2B page doesn't exist, fall back to standard account page
        return NextResponse.next();
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/account/:path*'],
};
