import { VideoPost } from "@/components/VideoPost";

export default function Home() {
  // This is a placeholder. We'll fetch real data from Supabase later.
  const posts = [
    { id: 1, title: "First Video", description: "This is the first video" },
    { id: 2, title: "Second Video", description: "This is the second video" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Latest Videos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <VideoPost key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
