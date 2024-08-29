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
    return pathname === path ? "transparent" : "transparent";
  };

  if (!isClient) {
    return null;
  }

  if (status === "loading") {
    return <div className="animate-pulse bg-gray-700 h-4 w-20 rounded"></div>;
  }

  return (
    <nav className="flex items-center space-x-4 rounded-lg">
      <Button asChild variant={getLinkVariant('/')} className="text-zinc-100 hover:text-violet-400">
        <Link href="/">Home</Link>
      </Button>
      {status === "authenticated" ? (
        <>
          <Button asChild variant={getLinkVariant('/create-post')} className="text-zinc-100 hover:text-violet-400">
            <Link href="/create-post">Create Post</Link>
          </Button>
          <Button asChild variant={getLinkVariant('/my-posts')} className="text-zinc-100 hover:text-violet-400">
            <Link href="/my-posts">My Posts</Link>
          </Button>
          <Button asChild variant="ghost" className="text-zinc-100 hover:text-violet-400">
            <Link href="/api/auth/signout">Logout</Link>
          </Button>
        </>
      ) : (
        <>
          <Button asChild variant={getLinkVariant('/login')} className="text-zinc-100 hover:text-violet-400">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild variant={getLinkVariant('/signup')} className="text-zinc-100 hover:text-violet-400">
            <Link href="/signup">Sign Up</Link>
          </Button>
        </>
      )}
    </nav>
  );
}
