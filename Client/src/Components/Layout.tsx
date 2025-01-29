import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { FaUser, FaClipboard, FaPlus, FaComments, FaRobot } from "react-icons/fa";
import "../css/Layout.css";

const Layout: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");

    navigate("/login");
  };

  return (
    <div className="layout-dashboard-container">
      <header className="layout-top-bar">
        <h2>Ease Platform</h2>
        <button className="layout-logout-button" onClick={handleLogout}>Logout</button>
      </header>

      <aside className="layout-sidebar">
        <ul>
          <li>
            <Link to="/chat" className="layout-sidebar-link">
              <FaComments className="layout-icon" /> Chat 
            </Link>
          </li>
          <li>
            <Link to="/profile" className="layout-sidebar-link">
              <FaUser className="layout-icon" /> Profile
            </Link>
          </li>
          <li>
            <Link to="/all-posts" className="layout-sidebar-link">
              <FaClipboard className="layout-icon" /> Posts
            </Link>
          </li>
          <li>
            <Link to="/create-post" className="layout-sidebar-link">
              <FaPlus className="layout-icon" /> Create Posts
            </Link>
          </li>
          <li>
            <Link to="/chatgpt" className="layout-sidebar-link"> 
              <FaRobot className="layout-icon" /> ChatGPT
            </Link>
          </li>
        </ul>
      </aside>

      <main className="layout-main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
