import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const OAuthCallback: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchToken = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get("token");

      if (token) {
        localStorage.setItem("accessToken", token);


        const userId = params.get("userId");
        const username = params.get("username");

        if (userId && username) {
          localStorage.setItem("userId", userId);
          localStorage.setItem("username", username);
        }
        window.location.replace("/all-posts");
        navigate("/all-posts", { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    };

    fetchToken();
  }, [location.search, navigate]);

  return <div>Loading...</div>;
};

export default OAuthCallback;
