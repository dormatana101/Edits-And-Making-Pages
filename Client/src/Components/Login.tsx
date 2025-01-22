import "../css/Login.css";
import React, { useState, useEffect } from "react";
import EaseLogo from "../images/EaseLogo.png";
import { useNavigate, Link } from "react-router-dom"; 
import { IoLockClosedOutline } from "react-icons/io5";
import { RxAvatar } from "react-icons/rx";
import { FcGoogle } from "react-icons/fc";
import { login } from "../Services/authService";
import { validateEmail, validatePassword } from "../utiles/Login_validation"; 

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add("login-page");
    return () => {
      document.body.classList.remove("login-page");
    };
  }, []);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateEmail(email)) {
        setErrorMessage('Invalid Email Address');
        setTimeout(() => setErrorMessage(''), 3000);
        return;
    }

    if (!validatePassword(password)) {
        setErrorMessage('Password must be at least 6 characters long');
        setTimeout(() => setErrorMessage(''), 3000);
        return;
    }

    setErrorMessage('');

    const result = await login(email, password);

    if (result.success) {
        localStorage.setItem('accessToken', result.accessToken);
        localStorage.setItem('username', result.data.username);

        navigate('/dashboard');
    } else {
        setErrorMessage(result.message);
        setTimeout(() => setErrorMessage(''), 2000);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleLogin(event); 
    }
  };

  return (
    <div className="login-page">
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
                onKeyDown={handleKeyDown} 
              />
            </div>
            <div className="input-container">
              <IoLockClosedOutline className="input-icon" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown} 
              />
            </div>
            <button className="login-button" onClick={handleLogin}>Login Now</button>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <div className="footer">
              <p>
                Don't have an account? <Link to="/register">Register here</Link>
              </p>
              <p>or Sign in with</p>
              <button className="google-login">
                <FcGoogle className="google-icon" />
                Google
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
