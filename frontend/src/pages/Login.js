import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { AuthContext } from '../context/AuthContext';
import './Login.css';

const GOOGLE_CLIENT_ID = '174400663895-obo6oq541202kei3p3ah8dlurvjp8olp.apps.googleusercontent.com';

const Login = () => {
  const { user, login, register, googleLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validateGmail = (email) => {
    if (!email.endsWith('@gmail.com')) {
      setError('Only Gmail addresses (@gmail.com) are allowed');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateGmail(formData.email)) return;
    setLoading(true);
    setError('');
    const result = isRegister
      ? await register(formData.name, formData.email, formData.password)
      : await login(formData.email, formData.password);
    if (result.success) navigate('/');
    else setError(result.message);
    setLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    const result = await googleLogin(credentialResponse.credential);
    if (result.success) navigate('/');
    else setError(result.message);
    setLoading(false);
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="login-page">
        <div className="login-container">
          <div className="login-card">
            <div className="login-header">
              <div className="login-logo">🎓</div>
              <h1>Connect</h1>
              <p>NIT Jalandhar Growth Community</p>
            </div>

            <div className="login-body">
              {/* Google Login */}
              <div className="google-btn-wrapper">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google sign-in failed')}
                  theme="outline"
                  shape="rectangular"
                  size="large"
                  text={isRegister ? 'signup_with' : 'signin_with'}
                  width="360"
                />
              </div>

              <div className="divider"><span>or use Gmail</span></div>

              {/* Email/Password Form */}
              <form onSubmit={handleSubmit} className="email-form">
                {error && <div className="error-message">⚠️ {error}</div>}

                {isRegister && (
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Your full name"
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Gmail Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="yourname@gmail.com"
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength="6"
                    placeholder="At least 6 characters"
                  />
                </div>

                <button type="submit" disabled={loading} className="login-button">
                  {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
                </button>
              </form>

              <div className="login-footer">
                <p>{isRegister ? 'Already have an account?' : "Don't have an account?"}</p>
                <button type="button" onClick={() => { setIsRegister(!isRegister); setError(''); }}>
                  {isRegister ? 'Sign In' : 'Create Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
