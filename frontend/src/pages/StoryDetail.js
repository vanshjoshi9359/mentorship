import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './StoryDetail.css';

const YEAR_LABELS = { 1: '1st Year', 2: '2nd Year', 3: '3rd Year', 4: '4th Year' };
const YEAR_EMOJIS = { 1: '🌱', 2: '📚', 3: '💻', 4: '🚀' };
const YEAR_COLORS = { 1: '#ede9fe', 2: '#dbeafe', 3: '#d1fae5', 4: '#fce7f3' };
const YEAR_ACCENT = { 1: '#7c3aed', 2: '#2563eb', 3: '#059669', 4: '#db2777' };

const CompanyLogo = ({ story }) => {
  const [src, setSrc] = React.useState(story.logoUrl || '');
  const letter = story.company?.[0]?.toUpperCase();
  const handleError = () => {
    if (story.logoUrl && src === story.logoUrl) {
      const domain = story.logoUrl.replace('https://logo.clearbit.com/', '');
      setSrc(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`);
    } else setSrc('');
  };
  return (
    <div className="company-logo-lg">
      {src ? <img src={src} alt={story.company} onError={handleError} /> : <span>{letter}</span>}
    </div>
  );
};

const StoryDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upvoted, setUpvoted] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState({});
  const [showReply, setShowReply] = useState({});

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/stories/${id}`)
      .then(res => {
        setStory(res.data);
        if (user) setUpvoted(res.data.upvotedBy?.includes(user._id));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleUpvote = async () => {
    if (!user) return;
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/stories/${id}/upvote`);
      setStory(prev => ({ ...prev, upvotes: res.data.upvotes }));
      setUpvoted(res.data.upvoted);
    } catch (e) { console.error(e); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this story?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/stories/${id}`);
      navigate('/stories');
    } catch (e) { alert('Failed to delete'); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/stories/${id}/comment`, { content: commentText });
      setStory(res.data);
      setCommentText('');
    } catch (e) { alert('Failed to post comment'); }
  };

  const handleReply = async (commentId) => {
    if (!replyText[commentId]?.trim()) return;
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/stories/${id}/comment/${commentId}/reply`, { content: replyText[commentId] });
      setStory(res.data);
      setReplyText(prev => ({ ...prev, [commentId]: '' }));
      setShowReply(prev => ({ ...prev, [commentId]: false }));
    } catch (e) { alert(e.response?.data?.message || 'Failed to reply'); }
  };

  if (loading) return <div className="loading">Loading story...</div>;
  if (!story) return <div className="error">Story not found</div>;

  const isOwner = user && story.authorId?._id === user._id;
  const sortedYears = [...story.years].sort((a, b) => a.year - b.year);

  return (
    <div className="story-detail-page">
      <Link to="/stories" className="back-link">← Back to Stories</Link>

      {/* Header */}
      <div className="story-header">
        <div className="story-company-row">
          <CompanyLogo story={story} />
          <div className="company-info">
            <h1>{story.company}</h1>
            <p className="story-role">{story.role}</p>
          </div>
        </div>

        <div className="story-badges">
          {story.package && <span className="badge badge-pkg">💰 {story.package}</span>}
          <span className="badge badge-batch">🎓 Batch {story.batch}</span>
          {story.branch && <span className="badge badge-branch">{story.branch}</span>}
        </div>

        <div className="story-actions">
          <button onClick={handleUpvote} className={`btn-upvote ${upvoted ? 'upvoted' : ''}`}>
            ❤️ {story.upvotes} {upvoted ? 'Liked' : 'Like'}
          </button>
          {story.linkedIn && (
            <a href={story.linkedIn} target="_blank" rel="noopener noreferrer" className="btn-linkedin">
              🔗 Connect on LinkedIn
            </a>
          )}
          {isOwner && (
            <button onClick={handleDelete} className="btn-delete-story">🗑️ Delete</button>
          )}
          <span className="story-author-info">By {story.authorId?.name} · {new Date(story.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Year sections */}
      <div className="years-section">
        {sortedYears.map(y => (
          <div key={y.year} className="year-card" style={{ background: YEAR_COLORS[y.year], borderColor: YEAR_ACCENT[y.year] + '50' }}>
            <div className="year-card-header">
              <div className="year-badge" style={{ background: YEAR_ACCENT[y.year] }}>{YEAR_EMOJIS[y.year]}</div>
              <h2 style={{ color: YEAR_ACCENT[y.year] }}>{YEAR_LABELS[y.year]}</h2>
            </div>
            <p className="year-content">{y.content}</p>
          </div>
        ))}
      </div>

      {/* Tips */}
      {story.tips && (
        <div className="tips-card">
          <h2>💡 Tips for Juniors</h2>
          <p className="tips-content">{story.tips}</p>
        </div>
      )}

      {/* Comments */}
      <div className="comments-section">
        <h2>💬 Comments ({story.comments?.length || 0})</h2>

        {user && (
          <form onSubmit={handleComment} className="comment-form">
            <input
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Ask the senior something..."
              required
            />
            <button type="submit" className="btn-comment">Post</button>
          </form>
        )}

        {!user && (
          <div className="login-to-comment">
            <Link to="/login">Login to ask questions</Link>
          </div>
        )}

        <div className="comments-list">
          {story.comments?.map(comment => (
            <div key={comment._id} className="comment-card">
              <div className="comment-header">
                <div className="comment-avatar">{comment.authorId?.name?.[0]?.toUpperCase()}</div>
                <div>
                  <span className="comment-author">{comment.authorId?.name}</span>
                  <span className="comment-time">{new Date(comment.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <p className="comment-content">{comment.content}</p>

              {/* Replies */}
              {comment.replies?.map((reply, i) => (
                <div key={i} className="reply-card">
                  <div className="comment-header">
                    <div className="comment-avatar reply-avatar">✍️</div>
                    <div>
                      <span className="comment-author">{reply.authorId?.name}</span>
                      <span className="reply-badge">Author</span>
                      <span className="comment-time">{new Date(reply.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <p className="comment-content">{reply.content}</p>
                </div>
              ))}

              {/* Reply button - only for story author */}
              {isOwner && (
                <div className="reply-section">
                  {showReply[comment._id] ? (
                    <div className="reply-input-row">
                      <input
                        value={replyText[comment._id] || ''}
                        onChange={e => setReplyText(prev => ({ ...prev, [comment._id]: e.target.value }))}
                        placeholder="Write your reply..."
                      />
                      <button onClick={() => handleReply(comment._id)} className="btn-reply-sm">Reply</button>
                      <button onClick={() => setShowReply(prev => ({ ...prev, [comment._id]: false }))} className="btn-cancel-sm">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setShowReply(prev => ({ ...prev, [comment._id]: true }))} className="btn-reply-toggle">
                      ↩️ Reply
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoryDetail;
