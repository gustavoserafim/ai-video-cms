'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Session } from 'next-auth';
import { createClient } from '@supabase/supabase-js';
import { getValidSession, getPrivateMediaUrl } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import SupabaseImage from '@/components/SupabaseImage';
import SupabaseVideo from '@/components/SupabaseVideo';

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

export default function EditPost({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const session = await getValidSession() as CustomSession;
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

        if (error) throw error;

        setPost(data);
        setTitle(data.title);
        setDescription(data.description);

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
  }, [params.id]);

  const uploadFile = async (file: File, bucket: string) => {
    const session = await getValidSession() as CustomSession;
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
    const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) throw error;
    return fileName;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const session = await getValidSession() as CustomSession;
      if (!session?.user?.id || !session?.accessToken) {
        throw new Error('No user ID or access token available');
      }

      let thumbnailFileName = post?.thumbnail_url;
      let videoFileName = post?.video_url;

      if (thumbnailFile) {
        thumbnailFileName = await uploadFile(thumbnailFile, 'image') as string;
      }

      if (videoFile) {
        videoFileName = await uploadFile(videoFile, 'video') as string;
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
        .update({
          title,
          description,
          thumbnail_url: thumbnailFileName,
          video_url: videoFileName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.id)
        .eq('user_id', session.user.id)
        .select();

      if (error) throw error;

      router.push('/my-posts');
    } catch (error) {
      setError('Failed to update post');
      console.error('Error updating post:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!post) return <div>Post not found</div>;

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Edit Post</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block mb-2">Title:</label>
            <Input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block mb-2">Description:</label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="thumbnail" className="block mb-2">Thumbnail:</label>
            <Input
              type="file"
              id="thumbnail"
              accept="image/*"
              onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
            />
            {post.thumbnail_url && (
              <SupabaseImage
                imagePath={post.thumbnail_url}
                alt="Current thumbnail"
                width={128}
                height={128}
                className="mt-2 object-cover"
              />
            )}
          </div>
          <div>
            <label htmlFor="video" className="block mb-2">Video:</label>
            <Input
              type="file"
              id="video"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
            />
            {post.video_url && (
              <SupabaseVideo
                videoPath={post.video_url}
                className="mt-2 w-full max-w-md"
              />
            )}
          </div>
          <div className="flex justify-between">
            <Button type="submit">Update Post</Button>
            <Button type="button" variant="outline" onClick={() => router.push('/my-posts')}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}