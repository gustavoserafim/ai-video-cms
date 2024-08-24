'use client'

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function NavLinks() {
  const { data: session } = useSession();

  if (session) {
    return (
      <>
        <Link href="/create-post" className="mr-4">
          Create Post
        </Link>
        <Link href="/api/auth/signout">
          Logout
        </Link>
      </>
    );
  }

  return (
    <>
      <Link href="/login" className="mr-4">
        Login
      </Link>
      <Link href="/signup" className="mr-4">
        Sign Up
      </Link>
    </>
  );
}
