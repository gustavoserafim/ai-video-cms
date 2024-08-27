'use client'

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { usePathname } from 'next/navigation';

export default function NavLinks() {
  const { data: session, status } = useSession();
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const linkClass = "text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium";
  const activeLinkClass = "bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium";

  const getLinkClass = (path: string) => {
    return pathname === path ? activeLinkClass : linkClass;
  };

  if (!isClient) {
    return null;
  }

  if (status === "loading") {
    return <div className="animate-pulse bg-gray-700 h-4 w-20 rounded"></div>;
  }

  return (
    <div className="flex items-center space-x-4">
      <Link href="/" className={getLinkClass('/')}>Home</Link>
      {status === "authenticated" ? (
        <>
          <Link href="/create-post" className={getLinkClass('/create-post')}>Create Post</Link>
          <Link href="/my-posts" className={getLinkClass('/my-posts')}>My Posts</Link>
          <Link href="/api/auth/signout" className={linkClass}>Logout</Link>
        </>
      ) : (
        <>
          <Link href="/login" className={getLinkClass('/login')}>Login</Link>
          <Link href="/signup" className={getLinkClass('/signup')}>Sign Up</Link>
        </>
      )}
    </div>
  );
}
