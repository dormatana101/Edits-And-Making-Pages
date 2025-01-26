import { useEffect, useState } from "react";
import { fetchPosts } from "../Services/postsService";
import { Post } from "../types/post";
import PostCard from "./PostCard";
import "../css/AllPosts.css";

const AllPosts = () => {
  const [posts, setPosts] = useState<Post[]>([]); // Posts list
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  const [error, setError] = useState<string | null>(null); // Error message
  const [page, setPage] = useState<number>(1); // Current page
  const [hasMore, setHasMore] = useState<boolean>(true); // Whether more posts are available

  // Fetch posts whenever the page changes
  useEffect(() => {
    const getPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchPosts<Post>(page, 10); // Fetch 10 posts per page

        if (result.success) {
          setPosts((prevPosts) => {
            // Append only new posts (avoid duplicates)
            const newPosts = result.data?.filter(
              (post) => !prevPosts.some((prevPost) => prevPost._id === post._id)
            );
            return [...prevPosts, ...(newPosts || [])];
          });

          // Check if there is a next page
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
  }, [page]); // Trigger only when `page` changes

  // Infinite scroll logic
  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

      // Check if the user scrolled close to the bottom
      if (
        scrollHeight - scrollTop - clientHeight < 100 && // Within 100px from bottom
        !loading && // Not already loading posts
        hasMore // More posts are available
      ) {
        setPage((prevPage) => prevPage + 1); // Load the next page
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll); // Cleanup on unmount
  }, [loading, hasMore]); // Re-run when loading or hasMore changes

  return (
    <div className="container-allPosts">
      <div className="all-posts">
        <h2>All Posts</h2>

        {/* Error message */}
        {error && <p className="error">{error}</p>}

        {/* Post list */}
        {posts.length > 0 ? (
          posts.map((post) => <PostCard key={post._id} post={post} />)
        ) : (
          <p>No posts available</p>
        )}

        {/* Loading spinner */}
        {loading && <p>Loading more posts...</p>}

        {/* End of posts */}
        {!hasMore && !loading && posts.length > 0 && (
          <p>No more posts available.</p>
        )}

        {/* No posts */}
        {!loading && posts.length === 0 && !error && <p>No posts available.</p>}
      </div>
    </div>
  );
};

export default AllPosts;
