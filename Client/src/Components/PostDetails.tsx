import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { fetchPostById, postComment } from "../Services/postsService";
import { fetchCommentsByPostId } from "../Services/commentsService"; // New service for paginated comments
import { Post } from "../types/post";
import { Comment } from "../types/comment";
import CommentForm from "../Components/CommentForm";
import "../css/PostDetails.css";
import { set } from "mongoose";

const PostDetails = () => {
  const { postId } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const observer = useRef<IntersectionObserver | null>(null);

  // Fetch post details
  useEffect(() => {
    const getPost = async () => {
      try {
        const postResult = await fetchPostById(postId!);
        setPost(postResult);
      } catch (err) {
        console.error("Error loading post", err);
      }
    };

    getPost();
  }, [postId]);

  // Fetch paginated comments
  useEffect(() => {
    const fetchComments = async () => {
      if (!hasMore || loading) return; // Prevent fetching if already loading or no more comments
      setLoading(true);
  
      try {
        const result = await fetchCommentsByPostId(postId!, page, 5); // Fetch 5 comments per page
  
        setComments((prevComments) => {
          const newComments = result.data || [];
          const uniqueComments = newComments.filter(
            (comment) => !prevComments.some((prev) => prev._id === comment._id) // Avoid duplicates
          );
          return [...prevComments, ...uniqueComments];
        });
  
        setHasMore(Boolean(result.next)); // Check if there are more comments
      } catch (err) {
        console.error("Error loading comments", err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchComments();
  }, [page, postId]); 

  const lastCommentRef = useRef<HTMLDivElement | null>(null);


  useEffect(() => {
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        setPage((prevPage) => prevPage + 1); // Load the next page
      }
    });

    if (lastCommentRef.current) {
      observer.current.observe(lastCommentRef.current);
    }

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [hasMore, loading]);

  const handleCommentSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); 
    if (loading || !newComment.trim()) return;
  
    setLoading(true); 
    try {
      const comment = await postComment(postId!, newComment.trim()); 
      setComments((prev) => [comment, ...prev]);
      setNewComment(""); 
    } catch (err) {
      console.error("Error posting comment", err);
    } finally {
      setLoading(false); 
    }
  };

  if (!post) {
    return <p>Loading post...</p>;
  }

  return (
    <div className="post-details">
      <div className="post">
        <h2>{post.title}</h2>
        <p>{post.content}</p>
        <small>By: {post.author}</small>
        <p>{post.createdAt ? new Date(post.createdAt).toLocaleString() : "Unknown date"}</p>

        <div className="comments-section-postDetails">
          <h3>Comments</h3>
          <div className="comments-list">
            {comments.map((comment, index) => (
              <div
                key={comment._id.toString()}
                ref={index === comments.length - 1 ? lastCommentRef : null}
                className="comment"
              >
                <p>
                  <strong>{comment.author}</strong>: {comment.content}
                </p>
              </div>
            ))}
          </div>
          <CommentForm newComment={newComment} setNewComment={setNewComment} onSubmit={handleCommentSubmit} />
        </div>
      </div>
    </div>
  );
};

export default PostDetails;