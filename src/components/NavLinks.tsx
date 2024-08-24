'use client'

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function NavLinks() {
  const { data: session, status } = useSession();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    console.log("NavLinks useEffect - Session status:", status);
    console.log("NavLinks useEffect - Session data:", session);
  }, [session, status]);

  console.log("NavLinks render - Session status:", status);
  console.log("NavLinks render - Session data:", session);

  if (!isClient) {
    return null; // Don't render anything on the server
  }

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (session) {
    return (
      <>
        <Link href="/create-post" className="mr-4 text-blue-300 hover:text-blue-100">
          Create Post
        </Link>
        <Link href="/api/auth/signout" className="text-red-300 hover:text-red-100">
          Logout
        </Link>
      </>
    );
  }

  return (
    <>
      <Link href="/login" className="mr-4 text-green-300 hover:text-green-100">
        Login
      </Link>
      <Link href="/signup" className="mr-4 text-yellow-300 hover:text-yellow-100">
        Sign Up
      </Link>
    </>
  );
}
