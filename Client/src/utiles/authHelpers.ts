import { login } from "../Services/authService";
import { validateEmail, validatePassword } from "./Login_validation";
import { NavigateFunction } from "react-router-dom";


export const handleLogin = async (
  event: React.FormEvent,
  email: string,
  password: string,
  setErrorMessage: (msg: string) => void,
  navigate: NavigateFunction
) => {
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


export const handleKeyDown = (event: React.KeyboardEvent, handleLogin: () => void) => {
  if (event.key === "Enter") {
    handleLogin();
  }
};


export const handleGoogleLogin = (serverUrl: string) => {
  window.location.href = `${serverUrl}/auth/google`;
};
