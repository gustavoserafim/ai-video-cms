import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { supabase } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import MyPostsClient from '@/components/MyPostsClient';

interface Post {
  id: number;
  title: string;
  thumbnail_url: string;
}

async function getPosts(userId: string): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('id, title, thumbnail_url')
    .eq('user_id', userId);

  if (error) throw error;
  return data || [];
}

export default async function MyPosts() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect('/login');
  }

  const posts = await getPosts(session.user.id);

  return <MyPostsClient initialPosts={posts} />;
}
