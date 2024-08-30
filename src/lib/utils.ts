import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { getSession, signOut } from "next-auth/react";
import { Session } from "next-auth";

type CustomSession = Session & { accessToken?: string, error?: string };

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getPublicMediaUrl(fileName: string, bucket: 'image' | 'video'): string {
  if (!fileName) return '';
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${fileName}`;
}

export async function getValidSession() {
  const session = await getSession() as Session & { error?: string };
  if (session?.error === 'RefreshAccessTokenError') {
    await signOut({ redirect: false });
    throw new Error('Your session has expired. Please sign in again.');
  }
  return session;
}

export async function getPrivateMediaUrl(fileName: string, bucket: 'image' | 'video'): Promise<{ url: string; headers: { Authorization: string } } | null> {
  if (!fileName) return null;
  
  const session = await getValidSession() as CustomSession;
  const accessToken = session?.accessToken;

  if (!accessToken) {
    console.error('No access token available');
    return null;
  }

  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/authenticated/${bucket}/${fileName}`;
  
  // Return an object with the URL and headers instead of just the URL
  return {
    url,
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  };
}