import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './Feed.css';

const TAG_COLORS = { 'on-campus': '#667eea', 'off-campus': '#f5576c', 'referral': '#43e97b', 'other': '#fee140' };
const TYPE_COLORS = { placement: '#4facfe', internship: '#f093fb' };

const Feed = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: '', tag: '', search: '', year: '' });

  useEffect(() => { fetchStories(); }, [filters]);

  const fetchStories = async () => {
    try {
      const params = {};
      if (filters.type) params.type = filters.type;
      if (filters.tag) params.tag = filters.tag;
      if (filters.search) params.search = filters.search;
      if (filters.year) params.year = filters.year;
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/stories`, { params });
      setStories(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (storyId) => {
    if (!user) { navigate('/login'); return; }
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/stories/${storyId}/upvote`);
      setStories(prev => prev.map(s =>
        s._id === storyId
          ? { ...s, upvotes: res.data.upvoted
              ? [...s.upvotes, user._id]
              : s.upvotes.filter(id => id !== user._id) }
          : s
      ));
    } catch (err) { console.error(err); }
  };

  return (
    <div className="feed-layout">
      {/* SIDEBAR */}
      <aside className="feed-sidebar">
        <div className="sidebar-brand">Ask a Senior</div>

        {user ? (
          <Link to="/share" className="sidebar-share-btn">✍️ Share Your Story</Link>
        ) : (
          <Link to="/login" className="sidebar-share-btn">🔑 Login to Share</Link>
        )}

        <div className="sidebar-section">
          <h3>Search</h3>
          <input
            className="sidebar-search"
            placeholder="Company, role..."
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
          />
        </div>

        <div className="sidebar-section">
          <h3>Type</h3>
          <div className="filter-btns">
            {['', 'placement', 'internship'].map(t => (
              <button
                key={t}
                className={`filter-btn ${filters.type === t ? 'active' : ''}`}
                onClick={() => setFilters(f => ({ ...f, type: t }))}
              >
                {t === '' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="sidebar-section">
          <h3>Batch Year</h3>
          <div className="filter-btns">
            {['', 2022, 2023, 2024, 2025, 2026].map(y => (
              <button
                key={y}
                className={`filter-btn ${filters.year === (y ? String(y) : '') ? 'active' : ''}`}
                onClick={() => setFilters(f => ({ ...f, year: y ? String(y) : '' }))}
              >
                {y === '' ? 'All Years' : `Batch ${y}`}
              </button>
            ))}
          </div>
        </div>

        <div className="sidebar-section">
          <h3>Source</h3>
          <div className="filter-btns">
            {['', 'on-campus', 'off-campus', 'referral', 'other'].map(tag => (
              <button
                key={tag}
                className={`filter-btn ${filters.tag === tag ? 'active' : ''}`}
                onClick={() => setFilters(f => ({ ...f, tag }))}
              >
                {tag === '' ? 'All' : tag}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* MAIN FEED */}
      <main className="feed-main">
        <div className="feed-header">
          <h1>Placement & Internship Stories</h1>
          <p>Real experiences from seniors who made it — learn how they did it</p>
        </div>

        {loading ? (
          <div className="loading">Loading stories...</div>
        ) : stories.length === 0 ? (
          <div className="empty-state">
            <p>No stories yet. {user ? <Link to="/share">Be the first to share!</Link> : 'Login to share your story.'}</p>
          </div>
        ) : (
          <div className="stories-feed">
            {stories.map(story => {
              const upvoted = user && story.upvotes.includes(user._id || user.id);
              return (
                <article key={story._id} className="story-card">
                  {/* Header */}
                  <div className="story-header">
                    <div className="story-avatar">
                      {story.author?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="story-author-info">
                      <span className="story-author">{story.author?.name}</span>
                      <span className="story-date">
                        {new Date(story.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="story-badges">
                      <span className="story-badge" style={{ background: TYPE_COLORS[story.type] }}>
                        {story.type}
                      </span>
                      <span className="story-badge" style={{ background: TAG_COLORS[story.tag] }}>
                        {story.tag}
                      </span>
                      {story.graduationYear && (
                        <span className="story-badge year-badge">
                          Batch {story.graduationYear}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Company + Role */}
                  <div className="story-company-row">
                    <div className="story-company-logo">
                      {story.company.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="story-company">{story.company}</h2>
                      <p className="story-role">{story.role}</p>
                    </div>
                    {story.package && (
                      <div className="story-package">
                        <span className="package-label">💰 Package</span>
                        <span className="package-value">{story.package}</span>
                      </div>
                    )}
                  </div>

                  {/* Main Story */}
                  <div className="story-body">
                    <p>{story.story}</p>
                  </div>

                  {/* Details Grid */}
                  <div className="story-details">
                    {story.prepTime && (
                      <div className="detail-item">
                        <span className="detail-icon">⏱️</span>
                        <div>
                          <div className="detail-label">Prep Time</div>
                          <div className="detail-value">{story.prepTime}</div>
                        </div>
                      </div>
                    )}
                    {story.rounds && (
                      <div className="detail-item">
                        <span className="detail-icon">🔄</span>
                        <div>
                          <div className="detail-label">Interview Rounds</div>
                          <div className="detail-value">{story.rounds}</div>
                        </div>
                      </div>
                    )}
                    {story.resources && (
                      <div className="detail-item">
                        <span className="detail-icon">📚</span>
                        <div>
                          <div className="detail-label">Resources Used</div>
                          <div className="detail-value">{story.resources}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tips */}
                  {story.tips && (
                    <div className="story-tips">
                      <span className="tips-label">💡 Tips for Juniors</span>
                      <p>{story.tips}</p>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="story-footer">
                    <button
                      className={`upvote-btn ${upvoted ? 'upvoted' : ''}`}
                      onClick={() => handleUpvote(story._id)}
                    >
                      ▲ {story.upvotes.length} {story.upvotes.length === 1 ? 'upvote' : 'upvotes'}
                    </button>
                    <Link to={`/stories/${story._id}`} className="comment-btn">
                      💬 {story.comments.length} {story.comments.length === 1 ? 'comment' : 'comments'}
                    </Link>
                    {user && (user._id === story.author?._id || user.id === story.author?._id) && (
                      <button
                        className="delete-story-btn"
                        onClick={async () => {
                          if (!window.confirm('Delete this story?')) return;
                          await axios.delete(`${process.env.REACT_APP_API_URL}/api/stories/${story._id}`);
                          setStories(prev => prev.filter(s => s._id !== story._id));
                        }}
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Feed;
