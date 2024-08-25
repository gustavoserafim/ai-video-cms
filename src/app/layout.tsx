import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import NavLinks from "@/components/NavLinks";
import { Providers } from "@/components/Providers";

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
    <html lang="en" className="h-full bg-gray-100">                                                      
      <body className={`${inter.className} h-full`}>                                                     
        <Providers>                                                                                      
          <div className="min-h-full">                                                                   
            <nav className="bg-gray-800">                                                                
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">                                   
                <div className="flex items-center justify-between h-16">                                 
                  <div className="flex items-center">                                                    
                    <Link href="/" className="flex-shrink-0">                                            
                      <img className="h-8 w-8" src="/next.svg" alt="Video CMS" />                        
                    </Link>                                                                              
                    <div className="hidden md:block">                                                    
                      <div className="ml-10 flex items-baseline space-x-4">                              
                        <NavLinks />                                                                     
                      </div>                                                                             
                    </div>                                                                               
                  </div>                                                                                 
                </div>                                                                                   
              </div>                                                                                     
            </nav>                                                                                       
                                                                                                         
            <main>                                                                                       
              <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">                                   
                {children}                                                                               
              </div>                                                                                     
            </main>                                                                                      
          </div>                                                                                         
        </Providers>                                                                                     
      </body>                                                                                            
    </html>                                                                                              
  );                                                                                                     
}    
