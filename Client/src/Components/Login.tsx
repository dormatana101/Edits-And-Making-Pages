import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "../css/Login.module.css";
import EaseLogo from "../images/EaseLogo.png";
import { IoLockClosedOutline } from "react-icons/io5";
import { RxAvatar } from "react-icons/rx";
import { FcGoogle } from "react-icons/fc";
import { login } from "../Services/authService";
import { validateEmail, validatePassword } from "../utiles/Login_validation";
import SERVER_URL from "../config"; 

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateEmail(email)) {
      setErrorMessage("Invalid Email Address");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    if (!validatePassword(password)) {
      setErrorMessage("Password must be at least 6 characters long");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    setErrorMessage("");

    const result = await login(email, password);
    if (result.success) {
      localStorage.setItem("accessToken", result.accessToken);
      localStorage.setItem("username", result.data.username);
      localStorage.setItem("userId", result.data._id);

      navigate("/all-posts", { state: { likedPosts: result.data.likedPosts, userId: result.data._id } });
    } else {
      setErrorMessage(result.message);
      setTimeout(() => setErrorMessage(""), 2000);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleLogin(event);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${SERVER_URL}/auth/google`;
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.containerLogin}>
        <div className={styles.left}>
          <div className={styles.formContainer}>
            <h1 className={styles.headline}>LOGIN</h1>
            <p className={styles.subHeadline}>How do I get started with Ease?</p>
            <form onSubmit={handleLogin} className={styles.loginForm}>
              <div className={styles.inputContainer}>
                <RxAvatar className={styles.inputIcon} />
                <input
                  type="text"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={`${styles.input} ${errorMessage && !email ? styles.inputError : ''}`}
                  aria-label="Email"
                />
              </div>
              <div className={styles.inputContainer}>
                <IoLockClosedOutline className={styles.inputIcon} />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={`${styles.input} ${errorMessage && !password ? styles.inputError : ''}`}
                  aria-label="Password"
                />
              </div>
              <button type="submit" className={styles.loginButton} disabled={false} aria-label="Login Now">
                Login Now
              </button>
              {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
            </form>
            <div className={styles.footer}>
              <p>
                Don't have an account? <Link to="/register" className={styles.registerLink}>Register here</Link>
              </p>
              <p className={styles.orText}>or Sign in with</p>
              <button className={styles.googleLogin} onClick={handleGoogleLogin} aria-label="Sign in with Google">
                <FcGoogle className={styles.googleIcon} />
                Google
              </button>
            </div>
            <img src={EaseLogo} alt="Ease Logo" className={styles.easeLogo} />
          </div>
        </div>
        <div className={styles.right}>
          <div className={styles.textBox}>
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
