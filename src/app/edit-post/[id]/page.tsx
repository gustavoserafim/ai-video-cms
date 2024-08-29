'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { createClient } from '@supabase/supabase-js';
import { getValidSession, getPrivateMediaUrl } from "@/lib/utils";
import Image from 'next/image';

interface Post {
  id: number;
  title: string;
  description: string;
  thumbnail_url: string;
  video_url: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export default function EditPost({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const session = await getValidSession();
        if (!session?.accessToken) return;

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
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) {
          setError('Failed to fetch post');
          setLoading(false);
          return;
        }

        setPost(data);
        setTitle(data.title);
        setDescription(data.description);
        setLoading(false);

        if (data.thumbnail_url) {
          const thumbnailData = await getPrivateMediaUrl(data.thumbnail_url, 'image');
          setThumbnailUrl(thumbnailData.url);
        }
        if (data.video_url) {
          const videoData = await getPrivateMediaUrl(data.video_url, 'video');
          setVideoUrl(videoData.url);
        }
      } catch (error) {
        if (error.message === 'Your session has expired. Please sign in again.') {
          router.push('/login');
        } else {
          setError('Failed to fetch post');
        }
        setLoading(false);
      }
    };

    fetchPost();
  }, [params.id, router]);

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

    return fileName;
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const session = await getValidSession();
      if (!session?.user?.id || !session?.accessToken) {
        throw new Error('No user ID or access token available');
      }

      let thumbnailFileName = post?.thumbnail_url;
      let videoFileName = post?.video_url;

      if (thumbnailFile) {
        thumbnailFileName = await uploadFile(thumbnailFile, 'image');
      }

      if (videoFile) {
        videoFileName = await uploadFile(videoFile, 'video');
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

      const updateData = {
        title,
        description,
        thumbnail_url: thumbnailFileName,
        video_url: videoFileName,
        updated_at: new Date().toISOString(),
        user_id: session.user.id
      };

      console.log('Updating post with data:', updateData);
      console.log('Post ID:', params.id);
      console.log('User ID:', session.user.id);

      const { data, error } = await supabase
        .from('posts')
        .update(updateData)
        .eq('id', params.id)
        .eq('user_id', session.user.id)
        .select();

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('No rows were updated');
      }

      router.push('/my-posts');
    } catch (error) {
      if (error instanceof Error) {
        setError(`Failed to update post: ${error.message}`);
      } else {
        setError('Failed to update post: Unknown error');
      }
      console.error('Error updating post:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!post) return <div>Post not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Edit Post</h1>
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
          <label htmlFor="thumbnail" className="block mb-2">Thumbnail:</label>
          <input
            type="file"
            id="thumbnail"
            accept="image/*"
            onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
            className="w-full p-2 border rounded"
          />
          {post?.thumbnail_url && thumbnailUrl && (
            <Image 
              src={thumbnailUrl} 
              alt="Current thumbnail" 
              width={128} 
              height={128} 
              className="mt-2 object-cover" 
              unoptimized
            />
          )}
        </div>
        <div>
          <label htmlFor="video" className="block mb-2">Video:</label>
          <input
            type="file"
            id="video"
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
            className="w-full p-2 border rounded"
          />
          {post?.video_url && videoUrl && (
            <video src={videoUrl} controls className="mt-2 w-full max-w-md" />
          )}
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Update Post
        </button>
      </form>
    </div>
  );
}
