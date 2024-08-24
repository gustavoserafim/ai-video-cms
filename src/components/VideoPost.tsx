import React from 'react';

interface Post {
  id: number;
  title: string;
  description: string;
}

export const VideoPost: React.FC<{ post: Post }> = ({ post }) => {
  return (
    <div className="border rounded-lg p-4 shadow-md">
      <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
      <p className="text-gray-600">{post.description}</p>
      {/* Add video player component here when implemented */}
    </div>
  );
};
