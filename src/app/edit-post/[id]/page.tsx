'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { createClient } from '@supabase/supabase-js';

interface Post {
  id: number;
  title: string;
  description: string;
  thumbnail_url: string;
}

export default function EditPost({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    const fetchPost = async () => {
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
      setThumbnailUrl(data.thumbnail_url);
      setLoading(false);
    };

    fetchPost();
  }, [params.id, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

    const { error } = await supabase
      .from('posts')
      .update({ title, description, thumbnail_url: thumbnailUrl })
      .eq('id', params.id);

    if (error) {
      setError('Failed to update post');
      return;
    }

    router.push('/my-posts');
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
          <label htmlFor="thumbnailUrl" className="block mb-2">Thumbnail URL:</label>
          <input
            type="url"
            id="thumbnailUrl"
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Update Post
        </button>
      </form>
    </div>
  );
}
