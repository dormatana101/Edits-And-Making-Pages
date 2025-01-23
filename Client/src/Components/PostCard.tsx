import React from "react";
import { Link } from "react-router-dom";
import { FaRegComment } from "react-icons/fa"; 
import { Post } from "../types/post";
import { formatDate } from "../utiles/formatDate";
import "../css/AllPosts.css";

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  return (
    <div className="post">
      <h3>{post.title}</h3>
      <p>{post.content}</p>
      {post.image && <img src={post.image} alt="Post image" className="post-image" />}
      <small>By: {post.author}</small>
      <p className="post-timestamp">{formatDate(post.createdAt)}</p>

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
