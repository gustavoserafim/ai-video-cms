'use client'

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";

export default function NavLinks() {
  const { data: session, status } = useSession();
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getLinkVariant = (path: string) => {
    return pathname === path ? "secondary" : "ghost";
  };

  if (!isClient) {
    return null;
  }

  if (status === "loading") {
    return <div className="animate-pulse bg-gray-700 h-4 w-20 rounded"></div>;
  }

  return (
    <nav className="flex items-center space-x-4">
      <Button asChild variant={getLinkVariant('/')}>
        <Link href="/">Home</Link>
      </Button>
      {status === "authenticated" ? (
        <>
          <Button asChild variant={getLinkVariant('/create-post')}>
            <Link href="/create-post">Create Post</Link>
          </Button>
          <Button asChild variant={getLinkVariant('/my-posts')}>
            <Link href="/my-posts">My Posts</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/api/auth/signout">Logout</Link>
          </Button>
        </>
      ) : (
        <>
          <Button asChild variant={getLinkVariant('/login')}>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild variant={getLinkVariant('/signup')}>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </>
      )}
    </nav>
  );
}
