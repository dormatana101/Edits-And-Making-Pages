import React from "react";
import { Link, Outlet } from "react-router-dom"; 
import "../css/Layout.css";

const Layout: React.FC = () => {
  return (
    <div className="dashboard-container">
      <header className="top-bar">
        <h2>Ease Platform</h2>
        <button className="logout-button">Logout</button>
      </header>

      <aside className="sidebar">
        <ul>
          <li>
            <Link to="/dashboard">Dashboard</Link>
          </li>
          <li>
            <Link to="/profile">Profile</Link>
          </li>
          <li>
            <Link to="/posts">Posts</Link> 
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
