import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { AuthContext } from '../context/AuthContext';
import './Login.css';

const GOOGLE_CLIENT_ID = '174400663895-obo6oq541202kei3p3ah8dlurvjp8olp.apps.googleusercontent.com';

const Login = () => {
  const { user, googleLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    const result = await googleLogin(credentialResponse.credential);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleGoogleError = () => {
    setError('Google sign-in failed. Please try again.');
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="login-page">
        <div className="login-container">
          <div className="login-card">
            <div className="login-header">
              <div className="login-logo">🔍</div>
              <h1>FindIt</h1>
              <p>College Lost & Found Portal</p>
            </div>

            <div className="login-body">
              <div className="college-notice">
                <span className="notice-icon">🎓</span>
                <div>
                  <strong>College Members Only</strong>
                  <p>Sign in with your college Google account (@akgec.ac.in)</p>
                </div>
              </div>

              {error && (
                <div className="error-message">
                  ⚠️ {error}
                </div>
              )}

              {loading ? (
                <div className="login-loading">Signing you in...</div>
              ) : (
                <div className="google-btn-wrapper">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    theme="filled_black"
                    shape="rectangular"
                    size="large"
                    text="signin_with"
                    width="320"
                  />
                </div>
              )}

              <div className="login-features">
                <div className="feature-item">
                  <span>📢</span>
                  <span>Report lost or found items</span>
                </div>
                <div className="feature-item">
                  <span>🤖</span>
                  <span>AI-powered item matching</span>
                </div>
                <div className="feature-item">
                  <span>🔒</span>
                  <span>Secure college-only access</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
