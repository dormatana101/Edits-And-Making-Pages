import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      {username ? (
        <>
          <h1>Welcome, {username}!</h1>
          <p>This is your main Dashboard. Here you can manage your activities.</p>
          <button
            onClick={handleLogout}
            style={{
              padding: "10px 20px",
              marginTop: "20px",
              backgroundColor: "#6200ee",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </>
      ) : (
        <h2>Loading...</h2>
      )}
    </div>
  );
};

export default Dashboard;
