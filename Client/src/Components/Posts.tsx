import React, { useEffect, useState } from "react";
import { fetchPosts } from "../Services/postsService"; 

const Posts: React.FC = () => {
  interface Post {
    _id: string;
    title: string;
    content: string;
    authorId: string;
    timestamp: string;
  }

  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const getPosts = async () => {
      const result = await fetchPosts();
      setPosts(result.data);
    };
    getPosts();
  }, []);

  return (
    <div className="posts-container">
      <h2>All Posts</h2>
      {posts.length === 0 ? (
        <p>No posts available.</p>
      ) : (
        posts.map((post: Post) => (
          <div key={post._id} className="post">
            <h3>{post.title}</h3>
            <p>{post.content}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default Posts;
