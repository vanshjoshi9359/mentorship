import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (p) => location.pathname === p;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">⏱️ TimeFlow</Link>
        {user && (
          <div className="navbar-menu">
            <Link to="/" className={`navbar-link ${isActive('/') ? 'active' : ''}`}>Dashboard</Link>
            <Link to="/log" className={`navbar-link ${isActive('/log') ? 'active' : ''}`}>Log Day</Link>
            <Link to="/history" className={`navbar-link ${isActive('/history') ? 'active' : ''}`}>History</Link>
            <div className="navbar-user">
              <div className="navbar-avatar">{user.name?.[0]?.toUpperCase()}</div>
              <span className="navbar-username">{user.name?.split(' ')[0]}</span>
              <button onClick={() => { logout(); navigate('/login'); }} className="navbar-logout">Logout</button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
