import React, { useState, useRef, useEffect } from "react";
import { createPost } from "../Services/postsService"; 
import FormField from "../Components/FormField"; 
import "../css/CreatePost.css";

const CreatePost: React.FC = () => {
  const [newPostContent, setNewPostContent] = useState<string>("");
  const [newPostTitle, setNewPostTitle] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState<string>("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleCreatePost = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!newPostContent || !newPostTitle) {
      setError("Please fill in both title and content!");
      return;
    }

    try {
      const response = await createPost(newPostTitle, newPostContent);
      
      if (response.success) {
        setNewPostContent("");
        setNewPostTitle("");
        setConfirmationMessage("Post created successfully!");
        setTimeout(() => setConfirmationMessage(""), 3000);
        setError(null);
      } else {
        setError(response.message || "Error creating post");
      }
    } catch {
      setError("An error occurred. Please try again later.");
    }
  };

  const handleTextareaChange = (value: string) => {
    setNewPostContent(value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  return (
    <div className="container">
      <div className="posts-container">
        <div className="create-post-form-container">
          <h2>Create Post</h2>
          {confirmationMessage && (
            <div className="confirmation-message">{confirmationMessage}</div>
          )}
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleCreatePost} className="create-post-form">
            <FormField
              label="Post Title"
              value={newPostTitle}
              onChange={setNewPostTitle}
            />
            <FormField
              label="Write your post..."
              value={newPostContent}
              onChange={handleTextareaChange}
              isTextArea
              textareaRef={textareaRef}
              className="auto-resize" 
            />
            <button type="submit" className="create-post-button">
              Create Post
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
