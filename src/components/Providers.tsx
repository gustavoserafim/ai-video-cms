'use client'

import { SessionProvider } from "next-auth/react"
import { useEffect, useState } from "react"

function LoadingComponent() {
  return <div>Loading session...</div>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("Providers component rendered");
    setIsLoading(false);
  }, []);

  return (
    <SessionProvider
      refetchInterval={0}
      refetchOnWindowFocus={false}
      loading={<LoadingComponent />}
    >
      {isLoading ? <LoadingComponent /> : children}
    </SessionProvider>
  );
}
