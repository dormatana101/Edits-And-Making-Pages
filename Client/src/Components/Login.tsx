import '../css/Login.css';
import React, { useState } from 'react';
import EaseLogo from '../images/EaseLogo.png';
import { useNavigate, Link } from 'react-router-dom'; // Импорт Link
import { IoLockClosedOutline } from "react-icons/io5";
import { RxAvatar } from "react-icons/rx";
import { FcGoogle } from "react-icons/fc";

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Login successful:', data);
        navigate('/dashboard');
      } else {
        console.error('Login failed:', data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <div className="container">
        <div className="left">
          <div className="form-container">
            <h1>LOGIN</h1>
            <p>How do I get started with Ease?</p>
            <div className="input-container">
              <RxAvatar className="input-icon" />
              <input
                type="text"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="input-container">
              <IoLockClosedOutline className="input-icon" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button onClick={handleLogin}>Login Now</button>
            <div className="footer">
              <p>
                Don't have an account? <Link to="/register">Register here</Link>
              </p>
              <p>or Sign in with</p>
              <button className="google-login">
                <FcGoogle className="google-icon" />Google
              </button>
            </div>
            <img src={EaseLogo} alt="Logo" className="EaseLogo" />
          </div>
        </div>
        <div className="right">
          <div className="text-box">
            <p>Empowering</p>
            <p>Therapists</p>
            <p>Transforming</p>
            <p>Lives</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
