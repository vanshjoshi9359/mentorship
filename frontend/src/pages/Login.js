import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { AuthContext } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const { user, googleLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      setError('Google login failed — no credential received. Try again.');
      return;
    }
    const result = await googleLogin(credentialResponse.credential);
    if (result.success) navigate('/');
    else setError(result.message);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">🎓</div>
            <h1>Ask a Senior</h1>
            <p>Real stories. Real advice. NIT Jalandhar.</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="google-only-section">
            <p className="google-only-label">Sign in with your college Google account</p>
            <div className="google-login-wrapper">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google login failed. Make sure you use your @nitj.ac.in email.')}
                theme="filled_black"
                shape="rectangular"
                size="large"
                width="360"
                text="signin_with"
              />
            </div>
            <p className="college-notice">⚠️ Only @nitj.ac.in emails are allowed</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
