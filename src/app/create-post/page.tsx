'use client';

import React, { useState, FormEvent, useCallback } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import toast, { Toaster } from 'react-hot-toast';
import { createClient } from '@supabase/supabase-js';

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
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
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

  const uploadFile = useCallback(async (file: File, bucket: string) => {
    if (!session?.accessToken || !session.user?.id) return null;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        },
      }
    );

    const fileExt = file.name.split('.').pop();
    const timestamp = new Date().getTime();
    const fileName = `${session.user.id}/${timestamp}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) {
      throw error;
    }

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  }, [session]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title || !description || !videoFile) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!session?.accessToken || !session.user?.id) {
      toast.error('No access token or user ID available');
      return;
    }

    try {
      let thumbnailUrl = null;
      let videoUrl = null;

      if (thumbnailFile) {
        thumbnailUrl = await uploadFile(thumbnailFile, 'image');
      }

      if (videoFile) {
        videoUrl = await uploadFile(videoFile, 'video');
      }

      if (!videoUrl) {
        throw new Error('Failed to upload video');
      }

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          },
        }
      );

      const { data, error } = await supabase
        .from('posts')
        .insert({
          title,
          description,
          thumbnail_url: thumbnailUrl,
          video_url: videoUrl,
          user_id: session.user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select();

      if (error) throw error;

      toast.success('Post created successfully!');
      router.push('/my-posts');
    } catch (error) {
      console.error('Error creating post:', error);
      let errorMessage = 'An unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = String(error.message);
      }
      toast.error('Error creating post: ' + errorMessage);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster />
      <h1 className="text-2xl font-bold mb-4">Create New Post</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block mb-2">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block mb-2">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label htmlFor="thumbnail" className="block mb-2">Thumbnail (optional):</label>
          <input
            type="file"
            id="thumbnail"
            accept="image/*"
            onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="video" className="block mb-2">Video:</label>
          <input
            type="file"
            id="video"
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Create Post
        </button>
      </form>
    </div>
  );
}
