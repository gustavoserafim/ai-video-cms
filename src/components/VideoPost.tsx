import React from 'react';
import Link from 'next/link';

interface Post {
  id: number;
  title: string;
  description: string;
}

export const VideoPost: React.FC<{ post: Post }> = ({ post }) => {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">                                         
      <div className="p-5">                                                                              
        <div className="flex items-center">                                                              
          <div className="flex-shrink-0">                                                                
            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            </svg>
          </div>                                                                                         
          <div className="ml-5 w-0 flex-1">                                                              
            <h3 className="text-lg font-medium text-gray-900 truncate">{post.title}</h3>                 
          </div>                                                                                         
        </div>                                                                                           
        <div className="mt-3">                                                                           
          <p className="text-sm text-gray-500">{post.description}</p>                                    
        </div>                                                                                           
      </div>                                                                                             
      <div className="bg-gray-50 px-5 py-3">
         <Link href={`/post/${post.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-500">View details</Link>                                                                                 
      </div>
    </div>
  );
};
