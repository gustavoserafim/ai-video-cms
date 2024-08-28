'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

interface Post {
  id: number;
  title: string;
  thumbnail_url: string;
}

export default function MyPostsClient() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
  const router = useRouter();
  const fetchedRef = useRef(false);

  const fetchPosts = useCallback(async () => {
    if (!session?.user?.id || fetchedRef.current) {
      console.log('Skipping fetch: No user ID or already fetched');
      return;
    }

    fetchedRef.current = true;
    setLoading(true);

    try {
      console.log('Initial session information:', session);

      // Use the access token directly from the session
      const token = session.accessToken;

      if (!token) {
        throw new Error('No access token found in session');
      }

      console.log('Access token obtained:', token);
      console.log('Fetching posts for user ID:', session.user.id);

      // Create a new Supabase client with the user's access token
      const supabaseWithAuth = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        }
      );

      // Use the new client with the correct authorization
      const { data, error, count } = await supabaseWithAuth
        .from('posts')
        .select('id, title, thumbnail_url', { count: 'exact' })
        .eq('user_id', session.user.id);

      if (error) throw error;

      console.log('Fetched posts:', data);
      console.log('Total count:', count);
      console.log('Full response:', { data, error, count });
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      fetchedRef.current = false;
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user) {
      fetchPosts();
    }
  }, [status, session, router, fetchPosts]);

  // Reset fetchedRef when component unmounts
  useEffect(() => {
    return () => {
      fetchedRef.current = false;
    };
  }, []);

  const handleDelete = async (postId: number) => {
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        const response = await fetch(`/api/posts/${postId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setPosts(posts.filter(post => post.id !== postId));
        } else {
          console.error('Failed to delete post');
        }
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (posts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">My Posts</h1>
        <p>You haven't created any posts yet.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4 text-zinc-800">My Posts</h1>
      <table className="min-w-full bg-zinc-50 shadow-md rounded-lg overflow-hidden">
        <thead className="bg-zinc-200">
          <tr>
            <th className="px-6 py-3 border-b border-zinc-300 text-left text-xs leading-4 font-medium text-zinc-600 uppercase tracking-wider">Thumbnail</th>
            <th className="px-6 py-3 border-b border-zinc-300 text-left text-xs leading-4 font-medium text-zinc-600 uppercase tracking-wider">Title</th>
            <th className="px-6 py-3 border-b border-zinc-300 text-left text-xs leading-4 font-medium text-zinc-600 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200">
          {posts.map((post) => (
            <tr key={post.id} className="hover:bg-zinc-100 transition-colors duration-200">
              <td className="px-6 py-4 whitespace-no-wrap">
                {post.thumbnail_url && (
                  <Image src={post.thumbnail_url} alt={post.title} width={100} height={56} className="rounded" />
                )}
              </td>
              <td className="px-6 py-4 whitespace-no-wrap">
                <div className="text-sm leading-5 font-medium text-zinc-900">{post.title}</div>
              </td>
              <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 font-medium">
                <Link href={`/post/${post.id}`} className="text-zinc-600 hover:text-zinc-900 mr-4">View</Link>
                <Link href={`/edit-post/${post.id}`} className="text-zinc-600 hover:text-zinc-900 mr-4">Edit</Link>
                <button onClick={() => handleDelete(post.id)} className="text-red-600 hover:text-red-900">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
