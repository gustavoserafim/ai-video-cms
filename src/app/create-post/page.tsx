'use client';

import React, { useState, FormEvent } from 'react';
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

  if (status === 'loading') {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500" aria-label="Loading..."></div>
    </div>;
  }

  if (status === 'unauthenticated') {
    router.push('/login');
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
      router.push('/');
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
      <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
        Create New Post
      </h1>
      <p className="mt-5 text-xl text-gray-500">Share your latest video content with the world.</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {/* Form fields remain the same */}
      </form>
    </div>
  );
}
