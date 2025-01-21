import "../css/Login.css";
import React, { useState } from "react";
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

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    console.log('Login button clicked');
    console.log(`Email entered: ${email}`);
    console.log(`Password entered: ${password}`);

    if (!validateEmail(email)) {
        setErrorMessage('Invalid Email Address');
        console.log('Validation failed: Invalid Email Address');
        setTimeout(() => setErrorMessage(''), 3000);
        return;
    }

    if (!validatePassword(password)) {
        setErrorMessage('Password must be at least 6 characters long');
        console.log('Validation failed: Weak password');
        setTimeout(() => setErrorMessage(''), 3000);
        return;
    }

    setErrorMessage('');
    console.log('Validation passed. Attempting login...');

    const result = await login(email, password);

    console.log('Login result:', result);

    if (result.success) {
        console.log('Login successful. Token received:', result.accessToken);
        
        localStorage.setItem('accessToken', result.accessToken);
        localStorage.setItem('username', result.data.username);

        const storedToken = localStorage.getItem('accessToken');
        const storedUsername = localStorage.getItem('username');
        
        if (storedToken && storedUsername) {
            console.log('Token saved in localStorage:', storedToken);
            console.log('Username saved in localStorage:', storedUsername);
        } else {
            console.error('Failed to save token or username in localStorage');
        }

        navigate('/dashboard');
    } else {
        console.error('Login failed:', result.message);
        setErrorMessage(result.message);
        setTimeout(() => setErrorMessage(''), 2000);
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
