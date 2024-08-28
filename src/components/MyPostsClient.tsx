'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

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
    return (
      <Card className="w-full max-w-4xl mx-auto mt-8">
        <CardContent className="p-6">
          <div className="text-center">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (posts.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto mt-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">My Posts</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p>You haven't created any posts yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">My Posts</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Thumbnail</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell>
                  {post.thumbnail_url && (
                    <Image 
                      src={post.thumbnail_url} 
                      alt={post.title} 
                      width={100} 
                      height={56} 
                      className="rounded" 
                      unoptimized
                    />
                  )}
                </TableCell>
                <TableCell className="font-medium">{post.title}</TableCell>
                <TableCell>
                  <div className="space-x-2">
                    <Button variant="outline" asChild>
                      <Link href={`/post/${post.id}`}>View</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href={`/edit-post/${post.id}`}>Edit</Link>
                    </Button>
                    <Button variant="destructive" onClick={() => handleDelete(post.id)}>
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
