import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../Css/Register.css';
import SERVER_URL from "../config"; 


const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Please enter a username.';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Your username must be at least 3 characters long.';
    }

    if (!formData.email) {
      newErrors.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'The email address format is invalid.';
    }

    if (!formData.password) {
      newErrors.password = 'Please create a password.';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Your password must be at least 8 characters long.';
    } else if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password)) {
      newErrors.password =
        'Your password must include at least one letter, one number, and one special character.';
    }

    if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'The passwords you entered do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      try {
        const response = await fetch(`${SERVER_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password,
          }),
        });

        if (response.ok) {
          setSuccessMessage('Registration successful! Redirecting to login...');
          setFormData({
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
          });
          setErrors({});
          setTimeout(() => navigate('/login'), 3000); 
        } else {
          const errorData = await response.json();
          if (errorData.message.includes('Email')) {
            setErrors({ email: 'This email is already registered.' });
          } else if (errorData.message.includes('Username')) {
            setErrors({ username: 'This username is already taken.' });
          } else {
            setErrors({ server: errorData.message || 'Registration failed' });
          }
        }
      } catch (error) {
        console.error('Error during registration:', error);
        setErrors({ server: 'Something went wrong. Please try again later.' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="fullscreen-bg">
      <div className="register-container">
        <h2 className="Headline">Register</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
            {errors.username && <p className="error">{errors.username}</p>}
          </div>

          <div>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <p className="error">{errors.email}</p>}
          </div>

          <div>
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <p className="error">{errors.password}</p>}
          </div>

          <div>
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && (
              <p className="error">{errors.confirmPassword}</p>
            )}
          </div>

          {errors.server && <p className="error">{errors.server}</p>}
          {successMessage && <p className="success">{successMessage}</p>}

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register'}
          </button>
          <p>
           Already have an account? <Link to="/login">Login here</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
