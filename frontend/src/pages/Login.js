import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const { user, login, register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let result;
    if (isRegister) {
      result = await register(formData.name, formData.email, formData.password);
    } else {
      result = await login(formData.email, formData.password);
    }

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError('');
    setFormData({ name: '', email: '', password: '' });
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Welcome to College Connect</h1>
        <p className="login-subtitle">Collaborate. Schedule. Compete.</p>
        <div className="login-box">
          <h2>{isRegister ? 'Create Account' : 'Sign In'}</h2>
          <p className="login-description">
            Ask high-quality questions and share high-quality answers.
            Grow through clarity, usefulness, and community voting.
          </p>
          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="error-message">{error}</div>}
            
            {isRegister && (
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Your name"
                />
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
                placeholder="At least 6 characters"
              />
            </div>
            
            <button type="submit" disabled={loading} className="btn btn-primary btn-full">
              {loading ? 'Please wait...' : (isRegister ? 'Create Account' : 'Sign In')}
            </button>
          </form>
          
          <div className="toggle-mode">
            <p>
              {isRegister ? 'Already have an account?' : "Don't have an account?"}
              {' '}
              <button type="button" onClick={toggleMode} className="link-button">
                {isRegister ? 'Sign In' : 'Create Account'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
