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
          🎓 PlaceConnect
          <span className="navbar-logo-sub">AKGEC Placement Stories</span>
        </Link>
        <div className="navbar-menu">
          <Link to="/stories" className={`navbar-link ${isActive('/stories') ? 'active' : ''}`}>📖 Stories</Link>
          <Link to="/recommend" className={`navbar-link ${isActive('/recommend') ? 'active' : ''}`}>🤖 Recommend</Link>
          {user ? (
            <>
              <Link to="/post-story" className="navbar-post-btn">+ Share Story</Link>
              <div className="navbar-user">
                <div className="navbar-avatar">{user.name?.[0]?.toUpperCase()}</div>
                <span className="navbar-username">{user.name?.split(' ')[0]}</span>
                <button onClick={() => { logout(); navigate('/login'); }} className="navbar-logout">Logout</button>
              </div>
            </>
          ) : (
            <Link to="/login" className="navbar-post-btn">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
