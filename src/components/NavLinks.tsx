'use client'

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function NavLinks() {
  const { data: session, status } = useSession();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const linkClass = "text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium";
  const activeLinkClass = "bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium";

  if (!isClient) {
    return null;
  }

  if (status === "loading") {
    return <div className="animate-pulse bg-gray-700 h-4 w-20 rounded"></div>;
  }

  return (
    <>
      <Link href="/" className={activeLinkClass}>Home</Link>
      {status === "authenticated" ? (
        <>
          <Link href="/create-post" className={linkClass}>Create Post</Link>
          <Link href="/api/auth/signout" className={linkClass}>Logout</Link>
        </>
      ) : (
        <>
          <Link href="/login" className={linkClass}>Login</Link>
          <Link href="/signup" className={linkClass}>Sign Up</Link>
        </>
      )}
    </>
  );
}
