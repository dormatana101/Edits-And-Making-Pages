import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { fetchPostById, postComment } from "../Services/postsService";
import { fetchCommentsByPostId } from "../Services/commentsService";
import { Post } from "../types/post";
import { Comment } from "../types/comment";
import CommentForm from "../Components/CommentForm";
import "../css/PostDetails.css";

const PostDetails = () => {
  const { postId } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastCommentRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    const fetchComments = async () => {
      if (!hasMore || loading) return; 
      setLoading(true);

      try {
        const result = await fetchCommentsByPostId(postId!, page, 10); 

        setComments((prevComments) => {
          const newComments = result.data || [];
          const uniqueComments = newComments.filter(
            (comment) => !prevComments.some((prev) => prev._id === comment._id)
          );
          return [...prevComments, ...uniqueComments];
        });

        setHasMore(Boolean(result.next)); 
      } catch (err) {
        console.error("Error loading comments", err);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [page, postId, hasMore, loading]);

  useEffect(() => {
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        setPage((prevPage) => prevPage + 1);
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
    if (!newComment) return;

    try {
      const comment = await postComment(postId!, newComment);
      setComments((prev) => [comment, ...prev]); 
      setNewComment("");
    } catch (err) {
      console.error("Error posting comment", err);
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
        {post.image && <img src={post.image} alt="Post" className="post-image" />}
        <small>By: {post.author}</small>
        <p className="post-timestamp">{new Date(post.createdAt).toLocaleString()}</p>
      </div>

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
          {loading && <p>Loading more comments...</p>}
          {!hasMore && <p>No more comments available.</p>}
        </div>
        <div className="comment-form-container">
          <CommentForm
            newComment={newComment}
            setNewComment={setNewComment}
            onSubmit={handleCommentSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default PostDetails;
