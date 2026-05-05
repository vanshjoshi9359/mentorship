import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (p) => location.pathname.startsWith(p);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <div className="navbar-logo-icon">🎓</div>
          <div>
            <span className="navbar-logo-text">Connect</span>
            <span className="navbar-logo-sub">NIT Jalandhar</span>
          </div>
        </Link>

        <div className="navbar-center">
          <Link to="/stories" className={`navbar-link ${isActive('/stories') ? 'active' : ''}`}>
            <span>📖</span> Stories
          </Link>
          <Link to="/recommend" className={`navbar-link ${isActive('/recommend') ? 'active' : ''}`}>
            <span>✨</span> Recommend
          </Link>
        </div>

        <div className="navbar-right">
          {user ? (
            <>
              <Link to="/post-story" className="navbar-post-btn">+ Share Story</Link>
              <div className="navbar-user">
                <span className="navbar-username">{user.name?.split(' ')[0]}</span>
                <div className="navbar-avatar">{user.name?.[0]?.toUpperCase()}</div>
                <button onClick={() => { logout(); navigate('/login'); }} className="navbar-logout">Out</button>
              </div>
            </>
          ) : (
            <Link to="/login" className="navbar-post-btn">Sign In</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
