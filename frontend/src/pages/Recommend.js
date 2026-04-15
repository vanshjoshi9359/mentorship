import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './Recommend.css';

const MATCH_TYPE_COLORS = {
  'Mentor': { bg: '#ede9fe', color: '#7c3aed', border: '#c4b5fd' },
  'Study Buddy': { bg: '#dbeafe', color: '#2563eb', border: '#93c5fd' },
  'Peer Support': { bg: '#d1fae5', color: '#059669', border: '#6ee7b7' },
  'Problem Solver': { bg: '#fce7f3', color: '#db2777', border: '#f9a8d4' },
};

const Recommend = () => {
  const { user } = useContext(AuthContext);
  const [form, setForm] = useState({ goal: '', skill: '', problem: '' });
  const [myProfile, setMyProfile] = useState({ linkedIn: '', goal: '', skill: '', problem: '', batch: '', branch: '' });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('find'); // 'find' | 'profile'

  useEffect(() => {
    if (user) {
      axios.get(`${process.env.REACT_APP_API_URL}/api/recommend/profile`)
        .then(res => { if (res.data._id) setMyProfile(res.data); })
        .catch(() => {});
    }
  }, [user]);

  const handleFind = async (e) => {
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

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/recommend/profile`, myProfile);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err) {
      alert('Failed to save profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const getScoreColor = (score) => score >= 80 ? '#059669' : score >= 60 ? '#d97706' : '#6366f1';

  return (
    <div className="recommend-page">
      <div className="recommend-header">
        <div className="recommend-badge">🤖 AI-Powered Matching</div>
        <h1>Find Your <span className="highlight">Perfect Match</span></h1>
        <p>AI matches you with the most relevant people in the community based on your goals, skills, and challenges.</p>
      </div>

      {!user && (
        <div className="login-prompt-box">
          <span>🔒</span>
          <span>Please <Link to="/login">login</Link> to get personalized recommendations and appear in others' results</span>
        </div>
      )}

      <div className="tabs-row">
        <button className={`tab-btn ${activeTab === 'find' ? 'active' : ''}`} onClick={() => setActiveTab('find')}>
          🔍 Find Connections
        </button>
        {user && (
          <button className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
            👤 My Profile
          </button>
        )}
      </div>

      {activeTab === 'profile' && user && (
        <div className="profile-card">
          <h2>Your Community Profile</h2>
          <p className="profile-subtitle">Fill this so others can find and connect with you through AI recommendations</p>
          <form onSubmit={handleSaveProfile} className="profile-form">
            <div className="profile-grid">
              <div className="form-group">
                <label>🔗 LinkedIn URL</label>
                <input value={myProfile.linkedIn} onChange={e => setMyProfile({ ...myProfile, linkedIn: e.target.value })} placeholder="https://linkedin.com/in/yourprofile" />
              </div>
              <div className="form-group">
                <label>🎓 Batch</label>
                <input value={myProfile.batch} onChange={e => setMyProfile({ ...myProfile, batch: e.target.value })} placeholder="e.g. 2025" />
              </div>
              <div className="form-group">
                <label>🏫 Branch</label>
                <input value={myProfile.branch} onChange={e => setMyProfile({ ...myProfile, branch: e.target.value })} placeholder="e.g. CSE, IT" />
              </div>
            </div>
            <div className="form-group">
              <label>🎯 Your Goal</label>
              <textarea value={myProfile.goal} onChange={e => setMyProfile({ ...myProfile, goal: e.target.value })} placeholder="What do you want to achieve? e.g. Get placed at a product company" rows="2" />
            </div>
            <div className="form-group">
              <label>📚 Skill You're Learning</label>
              <textarea value={myProfile.skill} onChange={e => setMyProfile({ ...myProfile, skill: e.target.value })} placeholder="What are you currently learning? e.g. DSA, React, ML" rows="2" />
            </div>
            <div className="form-group">
              <label>🚧 Problem You're Facing</label>
              <textarea value={myProfile.problem} onChange={e => setMyProfile({ ...myProfile, problem: e.target.value })} placeholder="What challenge are you dealing with?" rows="2" />
            </div>
            <button type="submit" disabled={savingProfile} className="btn-save-profile">
              {savingProfile ? 'Saving...' : profileSaved ? '✅ Saved!' : '💾 Save Profile'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'find' && (
        <div className="recommend-layout">
          <div className="form-card">
            <h2>Tell us about yourself</h2>
            <form onSubmit={handleFind}>
              <div className="input-group">
                <div className="input-icon">🎯</div>
                <div className="input-content">
                  <label>What is your goal?</label>
                  <textarea value={form.goal} onChange={e => setForm({ ...form, goal: e.target.value })} placeholder="e.g. Get placed at Google, crack a product company, build a startup..." rows="3" required />
                </div>
              </div>
              <div className="input-group">
                <div className="input-icon">📚</div>
                <div className="input-content">
                  <label>What skill are you currently learning?</label>
                  <textarea value={form.skill} onChange={e => setForm({ ...form, skill: e.target.value })} placeholder="e.g. DSA, React.js, Machine Learning, System Design..." rows="3" required />
                </div>
              </div>
              <div className="input-group">
                <div className="input-icon">🚧</div>
                <div className="input-content">
                  <label>What problem are you facing?</label>
                  <textarea value={form.problem} onChange={e => setForm({ ...form, problem: e.target.value })} placeholder="e.g. Struggling with DP, don't know which companies to target..." rows="3" required />
                </div>
              </div>
              {error && <div className="error-box">⚠️ {error}</div>}
              <button type="submit" disabled={loading || !user} className="btn-recommend">
                {loading ? (
                  <span className="loading-row"><span className="spinner" />Finding best matches...</span>
                ) : '🤖 Find My Matches'}
              </button>
              {!user && <p className="login-hint">Login to get recommendations</p>}
            </form>
          </div>

          <div className="results-area">
            {!results && !loading && (
              <div className="results-placeholder">
                <div className="placeholder-icon">🔍</div>
                <h3>Your matches will appear here</h3>
                <p>Fill in the form and AI will find the best people for you to connect with from our community</p>
              </div>
            )}
            {loading && (
              <div className="results-loading">
                <div className="ai-thinking">
                  <div className="thinking-dot" /><div className="thinking-dot" /><div className="thinking-dot" />
                </div>
                <p>AI is analysing community profiles and finding your best matches...</p>
              </div>
            )}
            {results && (
              <div className="results-section">
                <h2>🎯 Your Top Matches</h2>
                {results.message && <div className="no-results-msg">{results.message}</div>}
                {results.recommendations?.map((rec, i) => {
                  const typeStyle = MATCH_TYPE_COLORS[rec.matchType] || MATCH_TYPE_COLORS['Peer Support'];
                  return (
                    <div key={i} className="rec-card">
                      <div className="rec-rank">#{i + 1}</div>
                      <div className="rec-body">
                        <div className="rec-top">
                          <div className="rec-avatar">{rec.name?.[0]?.toUpperCase()}</div>
                          <div className="rec-info">
                            <h3>{rec.name}</h3>
                            <p>{rec.branch && `${rec.branch} · `}{rec.batch && `Batch ${rec.batch}`}</p>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                            <div className="rec-score" style={{ color: getScoreColor(rec.matchScore) }}>
                              <span className="score-num">{rec.matchScore}%</span>
                            </div>
                            <span className="match-type-badge" style={{ background: typeStyle.bg, color: typeStyle.color, border: `1px solid ${typeStyle.border}` }}>
                              {rec.matchType}
                            </span>
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
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Recommend;
