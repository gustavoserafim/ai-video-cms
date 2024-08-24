import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Video CMS",
  description: "A Video Content Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="bg-gray-800 text-white p-4">
          <nav className="container mx-auto flex justify-between items-center">
            <Link href="/" className="text-xl font-bold">
              Video CMS
            </Link>
            <div>
              <Link href="/login" className="mr-4">
                Login
              </Link>
              <Link href="/signup" className="mr-4">
                Sign Up
              </Link>
              <Link href="/create-post">
                Create Post
              </Link>
            </div>
          </nav>
        </header>
        <main className="container mx-auto mt-8">
          {children}
        </main>
      </body>
    </html>
  );
}
