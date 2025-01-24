import React from "react";

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  isTextArea?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({ label, value, onChange, isTextArea = false }) => {
  return (
    <div className="form-field">
      <label>{label}</label>
      {isTextArea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={5}
          className="post-content"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="post-title"
        />
      )}
    </div>
  );
};

export default FormField;
