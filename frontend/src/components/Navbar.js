import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          🎓 Ask a Senior
        </Link>
        
        <div className="navbar-tagline">
          Real stories. Real advice.
        </div>

        <div className="navbar-menu">
          {user ? (
            <>
              <Link to="/share" className="navbar-link navbar-create-btn">✍️ Share Story</Link>
              <div className="navbar-user">
                <span className="navbar-avatar">{user.name?.charAt(0).toUpperCase()}</span>
                <span className="navbar-username">{user.name}</span>
                <button onClick={handleLogout} className="navbar-logout">Logout</button>
              </div>
            </>
          ) : (
            <Link to="/login" className="navbar-link navbar-login">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
