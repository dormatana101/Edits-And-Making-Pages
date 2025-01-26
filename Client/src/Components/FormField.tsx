import React, { forwardRef } from "react";

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  isTextArea?: boolean;
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
  className?: string;
}

const FormField = forwardRef<HTMLTextAreaElement, FormFieldProps>(
  ({ label, value, onChange, isTextArea, textareaRef, className }, ref) => {
    return (
      <div className={`form-field ${isTextArea ? "textarea-field" : "input-field"} ${className || ""}`}>
        <label>{label}</label>
        {isTextArea ? (
          <textarea
            ref={textareaRef || ref}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`textarea ${className || ""}`}
            rows={3} 
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`input ${className || ""}`}
          />
        )}
      </div>
    );
  }
);

export default FormField;
