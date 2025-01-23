import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchPostById, fetchCommentsByPostId, postComment } from "../Services/postsService"; 
import { Post } from "../types/post"; 
import { Comment } from "../types/coment"; 
import CommentForm from "../Components/CommentForm"; 
import "../css/PostDetails.css";

const PostDetails = () => {
  const { postId } = useParams(); 
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>("");

  useEffect(() => {
    const getPost = async () => {
      try {
        const postResult = await fetchPostById(postId!); 
        setPost(postResult);
        const commentsResult = await fetchCommentsByPostId(postId!); 
        setComments(commentsResult);
      } catch (err) {
        console.error("Error loading post", err);
      }
    };
    getPost();
  }, [postId]);

  const handleCommentSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!newComment) return; 

    try {
      const comment = await postComment(postId!, newComment); 
      setComments((prev) => [...prev, comment]);
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
        <small>By: {post.author}</small>
        <p>{post.createdAt ? new Date(post.createdAt).toLocaleString() : "Unknown date"}</p>
        
        <div className="comments-section">
          <h3>Comments</h3>
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment._id.toString()} className="comment">
                <p><strong>{comment.author}</strong>: {comment.content}</p>
              </div>
            ))
          ) : (
            <p>No comments yet.</p>
          )}

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
