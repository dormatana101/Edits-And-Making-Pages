import React, { useState, useEffect } from "react";
import { fetchPosts } from "../Services/postsService"; 
import "../css/Posts.css"; // Добавляем стили для постов

const Posts: React.FC = () => {
  interface Post {
    _id: string;
    title: string;
    content: string;
    authorId: string;
    timestamp: string;
  }

  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState<string>("");
  const [newPostTitle, setNewPostTitle] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Получение постов с сервера
  useEffect(() => {
    const getPosts = async () => {
      const result = await fetchPosts();
      setPosts(result.data);
    };
    getPosts();
  }, []);

  // Обработчик для изменений в контенте и заголовке
  const handleNewPostChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewPostContent(event.target.value);
  };

  const handleNewPostTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
          senderId: localStorage.getItem("username"),  // если есть в localStorage
        }),
      });

      const data = await response.json();
      if (response.status === 201) {
        setNewPostContent("");
        setNewPostTitle("");
        setPosts([data.post, ...posts]); // Добавляем новый пост в начало списка
        setError(null); // Очистить ошибку
      } else {
        setError(data.message || "Error creating post");
      }
    } catch {
      setError("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="posts-container">
      <h2>All Posts</h2>
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

      {/* Ошибка, если что-то не так */}
      {error && <p className="error-message">{error}</p>}

      <div className="posts-list">
        {posts.length === 0 ? (
          <p>No posts available.</p>
        ) : (
          posts.map((post: Post) => (
            <div key={post._id} className="post-item">
              <h3>{post.title}</h3>
              <p>{post.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Posts;
