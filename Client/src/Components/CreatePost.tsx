import React, { useState } from "react";
import "../css/CreatePost.css"; // Добавляем стили для постов
import mongoose from "mongoose";

const CreatePost: React.FC = () => {
  interface Post {
    _id: string;
    title: string;
    content: string;
    author: string;
    createdAt?: Date;
    image?: string;
    comments?: mongoose.Schema.Types.ObjectId[];
  }

  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState<string>("");
  const [newPostTitle, setNewPostTitle] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState("");

  // Обработчик для изменений в контенте и заголовке
  const handleNewPostChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setNewPostContent(event.target.value);
  };

  const handleNewPostTitleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewPostTitle(event.target.value);
  };

  // Отправка нового поста
  const handleCreatePost = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newPostContent || !newPostTitle) {
      setError("Please fill in both title and content!");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({
          title: newPostTitle,
          content: newPostContent,
          author: localStorage.getItem("username"),
        }),
      });

      const data = await response.json();
      if (response.status === 201) {
        setNewPostContent("");
        setNewPostTitle("");
        setPosts([data.post, ...posts]);
        setConfirmationMessage("Post created successfully!");
        setTimeout(() => setConfirmationMessage(""), 3000);
        setError(null);
      } else {
        setError(data.message || "Error creating post");
      }
    } catch {
      setError("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="container">
      <div className="posts-container">
        <h2>All Posts</h2>
        {confirmationMessage && (
          <div className="confirmation-message">{confirmationMessage}</div>
        )}
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleCreatePost} className="create-post-form">
          <input
            type="text"
            placeholder="Post title"
            value={newPostTitle}
            onChange={handleNewPostTitleChange}
            className="post-title"
          />
          <textarea
            placeholder="Write your post..."
            value={newPostContent}
            onChange={handleNewPostChange}
            rows={5}
            className="post-content"
          />
          <button type="submit" className="create-post-button">
            Create Post
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
