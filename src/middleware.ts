import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  try {
    console.log('Middleware executed for path:', request.nextUrl.pathname);
    
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET,
    });
    
    console.log('Token:', token ? 'exists' : 'does not exist');

    if (request.nextUrl.pathname === '/create-post') {
      if (!token) {
        console.log('Redirecting unauthenticated user to login');
        return NextResponse.redirect(new URL('/login', request.url));
      }
      console.log('Authenticated user accessing create-post');
    }

    // Allow the request to proceed
    return NextResponse.next();
  } catch (error) {
    console.error('Error in middleware:', error);
    // In case of an error, allow the request to proceed
    // This way, the error can be handled by the ErrorBoundary in the app
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/create-post'],
};
