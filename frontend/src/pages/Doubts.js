import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './Doubts.css';

const CATEGORIES = ['All', 'Resume', 'DSA', 'Projects', 'Internship', 'Placement Process', 'Skills', 'General'];

const Doubts = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', category: 'General' });
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetchDoubts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const fetchDoubts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (category !== 'All') params.category = category;
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/doubts`, { params });
      setDoubts(res.data.doubts);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handlePost = async e => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setPosting(true);
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/doubts`, form);
      navigate(`/doubts/${res.data._id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="doubts-page">
      <div className="page-header">
        <h1>❓ Junior Doubts</h1>
        <button className="btn-share" onClick={() => user ? setShowForm(!showForm) : navigate('/login')}>
          {showForm ? '✕ Cancel' : '+ Ask a Doubt'}
        </button>
      </div>

      {showForm && (
        <div className="post-doubt-form">
          <h3>Post Your Doubt</h3>
          <form onSubmit={handlePost}>
            <input
              placeholder="Your question title (be specific)"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
            />
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <textarea
              placeholder="Describe your doubt in detail..."
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
              rows="4"
              required
            />
            <button type="submit" disabled={posting} className="btn-post-doubt">
              {posting ? 'Posting...' : 'Post Doubt'}
            </button>
          </form>
        </div>
      )}

      <div className="cat-filters">
        {CATEGORIES.map(c => (
          <button key={c} className={`cat-btn ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>{c}</button>
        ))}
      </div>

      {loading ? (
        <div className="loading">Loading doubts...</div>
      ) : doubts.length === 0 ? (
        <div className="empty-state"><p>No doubts yet. <button onClick={() => setShowForm(true)} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}>Ask the first one!</button></p></div>
      ) : (
        <div className="doubts-list">
          {doubts.map(doubt => (
            <Link to={`/doubts/${doubt._id}`} key={doubt._id} className="doubt-card">
              <div className="doubt-votes">
                <span className="vote-count">▲ {doubt.upvotes}</span>
                <span className="vote-label">votes</span>
              </div>
              <div className="doubt-body">
                <div className="doubt-title">{doubt.title}</div>
                <div className="doubt-preview">{doubt.content.slice(0, 120)}...</div>
                <div className="doubt-meta">
                  <span className="cat-tag">{doubt.category}</span>
                  {doubt.resolved && <span className="resolved-tag">✅ Resolved</span>}
                  <span className="replies-count">💬 {doubt.replies?.length || 0} replies</span>
                  <span>👤 {doubt.authorId?.name}</span>
                  <span>📅 {new Date(doubt.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Doubts;
