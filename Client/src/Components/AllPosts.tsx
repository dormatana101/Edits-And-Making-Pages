import { useEffect, useState } from "react";
import { fetchPosts } from "../Services/postsService";
import { Post } from "../types/post";
import PostCard from "./PostCard"; 
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

  return (
    <div className="container-allPosts">
      <div className="all-posts">
        <h2>All Posts</h2>
        {posts.length > 0 ? (
          posts.map((post) => <PostCard key={post._id} post={post} />)
        ) : (
          <p>No posts available</p>
        )}
      </div>
    </div>
  );
};

export default AllPosts;
