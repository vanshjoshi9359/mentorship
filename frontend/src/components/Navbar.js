import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          🔍 FindIt
          <span className="navbar-logo-sub">College Lost & Found</span>
        </Link>

        <div className="navbar-menu">
          <Link to="/" className={`navbar-link ${isActive('/') ? 'active' : ''}`}>Browse</Link>
          {user && (
            <>
              <Link to="/my-items" className={`navbar-link ${isActive('/my-items') ? 'active' : ''}`}>My Posts</Link>
              <Link to="/post" className="navbar-post-btn">+ Report Item</Link>
              <div className="navbar-user">
                <div className="navbar-avatar">{user.name?.[0]?.toUpperCase()}</div>
                <span className="navbar-username">{user.name}</span>
                <button onClick={handleLogout} className="navbar-logout">Logout</button>
              </div>
            </>
          )}
          {!user && (
            <Link to="/login" className="navbar-post-btn">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
