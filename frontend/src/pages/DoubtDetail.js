import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './DoubtDetail.css';

const DoubtDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [doubt, setDoubt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetchDoubt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchDoubt = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/doubts/${id}`);
      setDoubt(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleReply = async e => {
    e.preventDefault();
    if (!reply.trim()) return;
    setPosting(true);
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/doubts/${id}/reply`, { content: reply });
      setDoubt(res.data);
      setReply('');
    } catch (err) { alert('Failed to post reply'); }
    finally { setPosting(false); }
  };

  const handleUpvote = async () => {
    if (!user) return;
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/doubts/${id}/upvote`);
      setDoubt(prev => ({ ...prev, upvotes: res.data.upvotes }));
    } catch (e) { console.error(e); }
  };

  const handleResolve = async () => {
    try {
      const res = await axios.patch(`${process.env.REACT_APP_API_URL}/api/doubts/${id}/resolve`);
      setDoubt(prev => ({ ...prev, resolved: res.data.resolved }));
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!doubt) return <div className="error">Doubt not found</div>;

  const isOwner = user && doubt.authorId?._id === user._id;

  return (
    <div className="doubt-detail-page">
      <Link to="/doubts" className="back-link">← Back to Doubts</Link>

      <div className="doubt-main">
        <div className="doubt-header">
          <div className="doubt-header-top">
            <span className="cat-tag">{doubt.category}</span>
            {doubt.resolved && <span className="resolved-tag">✅ Resolved</span>}
          </div>
          <h1>{doubt.title}</h1>
          <p className="doubt-content">{doubt.content}</p>
          <div className="doubt-footer">
            <button onClick={handleUpvote} className="btn-upvote">▲ {doubt.upvotes} Upvote</button>
            {isOwner && (
              <button onClick={handleResolve} className={`btn-resolve ${doubt.resolved ? 'resolved' : ''}`}>
                {doubt.resolved ? '✅ Resolved' : 'Mark Resolved'}
              </button>
            )}
            <span className="doubt-meta-info">By {doubt.authorId?.name} · {new Date(doubt.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="replies-section">
          <h2>{doubt.replies?.length || 0} Replies</h2>
          {doubt.replies?.length === 0 && (
            <div className="no-replies">No replies yet. Be the first to help!</div>
          )}
          {doubt.replies?.map((r, i) => (
            <div key={i} className="reply-card">
              <div className="reply-header">
                <div className="reply-avatar">{r.authorId?.name?.[0]?.toUpperCase()}</div>
                <div className="reply-meta">
                  <span className="reply-author">{r.authorId?.name}</span>
                  <span className="reply-time">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <p className="reply-content">{r.content}</p>
            </div>
          ))}
        </div>

        {user ? (
          <form onSubmit={handleReply} className="reply-form">
            <h3>Your Answer</h3>
            <textarea
              value={reply}
              onChange={e => setReply(e.target.value)}
              placeholder="Share your knowledge or experience..."
              rows="5"
              required
            />
            <button type="submit" disabled={posting} className="btn-reply">
              {posting ? 'Posting...' : '💬 Post Reply'}
            </button>
          </form>
        ) : (
          <div className="login-prompt">
            <Link to="/login">Login to reply</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoubtDetail;
