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
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, thumbnail_url')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

export default async function MyPosts() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect('/login');
  }

  try {
    console.log('Session:', session);
    const posts = await getPosts(session.user.id);
    console.log('Posts:', posts);
    return <MyPostsClient initialPosts={posts} />;
  } catch (error) {
    console.error('Error in MyPosts:', error);
    console.log('Session:', session);
    return <div>Error loading posts. Please try again later.</div>;
  }
}
