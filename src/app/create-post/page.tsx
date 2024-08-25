'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import toast, { Toaster } from 'react-hot-toast';

export default function CreatePostWrapper() {
  return (
    <ErrorBoundary>
      <CreatePost />
    </ErrorBoundary>
  );
}

function CreatePost() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const router = useRouter();
  const { data: session, status } = useSession();


  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {                                                                            
    return <div className="flex justify-center items-center h-screen">                                   
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500" aria-label="Loading..."></div>  
    </div>;                                                                                              
  }   

  if (!session) {
    return null;
  }

   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
     e.preventDefault();

     if (!title || !description || !video) {
       toast.error('Please fill in all required fields');
       return;
     }

     try {
       if (!supabase) {
         throw new Error('Supabase client is not initialized');
       }

       // Upload video
       const videoFile = video as File;
       const { data: videoData, error: videoError } = await supabase.storage
         .from('video')
         .upload(`${Date.now()}_${videoFile.name}`, videoFile);

       if (videoError) throw videoError;

       // Upload image (if provided)
       let imageUrl = null;
       if (image) {
         const imageFile = image as File;
         const { data: imageData, error: imageError } = await supabase.storage
           .from('image')
           .upload(`${Date.now()}_${imageFile.name}`, imageFile);

         if (imageError) throw imageError;
         const publicUrlResponse = supabase.storage.from('image').getPublicUrl(imageData.path);
         imageUrl = publicUrlResponse.data?.publicUrl;
       }

       // Create post in the database
       const videoPublicUrlResponse = supabase.storage.from('video').getPublicUrl(videoData.path);
       const videoUrl = videoPublicUrlResponse.data?.publicUrl;

       if (!videoUrl) {
         throw new Error('Failed to get public URL for video');
       }

       const { data, error } = await supabase
         .from('posts')
         .insert({
           title,
           description,
           video_url: videoUrl,
           image_url: imageUrl,
         });

       if (error) throw error;

       toast.success('Post created successfully!');
       router.push('/'); // Redirect to home page or post list
     } catch (error) {
       console.error('Error creating post:', error);
       let errorMessage = 'An unknown error occurred';
       if (error instanceof Error) {
         errorMessage = error.message;
       } else if (typeof error === 'object' && error !== null && 'message' in error) {
         errorMessage = String(error.message);
       }
       if (errorMessage.includes('TextDecoderStream')) {
         errorMessage = 'There was an issue processing the video. Please try again or use a different video file.';
       }
       toast.error('Error creating post: ' + errorMessage);
     }
   };

   return (                                                                                               
    <div className="max-w-4xl mx-auto mt-10 px-4 sm:px-6 lg:px-8">                                       
      <Toaster />                                                                                        
      <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight                 
lg:text-6xl">Create New Post</h1>                                                                        
      <p className="mt-5 text-xl text-gray-500">Share your latest video content with the world.</p>      
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">                                          
        <div className="rounded-md shadow-sm -space-y-px">                                               
          <div>                                                                                          
            <label htmlFor="title" className="sr-only">Title</label>                                     
            <input                                                                                       
              type="text"                                                                                
              id="title"                                                                                 
              value={title}                                                                              
              onChange={(e) => setTitle(e.target.value)}                                                 
              required                                                                                   
              className="appearance-none rounded-none relative block w-full px-3 py-2 border             
border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500   
focus:border-blue-500 focus:z-10 sm:text-sm"                                                             
              placeholder="Title"                                                                        
            />                                                                                           
          </div>                                                                                         
          <div>                                                                                          
            <label htmlFor="description" className="sr-only">Description</label>                         
            <textarea                                                                                    
              id="description"                                                                           
              value={description}                                                                        
              onChange={(e) => setDescription(e.target.value)}                                           
              required                                                                                   
              rows={4}                                                                                   
              className="appearance-none rounded-none relative block w-full px-3 py-2 border             
border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500                
focus:border-blue-500 focus:z-10 sm:text-sm"                                                             
              placeholder="Description"                                                                  
            ></textarea>                                                                                 
          </div>                                                                                         
        </div>                                                                                           
                                                                                                         
        <div>                                                                                            
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">                    
            Thumbnail Image (optional)                                                                   
          </label>                                                                                       
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed 
rounded-md">                                                                                             
            <div className="space-y-1 text-center">                                                      
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none"         
viewBox="0 0 48 48" aria-hidden="true">                                                                  
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0                    
01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4          
4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />               
              </svg>                                                                                     
              <div className="flex text-sm text-gray-600">                                               
                <label htmlFor="image" className="relative cursor-pointer bg-white rounded-md font-mediu 
text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset 
focus-within:ring-blue-500">                                                                             
                  <span>Upload a file</span>                                                             
                  <input                                                                                 
                    id="image"                                                                           
                    type="file"                                                                          
                    accept="image/*"                                                                     
                    onChange={(e) => setImage(e.target.files?.[0] || null)}                              
                    className="sr-only"                                                                  
                  />                                                                                     
                </label>                                                                                 
                <p className="pl-1">or drag and drop</p>                                                 
              </div>                                                                                     
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>                          
            </div>                                                                                       
          </div>                                                                                         
        </div>                                                                                           
                                                                                                         
        <div>                                                                                            
          <label htmlFor="video" className="block text-sm font-medium text-gray-700">                    
            Video                                                                                        
          </label>                                                                                       
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed 
rounded-md">                                                                                             
            <div className="space-y-1 text-center">                                                      
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none"         
viewBox="0 0 48 48" aria-hidden="true">                                                                  
                <path d="M24 10.5v6m0 0l-3-3m3 3l3-3m-3.5 18.75h-10.5a2.25 2.25 0 01-2.25-2.25v-15a2.25  
2.25 0 012.25-2.25h10.5a2.25 2.25 0 012.25 2.25v15a2.25 2.25 0 01-2.25 2.25z" strokeWidth="2"            
strokeLinecap="round" strokeLinejoin="round" />                                                          
              </svg>                                                                                     
              <div className="flex text-sm text-gray-600">                                               
                <label htmlFor="video" className="relative cursor-pointer bg-white rounded-md font-mediu 
text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset 
focus-within:ring-blue-500">                                                                             
                  <span>Upload a file</span>                                                             
                  <input                                                                                 
                    id="video"                                                                           
                    type="file"                                                                          
                    accept="video/*"                                                                     
                    onChange={(e) => setVideo(e.target.files?.[0] || null)}                              
                    required                                                                             
                    className="sr-only"                                                                  
                  />                                                                                     
                </label>                                                                                 
                <p className="pl-1">or drag and drop</p>                                                 
              </div>                                                                                     
              <p className="text-xs text-gray-500">MP4, WebM, Ogg up to 100MB</p>                        
            </div>                                                                                       
          </div>                                                                                         
        </div>                                                                                           
                                                                                                         
        <div>                                                                                            
          <button                                                                                        
            type="submit"                                                                                
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent     
text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2  
focus:ring-offset-2 focus:ring-blue-500"                                                                 
          >                                                                                              
            Create Post                                                                                  
          </button>                                                                                      
        </div>                                                                                           
      </form>                                                                                            
    </div>                                                                                               
  );                                                                                                     
};
