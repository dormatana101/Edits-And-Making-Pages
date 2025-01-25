import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaRegComment } from "react-icons/fa";
import { Post } from "../types/post";
import { toggleLike } from "../Services/postsService";
import { formatDate } from "../utiles/formatDate";
import "../css/AllPosts.css";

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [likesCount, setLikesCount] = useState<number>(post.likesCount || 0);
  const [isLiked, setIsLiked] = useState<boolean>(false);

  const handleLikeClick = async () => {
    try {
      const response = await toggleLike(post._id);
      if (response.success) {
        setLikesCount(response.data.likesCount);
        setIsLiked(!isLiked);
      } else {
        console.error(response.message);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
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
        <button onClick={handleLikeClick}>
          {isLiked ? "Unlike" : "Like"} ({likesCount})
        </button>
      </div>

      <Link to={`/post/${post._id}`} className="comments-section">
        <span className="comments-count">
          {post.comments?.length ?? 0} comments
        </span>
        <FaRegComment className="comment-icon" />
      </Link>
    </div>
  );
};

export default PostCard;
