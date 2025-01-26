import React, { useRef, useEffect } from "react";
import "../css/CommentForm.css"; 

interface CommentFormProps {
  newComment: string;
  setNewComment: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: (event: React.FormEvent) => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ newComment, setNewComment, onSubmit }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewComment(e.target.value);
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
    <form onSubmit={onSubmit} className="comment-form">
      <textarea
        ref={textareaRef}
        value={newComment}
        onChange={handleTextareaChange}
        placeholder="Add a comment..."
        required
        className="auto-resize"
      ></textarea>
      <button type="submit">Post Comment</button>
    </form>
  );
};

export default CommentForm;
