'use client'                                                                                             
                                                                                                          
import { useSession } from 'next-auth/react';                                                            
import Link from 'next/link';                                                                            
                                                                                                         
export default function Home() {                                                                         
  const { data: session } = useSession();                                                                
                                                                                                         
  return (                                                                                               
    <div className="bg-white">                                                                           
      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">                            
        <div className="text-center">                                                                    
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">  
            <span className="block xl:inline">Welcome to </span>                                         
            <span className="block text-blue-600 xl:inline">Video CMS</span>                             
          </h1>                                                                                          
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl      
md:max-w-3xl">                                                                                           
            Share and manage your video content with ease.                                               
          </p>                                                                                           
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">                      
            {session ? (                                                                                 
              <Link href="/create-post" className="inline-flex items-center justify-center px-5 py-3     
border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">    
                Create a Post                                                                            
              </Link>                                                                                    
            ) : (                                                                                        
              <Link href="/login" className="inline-flex items-center justify-center px-5 py-3 border    
border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">           
                Get Started                                                                              
              </Link>                                                                                    
            )}                                                                                           
          </div>                                                                                         
        </div>                                                                                           
      </div>                                                                                             
    </div>                                                                                               
  );                                                                                                     
}  