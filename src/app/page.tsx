'use client'

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status !== 'loading') {
      setIsLoading(false);
    }
  }, [status]);

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto mt-8">
        <CardContent className="p-6">
          <div className="text-center">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-4xl font-extrabold text-center">
            Welcome to <span className="text-violet-600">Video CMS</span>
          </CardTitle>
          <CardDescription className="text-xl text-center mt-4">
            Share and manage your video content with ease.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pt-6">
          {session ? (
            <Button asChild size="lg">
              <Link href="/create-post">Create a Post</Link>
            </Button>
          ) : (
            <Button asChild size="lg">
              <Link href="/login">Get Started</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
