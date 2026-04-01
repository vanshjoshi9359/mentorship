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
          🎓 College Connect
        </Link>
        
        <div className="navbar-tagline">
          Collaborate. Schedule. Compete.
        </div>

        <div className="navbar-menu">
          <Link to="/groups" className="navbar-link">All Groups</Link>
          {user ? (
            <>
              <Link to="/create-group" className="navbar-link navbar-create-btn">Create Group</Link>
              <div className="navbar-user">
                {user.avatar && <img src={user.avatar} alt={user.name} className="navbar-avatar" />}
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
