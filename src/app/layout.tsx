import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import NavLinks from "@/components/NavLinks";
import { Providers } from "@/components/Providers";
import dynamic from 'next/dynamic';
import { getServerSession } from "next-auth/next";
import { Session } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Video CMS",
  description: "A Video Content Management System",
};

const ClientErrorBoundary = dynamic(
  () => import('@/components/ErrorBoundary'),
  { ssr: false }
);

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className="h-full bg-white">
      <body className={`${inter.className} h-full`}>
        <Providers session={session as Session | null}>
          <ClientErrorBoundary>
            <div className="min-h-full">
              <nav className="fixed top-0 left-0 right-0 z-50 bg-violet-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center justify-between h-16">
                    <div className="flex-shrink-0">
                      <Link href="/" className="flex items-center">
                        <img className="h-6" src="/logo.png" alt="Video CMS" />
                      </Link>
                    </div>
                    <div className="hidden md:block">
                      <NavLinks />
                    </div>
                  </div>
                </div>
              </nav>
              
              <main className="pt-16"> {/* Add padding-top to account for fixed navbar */}
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                  {children}
                </div>
              </main>
            </div>
          </ClientErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
