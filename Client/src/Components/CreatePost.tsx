import React, { useState, useRef, useEffect } from "react";
import { createPost } from "../Services/postsService"; 
import { AiFillPicture } from "react-icons/ai";
import { FaTimes } from "react-icons/fa";

import FormField from "../Components/FormField"; 
import "../css/CreatePost.css";

const CreatePost: React.FC = () => {
  const [newPostContent, setNewPostContent] = useState<string>("");
  const [newPostTitle, setNewPostTitle] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);


  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleCreatePost = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!newPostContent || !newPostTitle) {
      setError("Please fill in both title and content!");
      return;
    }

    try {
      const response = await createPost(newPostTitle, newPostContent, image);
      
      if (response.success) {
        setNewPostContent("");
        setNewPostTitle("");
        setImagePreview(null);
        setImage(null);
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
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
          <label>Post Image</label>

          <div className="image-upload-icon" onClick={() => document.getElementById('fileInput')?.click()}>
              <AiFillPicture size={30} />
              </div>
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
             <div className="form-field">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
                className="input-file"
                id="fileInput"
              />
               
               {imagePreview && (
                <div className="image-preview-container">
                  <img src={imagePreview} alt="Selected" className="image-preview" />
                  <button type="button" className="remove-image-button" onClick={handleRemoveImage}>
                    <FaTimes />
                  </button>
                </div>
              )}

            </div>
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
