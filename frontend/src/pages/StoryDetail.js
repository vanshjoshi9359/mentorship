import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './StoryDetail.css';

const TAG_COLORS = { 'on-campus': '#667eea', 'off-campus': '#f5576c', 'referral': '#43e97b', 'other': '#fee140' };
const TYPE_COLORS = { placement: '#4facfe', internship: '#f093fb' };

const StoryDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchStory(); }, [id]);

  const fetchStory = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/stories/${id}`);
      setStory(res.data);
    } catch { navigate('/'); }
    finally { setLoading(false); }
  };

  const handleUpvote = async () => {
    if (!user) { navigate('/login'); return; }
    const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/stories/${id}/upvote`);
    setStory(s => ({
      ...s,
      upvotes: res.data.upvoted
        ? [...s.upvotes, user._id || user.id]
        : s.upvotes.filter(u => u !== (user._id || user.id))
    }));
  };

  const handleComment = async e => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/stories/${id}/comments`, { text: comment });
      setStory(s => ({ ...s, comments: [...s.comments, res.data] }));
      setComment('');
    } catch (err) { alert('Failed to post comment'); }
    finally { setSubmitting(false); }
  };

  const handleDeleteComment = async commentId => {
    await axios.delete(`${process.env.REACT_APP_API_URL}/api/stories/${id}/comments/${commentId}`);
    setStory(s => ({ ...s, comments: s.comments.filter(c => c._id !== commentId) }));
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!story) return null;

  const upvoted = user && story.upvotes.includes(user._id || user.id);

  return (
    <div className="story-detail-page">
      <button onClick={() => navigate('/')} className="back-btn">← Back to Feed</button>

      <article className="story-detail-card">
        {/* Header */}
        <div className="story-header">
          <div className="story-avatar">{story.author?.name?.charAt(0).toUpperCase()}</div>
          <div className="story-author-info">
            <span className="story-author">{story.author?.name}</span>
            <span className="story-date">
              {new Date(story.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <div className="story-badges">
            <span className="story-badge" style={{ background: TYPE_COLORS[story.type] }}>{story.type}</span>
            <span className="story-badge" style={{ background: TAG_COLORS[story.tag] }}>{story.tag}</span>
            {story.graduationYear && (
              <span className="story-badge year-badge">Batch {story.graduationYear}</span>
            )}
          </div>
        </div>

        {/* Company */}
        <div className="story-company-row">
          <div className="story-company-logo">{story.company.charAt(0).toUpperCase()}</div>
          <div>
            <h1 className="story-company">{story.company}</h1>
            <p className="story-role">{story.role}</p>
          </div>
          {story.package && (
            <div className="story-package">
              <span className="package-label">💰 Package</span>
              <span className="package-value">{story.package}</span>
            </div>
          )}
        </div>

        {/* Story */}
        <div className="story-section">
          <h3>📖 The Story</h3>
          <p className="story-text">{story.story}</p>
        </div>

        {/* Details */}
        <div className="story-details-grid">
          {story.prepTime && (
            <div className="detail-card">
              <span className="detail-icon">⏱️</span>
              <div className="detail-label">Prep Time</div>
              <div className="detail-value">{story.prepTime}</div>
            </div>
          )}
          {story.rounds && (
            <div className="detail-card">
              <span className="detail-icon">🔄</span>
              <div className="detail-label">Interview Rounds</div>
              <div className="detail-value">{story.rounds}</div>
            </div>
          )}
          {story.resources && (
            <div className="detail-card">
              <span className="detail-icon">📚</span>
              <div className="detail-label">Resources Used</div>
              <div className="detail-value">{story.resources}</div>
            </div>
          )}
        </div>

        {story.tips && (
          <div className="story-tips-box">
            <h3>💡 Tips for Juniors</h3>
            <p>{story.tips}</p>
          </div>
        )}

        {/* Upvote */}
        <div className="story-actions">
          <button className={`upvote-btn ${upvoted ? 'upvoted' : ''}`} onClick={handleUpvote}>
            ▲ {story.upvotes.length} {story.upvotes.length === 1 ? 'upvote' : 'upvotes'}
          </button>
        </div>
      </article>

      {/* Comments */}
      <div className="comments-section">
        <h2>💬 Comments ({story.comments.length})</h2>

        {user && (
          <form onSubmit={handleComment} className="comment-form">
            <input
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Ask a question or leave a comment..."
              className="comment-input"
              required
            />
            <button type="submit" disabled={submitting} className="btn btn-primary btn-sm">
              {submitting ? '...' : 'Post'}
            </button>
          </form>
        )}

        {story.comments.length === 0 ? (
          <div className="empty-state">No comments yet. Be the first to ask!</div>
        ) : (
          <div className="comments-list">
            {story.comments.map(c => (
              <div key={c._id} className="comment-item">
                <div className="comment-avatar">{c.userId?.name?.charAt(0).toUpperCase()}</div>
                <div className="comment-body">
                  <div className="comment-header">
                    <span className="comment-author">{c.userId?.name}</span>
                    <span className="comment-time">{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="comment-text">{c.text}</p>
                </div>
                {user && (user._id === c.userId?._id || user.id === c.userId?._id) && (
                  <button onClick={() => handleDeleteComment(c._id)} className="comment-delete">🗑️</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryDetail;
