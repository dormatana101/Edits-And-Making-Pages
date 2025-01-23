import { useEffect, useState } from "react";
import { fetchPosts } from "../Services/postsService";
import { Post } from "../types/post";
import "../css/AllPosts.css";

const AllPosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const getPosts = async () => {
      const result = await fetchPosts();
      if (result.success) {
        setPosts(result.data);
      } else {
        console.error(result.message);
      }
    };
    getPosts();
  }, []);

  const formatDate = (timestamp?: Date) => {
    if (!timestamp) {
      return "No date available";
    }
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="container">
      <div className="all-posts">
        <h2>All Posts</h2>
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post._id} className="post">
              <h3>{post.title}</h3>
              <p>{post.content}</p>
              {post.image && (
                <img src={post.image} alt="Post image" className="post-image" />
              )}
              <small>By: {post.author}</small>
              <p className="post-timestamp">{formatDate(post.createdAt)}</p>
            </div>
          ))
        ) : (
          <p>No posts available</p>
        )}
      </div>
    </div>
  );
};

export default AllPosts;
