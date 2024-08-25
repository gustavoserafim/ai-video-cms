import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  console.log('Middleware executed for path:', request.nextUrl.pathname);
  console.log('Token:', token ? 'exists' : 'does not exist');

  if (request.nextUrl.pathname === '/create-post') {
    if (!token) {
      console.log('Redirecting unauthenticated user to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }
    console.log('Authenticated user accessing create-post');
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/create-post', '/api/auth/:path*'],
};
