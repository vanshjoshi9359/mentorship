import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './Recommend.css';

const Recommend = () => {
  const { user } = useContext(AuthContext);
  const [form, setForm] = useState({ goal: '', skill: '', problem: '' });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults(null);
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/recommend`, form);
      setResults(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#059669';
    if (score >= 60) return '#d97706';
    return '#6366f1';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Strong Match';
    if (score >= 60) return 'Good Match';
    return 'Relevant';
  };

  return (
    <div className="recommend-page">
      <div className="recommend-header">
        <div className="recommend-badge">🤖 AI-Powered</div>
        <h1>Find Your <span className="highlight">Perfect Mentor</span></h1>
        <p>Tell us about yourself and we'll recommend the most relevant seniors and juniors from our community to connect with.</p>
      </div>

      {!user && (
        <div className="login-prompt-box">
          <span>🔒</span>
          <span>Please <Link to="/login">login</Link> to get personalized recommendations</span>
        </div>
      )}

      <div className="recommend-layout">
        <div className="form-card">
          <h2>Tell us about yourself</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <div className="input-icon">🎯</div>
              <div className="input-content">
                <label>What is your goal?</label>
                <textarea
                  value={form.goal}
                  onChange={e => setForm({ ...form, goal: e.target.value })}
                  placeholder="e.g. Get placed at a product company, crack Google, build a startup, get an internship at a top MNC..."
                  rows="3"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <div className="input-icon">📚</div>
              <div className="input-content">
                <label>What skill are you currently learning?</label>
                <textarea
                  value={form.skill}
                  onChange={e => setForm({ ...form, skill: e.target.value })}
                  placeholder="e.g. Data Structures & Algorithms, React.js, Machine Learning, System Design, DSA on LeetCode..."
                  rows="3"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <div className="input-icon">🚧</div>
              <div className="input-content">
                <label>What problem are you facing?</label>
                <textarea
                  value={form.problem}
                  onChange={e => setForm({ ...form, problem: e.target.value })}
                  placeholder="e.g. Struggling with dynamic programming, don't know how to build projects, confused about which companies to target..."
                  rows="3"
                  required
                />
              </div>
            </div>

            {error && <div className="error-box">⚠️ {error}</div>}

            <button type="submit" disabled={loading || !user} className="btn-recommend">
              {loading ? (
                <span className="loading-row">
                  <span className="spinner" />
                  Finding best matches...
                </span>
              ) : '🤖 Get AI Recommendations'}
            </button>
          </form>
        </div>

        <div className="results-area">
          {!results && !loading && (
            <div className="results-placeholder">
              <div className="placeholder-icon">🔍</div>
              <h3>Your recommendations will appear here</h3>
              <p>Fill in the form and let AI find the best people for you to connect with</p>
            </div>
          )}

          {loading && (
            <div className="results-loading">
              <div className="ai-thinking">
                <div className="thinking-dot" />
                <div className="thinking-dot" />
                <div className="thinking-dot" />
              </div>
              <p>AI is analysing profiles and finding your best matches...</p>
            </div>
          )}

          {results && (
            <div className="results-section">
              <h2>🎯 Your Top Matches</h2>
              {results.message && (
                <div className="no-results-msg">{results.message}</div>
              )}
              {results.recommendations?.map((rec, i) => (
                <div key={i} className="rec-card">
                  <div className="rec-rank">#{i + 1}</div>
                  <div className="rec-body">
                    <div className="rec-top">
                      <div className="rec-avatar">{rec.name?.[0]?.toUpperCase()}</div>
                      <div className="rec-info">
                        <h3>{rec.name}</h3>
                        <p>{rec.role} @ {rec.company}</p>
                      </div>
                      <div className="rec-score" style={{ color: getScoreColor(rec.matchScore) }}>
                        <span className="score-num">{rec.matchScore}%</span>
                        <span className="score-label">{getScoreLabel(rec.matchScore)}</span>
                      </div>
                    </div>

                    <div className="rec-reason">
                      <span className="reason-icon">💡</span>
                      <p>{rec.reason}</p>
                    </div>

                    {rec.linkedIn && (
                      <a href={rec.linkedIn} target="_blank" rel="noopener noreferrer" className="btn-connect">
                        🔗 Connect on LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Recommend;
