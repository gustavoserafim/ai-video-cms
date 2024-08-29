import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { supabase } from '@/lib/supabase';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (error) {
          console.error('Supabase auth error:', error);
          return null;
        }

        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.full_name,
          access_token: data.session?.access_token,
          refresh_token: data.session?.refresh_token,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.accessToken = user.access_token;
        token.refreshToken = user.refresh_token;
        token.expiresAt = Math.floor(Date.now() / 1000 + 3600); // Set expiry to 1 hour from now
      }

      // If the token is not expired, return it
      if (Date.now() < token.expiresAt * 1000) {
        return token;
      }

      // Token has expired, try to refresh it
      try {
        const { data, error } = await supabase.auth.refreshSession({
          refresh_token: token.refreshToken,
        });

        if (error) throw error;

        return {
          ...token,
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: Math.floor(Date.now() / 1000 + 3600), // Set new expiry
        };
      } catch (error) {
        console.error('Error refreshing access token', error);
        // If refresh fails, sign the user out on the client side
        return { ...token, error: 'RefreshAccessTokenError' };
      }
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.accessToken = token.accessToken;
      session.error = token.error;
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
  events: {
    async signIn(message) {
      console.log('User signed in:', message);
    },
    async signOut(message) {
      console.log('User signed out:', message);
    },
    async session(message) {
      console.log('Session updated:', message);
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
