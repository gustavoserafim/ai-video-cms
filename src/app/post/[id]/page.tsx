'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Session } from 'next-auth';
import { createClient } from '@supabase/supabase-js';
import { getValidSession, getPrivateMediaUrl } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import SupabaseImage from '@/components/SupabaseImage';
import SupabaseVideo from '@/components/SupabaseVideo';
// import { Separator } from "@/components/ui/separator";

interface CustomSession extends Session {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  accessToken: string;
}

interface Post {
  id: number;
  title: string;
  description: string;
  thumbnail_url: string;
  video_url: string;
  user_id: string;
}

export default function ViewPost({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const session = await getValidSession() as CustomSession;
        if (!session?.accessToken) {
          router.push('/login');
          return;
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
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) throw error;

        setPost(data);

        if (data.video_url) {
          const videoData = await getPrivateMediaUrl(data.video_url, 'video');
          if (videoData) setVideoUrl(videoData.url);
        }
      } catch (error) {
        setError('Failed to fetch post');
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [params.id, router]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!post) return <div>Post not found</div>;

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{post.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {post.thumbnail_url && (
          <SupabaseImage
            imagePath={post.thumbnail_url}
            alt={post.title} 
            width={100} 
            height={56} 
            className="rounded"
          />
        )}
        {/* <Separator /> */}
        {post.video_url && (
          <SupabaseVideo
            videoPath={post.video_url}
            className="w-full rounded-lg"
          />
        )}
        {/* <Separator /> */}
        <div className="prose max-w-none">
          <h3 className="text-lg font-semibold">Description</h3>
          <p>{post.description}</p>
        </div>
      </CardContent>
    </Card>
  );
}