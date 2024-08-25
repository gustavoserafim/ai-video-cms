'use client'

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function NavLinks() {
  const { data: session, status } = useSession();
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);                                                                                   
    if (status !== "loading") {                                                                          
      setIsLoading(false);                                                                               
    }  
    console.log("NavLinks useEffect - Session status:", status);
    console.log("NavLinks useEffect - Session data:", session);
  }, [session, status]);

  console.log("NavLinks render - Session status:", status);
  console.log("NavLinks render - Session data:", session);

  if (!isClient || isLoading) {
    return <div className="animate-pulse bg-gray-700 h-4 w-20 rounded"></div>;
  }

  const linkClass = "text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium";                                                                                            
  const activeLinkClass = "bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium";
    
  if (session) {
    return (
      <>                                                                                                 
         <Link href="/" className={activeLinkClass}>Home</Link>                                           
         <Link href="/create-post" className={linkClass}>Create Post</Link>                               
         <Link href="/api/auth/signout" className={linkClass}>Logout</Link>                               
       </>
    );
  }

  return (
    <>                                                                                                   
       <Link href="/" className={activeLinkClass}>Home</Link>                                             
       <Link href="/login" className={linkClass}>Login</Link>                                             
       <Link href="/signup" className={linkClass}>Sign Up</Link>                                          
    </>
  );
}
