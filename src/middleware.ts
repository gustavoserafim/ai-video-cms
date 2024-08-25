import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  try {
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
  } catch (error) {
    console.error('Error in middleware:', error);
    // In case of an error, redirect to an error page or home page
    return NextResponse.redirect(new URL('/error', request.url));
  }
}

export const config = {
  matcher: ['/create-post', '/api/auth/:path*'],
};
