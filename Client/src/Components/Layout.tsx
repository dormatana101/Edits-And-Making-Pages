import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { FaUser, FaClipboard, FaPlus, FaComments } from "react-icons/fa"; // Import new chat icon
import "../css/Layout.css";

const Layout: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <header className="top-bar">
        <h2>Ease Platform</h2>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </header>

      <aside className="sidebar">
        <ul>
          <li>
            <Link to="/chat" className="sidebar-link">
              <FaComments className="icon" /> Chat 
            </Link>
          </li>
          <li>
            <Link to="/profile" className="sidebar-link">
              <FaUser className="icon" /> Profile
            </Link>
          </li>
          <li>
            <Link to="/all-posts" className="sidebar-link">
              <FaClipboard className="icon" /> Posts
            </Link>
          </li>
          <li>
            <Link to="/create-post" className="sidebar-link">
              <FaPlus className="icon" /> Create Posts
            </Link>
          </li>
        </ul>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
