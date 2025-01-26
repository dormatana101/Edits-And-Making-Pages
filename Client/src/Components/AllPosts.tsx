import { useEffect, useState } from "react";
import { fetchPosts } from "../Services/postsService";
import { Post } from "../types/post";
import PostCard from "./PostCard";

const AllPosts = () => {
  const [posts, setPosts] = useState<Post[]>([]); 
  const [loading, setLoading] = useState<boolean>(false); 
  const [error, setError] = useState<string | null>(null); 
  const [page, setPage] = useState<number>(1); 
  const [hasMore, setHasMore] = useState<boolean>(true); 

  useEffect(() => {
    const getPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchPosts<Post>(page, 10);

        if (result.success) {
          setPosts((prevPosts) => [
            ...prevPosts,
            ...(result.data || []).filter(
              (post) => !prevPosts.some((prevPost) => prevPost._id === post._id)
            ),
          ]);
          setHasMore(Boolean(result.next));
        } else {
          setError(result.message || "An error occurred while fetching posts.");
        }
      } catch {
        setError("Failed to load posts. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    getPosts();
  }, [page]); 

  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

      if (
        scrollHeight - scrollTop - clientHeight < 100 &&
        !loading &&
        hasMore
      ) {
        setPage((prevPage) => prevPage + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll); 
  }, [loading, hasMore]);

  return (
      <div className="all-posts">
        <h2>All Posts</h2>
        {error && <p className="error">{error}</p>}
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
        {loading && <p>Loading...</p>}
        {!hasMore && !loading && <p>No more posts available.</p>}
      </div>
  );
};

export default AllPosts;
