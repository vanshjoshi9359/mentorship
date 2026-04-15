import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './Stories.css';

const Stories = () => {
  const { user } = useContext(AuthContext);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    fetchStories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const fetchStories = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.company = search;
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/stories`, { params });
      setStories(res.data.stories);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="stories-page">
      <div className="page-header">
        <h1>📖 Placement Stories</h1>
        {user && <Link to="/post-story" className="btn-share">+ Share Your Story</Link>}
      </div>

      <div className="filters">
        <input
          className="filter-input"
          placeholder="🔍 Search by company..."
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && setSearch(searchInput)}
        />
        <button className="btn-share" onClick={() => setSearch(searchInput)} style={{ padding: '10px 20px', fontSize: '14px' }}>Search</button>
        {search && <button onClick={() => { setSearch(''); setSearchInput(''); }} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: '14px' }}>✕ Clear</button>}
      </div>

      {loading ? (
        <div className="loading">Loading stories...</div>
      ) : stories.length === 0 ? (
        <div className="empty-state">
          <p>No stories yet. <Link to="/post-story">Be the first to share!</Link></p>
        </div>
      ) : (
        <div className="stories-grid">
          {stories.map(story => (
            <Link to={`/stories/${story._id}`} key={story._id} className="story-card">
              <div className="story-top">
                <div className="company-logo">{story.company[0]}</div>
                <div className="story-meta">
                  <div className="story-company">{story.company}</div>
                  <div className="story-role">{story.role}</div>
                  <div className="story-badges">
                    {story.package && <span className="badge badge-pkg">💰 {story.package}</span>}
                    <span className="badge badge-batch">🎓 {story.batch}</span>
                    {story.branch && <span className="badge badge-branch">{story.branch}</span>}
                  </div>
                </div>
              </div>

              {story.aiSummary && (
                <div className="story-summary">
                  <div className="story-summary-label">🤖 AI Summary</div>
                  {story.aiSummary.split('\n').slice(0, 2).join('\n')}
                </div>
              )}

              <div className="story-footer">
                <span className="story-author">👤 {story.authorId?.name}</span>
                <span>📅 {new Date(story.createdAt).toLocaleDateString()}</span>
                <span className="story-upvotes">❤️ {story.upvotes}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Stories;
