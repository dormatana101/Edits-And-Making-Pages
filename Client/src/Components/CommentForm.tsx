// CommentForm.tsx
import React, { useRef, useEffect } from "react";
import "../css/CommentForm.css"; // Импортируем стили

interface CommentFormProps {
  newComment: string;
  setNewComment: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: (event: React.FormEvent) => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ newComment, setNewComment, onSubmit }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Функция для автоматического увеличения высоты textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewComment(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // Устанавливаем начальную высоту при монтировании компонента
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
