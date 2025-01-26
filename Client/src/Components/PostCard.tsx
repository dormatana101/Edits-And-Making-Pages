import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaRegComment, FaHeart } from "react-icons/fa";
import { Post } from "../types/post";
import { toggleLike } from "../Services/postsService";
import { formatDate } from "../utiles/formatDate";
import "../css/AllPosts.css";

interface PostCardProps {
  post: Post;
  likedPosts: string[]; // Array of liked post IDs
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [likesCount, setLikesCount] = useState<number>(post.likesCount || 0);
  const [isLiked, setIsLiked] = useState<boolean>(post.isLiked || false); 

  useEffect(() => {
    setIsLiked(post.isLiked || false); 
  }, [post.isLiked]);

  const handleLikeClick = async () => {
    try {
      const response = await toggleLike(post._id);
      if (response.success) {
        setLikesCount(response.data.likesCount); 
        setIsLiked(!isLiked); 
      }
    } catch (error) {
      console.error("An error occurred while toggling like:", error);
    }
  };

  return (
    <div className="post">
      <h3>{post.title}</h3>
      <p>{post.content}</p>
      {post.image && <img src={post.image} alt="Post image" className="post-image" />}
      <small>By: {post.author}</small>
      <p className="post-timestamp">{formatDate(post.createdAt)}</p>

      <div className="post-actions">
        <FaHeart
          className={`like-icon ${isLiked ? "liked" : ""}`} 
          onClick={handleLikeClick}
        />
        <span>{likesCount} {likesCount === 1 ? "like" : "likes"}</span>
        <Link to={`/post/${post._id}`} className="comments-section">
          <FaRegComment /> {post.comments ? post.comments.length : 0}{" "}
          {post.comments && post.comments.length === 1 ? "comment" : "comments"}
        </Link>
      </div>
    </div>
  );
};

export default PostCard;
