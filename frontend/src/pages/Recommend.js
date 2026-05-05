import React, { useState, useContext, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './Recommend.css';

const MATCH_TYPE_COLORS = {
  'Mentor':         { bg: '#ede9fe', color: '#7c3aed', border: '#c4b5fd' },
  'Study Buddy':    { bg: '#dbeafe', color: '#2563eb', border: '#93c5fd' },
  'Peer Support':   { bg: '#d1fae5', color: '#059669', border: '#6ee7b7' },
  'Problem Solver': { bg: '#fce7f3', color: '#db2777', border: '#f9a8d4' },
};

/* ── Connect Modal ── */
const ConnectModal = ({ rec, onClose, onSent }) => {
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState('');

  const handleSend = async () => {
    if (!msg.trim()) return setErr('Please write a message');
    setSending(true);
    setErr('');
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/connections`, {
        toUserId: rec.userId,
        message: msg.trim()
      });
      onSent(rec.userId);
      onClose();
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed to send request');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-avatar">{rec.name?.[0]?.toUpperCase()}</div>
          <div>
            <h3>Connect with {rec.name}</h3>
            <p className="modal-sub">{rec.branch} · Batch {rec.batch}</p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <label>Why do you want to connect?</label>
          <p className="modal-hint">Be specific — tell them your goal and how they can help you.</p>
          <textarea
            value={msg}
            onChange={e => setMsg(e.target.value)}
            placeholder={`Hi ${rec.name?.split(' ')[0]}, I came across your profile and I'd love to connect because...`}
            rows={5}
            maxLength={500}
            autoFocus
          />
          <div className="modal-char">{msg.length}/500</div>
          {err && <div className="modal-err">⚠️ {err}</div>}
        </div>
        <div className="modal-footer">
          <button className="btn-cancel-modal" onClick={onClose}>Cancel</button>
          <button className="btn-send-modal" onClick={handleSend} disabled={sending || !msg.trim()}>
            {sending ? 'Sending...' : '🤝 Send Request'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Requests Inbox ── */
const RequestsInbox = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/connections/mine`)
      .then(res => setRequests(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading requests...</div>;

  return (
    <div className="inbox-section">
      <h2>🤝 People Interested in Connecting with You</h2>
      {requests.length === 0 ? (
        <div className="inbox-empty">
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <p>No connection requests yet. Share your profile so others can find you!</p>
        </div>
      ) : (
        <div className="inbox-list">
          {requests.map(r => (
            <div key={r._id} className={`inbox-card ${r.status === 'pending' ? 'inbox-new' : ''}`}>
              <div className="inbox-card-top">
                <div className="inbox-avatar">{r.fromUser?.name?.[0]?.toUpperCase()}</div>
                <div className="inbox-info">
                  <h3>{r.fromUser?.name}</h3>
                  <p>
                    {r.senderProfile?.branch && `${r.senderProfile.branch} · `}
                    {r.senderProfile?.batch && `Batch ${r.senderProfile.batch}`}
                  </p>
                </div>
                <span className="inbox-time">{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="inbox-message">
                <span className="inbox-msg-label">Their message:</span>
                <p>"{r.message}"</p>
              </div>
              {r.senderProfile?.goal && (
                <div className="inbox-profile-snippet">
                  <span>🎯 {r.senderProfile.goal}</span>
                </div>
              )}
              {r.senderProfile?.linkedIn && (
                <a href={r.senderProfile.linkedIn} target="_blank" rel="noopener noreferrer" className="btn-connect">
                  🔗 View LinkedIn
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Main Component ── */
const Recommend = () => {
  const { user } = useContext(AuthContext);
  const [form, setForm] = useState({ goal: '', skill: '', problem: '' });
  const [myProfile, setMyProfile] = useState({ linkedIn: '', goal: '', skill: '', problem: '', batch: '', branch: '' });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('find');
  const [connectModal, setConnectModal] = useState(null); // rec object
  const [sentTo, setSentTo] = useState(new Set()); // userIds already requested
  const [unseenCount, setUnseenCount] = useState(0);

  useEffect(() => {
    if (user) {
      axios.get(`${process.env.REACT_APP_API_URL}/api/recommend/profile`)
        .then(res => { if (res.data._id) setMyProfile(res.data); })
        .catch(() => {});
      axios.get(`${process.env.REACT_APP_API_URL}/api/connections/unseen-count`)
        .then(res => setUnseenCount(res.data.count))
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
    } catch {
      alert('Failed to save profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSent = (userId) => {
    setSentTo(prev => new Set([...prev, String(userId)]));
  };

  const getScoreColor = (score) => score >= 80 ? '#059669' : score >= 60 ? '#d97706' : '#6366f1';

  return (
    <div className="recommend-page">
      {connectModal && (
        <ConnectModal
          rec={connectModal}
          onClose={() => setConnectModal(null)}
          onSent={handleSent}
        />
      )}

      <div className="recommend-header">
        <div className="recommend-badge">🤖 AI-Powered Matching</div>
        <h1>Find Your <span className="highlight">Growth Partner</span></h1>
        <p>AI matches you with the most relevant people based on your goals, skills, and challenges.</p>
      </div>

      {!user && (
        <div className="login-prompt-box">
          <span>🔒</span>
          <span>Please <Link to="/login">login</Link> to get personalized recommendations</span>
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
        {user && (
          <button className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => { setActiveTab('requests'); setUnseenCount(0); }}>
            🤝 Requests {unseenCount > 0 && <span className="notif-badge">{unseenCount}</span>}
          </button>
        )}
      </div>

      {/* ── Profile Tab ── */}
      {activeTab === 'profile' && user && (
        <div className="profile-card">
          <h2>Your Community Profile</h2>
          <p className="profile-subtitle">Fill this so others can find and connect with you</p>
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
              <textarea value={myProfile.goal} onChange={e => setMyProfile({ ...myProfile, goal: e.target.value })} placeholder="What do you want to achieve?" rows="2" />
            </div>
            <div className="form-group">
              <label>📚 Skill You're Learning</label>
              <textarea value={myProfile.skill} onChange={e => setMyProfile({ ...myProfile, skill: e.target.value })} placeholder="What are you currently learning?" rows="2" />
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

      {/* ── Requests Tab ── */}
      {activeTab === 'requests' && user && <RequestsInbox />}

      {/* ── Find Tab ── */}
      {activeTab === 'find' && (
        <div className="recommend-layout">
          <div className="form-card">
            <h2>Tell us about yourself</h2>
            <form onSubmit={handleFind}>
              <div className="input-group">
                <div className="input-icon">🎯</div>
                <div className="input-content">
                  <label>What is your goal?</label>
                  <textarea value={form.goal} onChange={e => setForm({ ...form, goal: e.target.value })} placeholder="e.g. Get placed at Google, crack a product company..." rows="3" required />
                </div>
              </div>
              <div className="input-group">
                <div className="input-icon">📚</div>
                <div className="input-content">
                  <label>What skill are you currently learning?</label>
                  <textarea value={form.skill} onChange={e => setForm({ ...form, skill: e.target.value })} placeholder="e.g. DSA, React.js, Machine Learning..." rows="3" required />
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
                {loading ? <span className="loading-row"><span className="spinner" />Finding best matches...</span> : '🤖 Find My Matches'}
              </button>
              {!user && <p className="login-hint">Login to get recommendations</p>}
            </form>
          </div>

          <div className="results-area">
            {!results && !loading && (
              <div className="results-placeholder">
                <div className="placeholder-icon">🔍</div>
                <h3>Your matches will appear here</h3>
                <p>Fill in the form and AI will find the best people for you to connect with</p>
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
                  const alreadySent = sentTo.has(String(rec.userId));
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
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
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
                        <div className="rec-actions">
                          {rec.linkedIn && (
                            <a href={rec.linkedIn} target="_blank" rel="noopener noreferrer" className="btn-connect">
                              🔗 LinkedIn
                            </a>
                          )}
                          {user && rec.userId && (
                            alreadySent ? (
                              <span className="btn-sent">✅ Request Sent</span>
                            ) : (
                              <button className="btn-connect-req" onClick={() => setConnectModal(rec)}>
                                🤝 Connect
                              </button>
                            )
                          )}
                        </div>
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
