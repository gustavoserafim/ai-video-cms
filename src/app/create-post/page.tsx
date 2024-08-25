'use client';                                                                                                                   
                                                                                                                                 
 import React, { useState, FormEvent } from 'react';                                                                             
 import { supabase } from '@/lib/supabase';                                                                                      
 import { useRouter } from 'next/navigation';                                                                                    
 import toast, { Toaster } from 'react-hot-toast';                                                                               
                                                                                                                                 
 export default function CreatePost() {                                                                                          
   const [title, setTitle] = useState('');                                                                                       
   const [description, setDescription] = useState('');                                                                           
   const [image, setImage] = useState<File | null>(null);                                                                        
   const [video, setVideo] = useState<File | null>(null);                                                                        
   const router = useRouter();                                                                                                   
                                                                                                                                 
   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {                                                               
     e.preventDefault();                                                                                                         
                                                                                                                                 
     if (!title || !description || !video) {                                                                                     
       toast.error('Please fill in all required fields');                                                                        
       return;                                                                                                                   
     }                                                                                                                           
                                                                                                                                 
     try {                                                                                                                       
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
         imageUrl = supabase.storage.from('image').getPublicUrl(imageData.path).data.publicUrl;                                 
       }                                                                                                                         
                                                                                                                                 
       // Create post in the database                                                                                            
       const { data, error } = await supabase                                                                                    
         .from('posts')                                                                                                          
         .insert({                                                                                                               
           title,                                                                                                                
           description,                                                                                                          
           video_url: supabase.storage.from('video').getPublicUrl(videoData.path).data.publicUrl,                               
           image_url: imageUrl,                                                                                                  
         });                                                                                                                     
                                                                                                                                 
       if (error) throw error;                                                                                                   
                                                                                                                                 
       toast.success('Post created successfully!');                                                                              
       router.push('/'); // Redirect to home page or post list                                                                   
     } catch (error) {
      const errorMessage = (error as Error).message;
      toast.error('Error creating post: ' + errorMessage);
     }                                                                                                                           
   };                                                                                                                            
                                                                                                                                 
   return (                                                                                                                      
     <div className="max-w-2xl mx-auto mt-10">                                                                                   
       <Toaster />                                                                                                               
       <h1 className="text-3xl font-bold mb-6">Create New Post</h1>                                                              
       <form onSubmit={handleSubmit} className="space-y-6">                                                                      
         <div>                                                                                                                   
           <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>                              
           <input                                                                                                                
             type="text"                                                                                                         
             id="title"                                                                                                          
             value={title}                                                                                                       
             onChange={(e) => setTitle(e.target.value)}                                                                          
             required                                                                                                            
             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring                
 focus:ring-indigo-200 focus:ring-opacity-50"                                                                                    
           />                                                                                                                    
         </div>                                                                                                                  
         <div>                                                                                                                   
           <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>                  
           <textarea                                                                                                             
             id="description"                                                                                                    
             value={description}                                                                                                 
             onChange={(e) => setDescription(e.target.value)}                                                                    
             required                                                                                                            
             rows={4}                                                                                                            
             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring                
 focus:ring-indigo-200 focus:ring-opacity-50"                                                                                    
           ></textarea>                                                                                                          
         </div>                                                                                                                  
         <div>                                                                                                                   
           <label htmlFor="image" className="block text-sm font-medium text-gray-700">Image (optional)</label>                   
           <input                                                                                                                
             type="file"                                                                                                         
             id="image"                                                                                                          
             accept="image/*"                                                                                                    
             onChange={(e) => setImage(e.target.files?.[0] || null)}                                                             
             className="mt-1 block w-full"                                                                                       
           />                                                                                                                    
         </div>                                                                                                                  
         <div>                                                                                                                   
           <label htmlFor="video" className="block text-sm font-medium text-gray-700">Video</label>                              
           <input                                                                                                                
             type="file"                                                                                                         
             id="video"                                                                                                          
             accept="video/*"                                                                                                    
             onChange={(e) => setVideo(e.target.files?.[0] || null)}                                                             
             required                                                                                                            
             className="mt-1 block w-full"                                                                                       
           />                                                                                                                    
         </div>                                                                                                                  
         <button                                                                                                                 
           type="submit"                                                                                                         
           className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none             
 focus:shadow-outline"                                                                                                           
         >                                                                                                                       
           Create Post                                                                                                           
         </button>                                                                                                               
       </form>                                                                                                                   
     </div>                                                                                                                      
   );                                                                                                                            
 }'use client'

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CreatePost() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div>
      <h1>Create Post</h1>
      {/* Add your create post form here */}
    </div>
  );
}
