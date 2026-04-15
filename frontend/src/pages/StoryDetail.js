import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './StoryDetail.css';

const YEAR_LABELS = { 1: '1st Year', 2: '2nd Year', 3: '3rd Year', 4: '4th Year' };
const YEAR_EMOJIS = { 1: '🌱', 2: '📚', 3: '💻', 4: '🚀' };

const StoryDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upvoted, setUpvoted] = useState(false);

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

  if (loading) return <div className="loading">Loading story...</div>;
  if (!story) return <div className="error">Story not found</div>;

  const sortedYears = [...story.years].sort((a, b) => a.year - b.year);

  return (
    <div className="story-detail-page">
      <Link to="/stories" className="back-link">← Back to Stories</Link>

      <div className="story-header">
        <div className="story-company-row">
          <div className="company-logo-lg">{story.company[0]}</div>
          <div className="company-info">
            <h1>{story.company}</h1>
            <p>{story.role}</p>
          </div>
        </div>

        <div className="story-badges">
          {story.package && <span className="badge badge-pkg">💰 {story.package}</span>}
          <span className="badge badge-batch">🎓 Batch {story.batch}</span>
          {story.branch && <span className="badge badge-branch">{story.branch}</span>}
        </div>

        {story.aiSummary && (
          <div className="ai-summary-box">
            <h3>🤖 AI Key Takeaways</h3>
            <p>{story.aiSummary}</p>
          </div>
        )}

        <div className="story-actions">
          <button onClick={handleUpvote} className={`btn-upvote ${upvoted ? 'upvoted' : ''}`}>
            ❤️ {story.upvotes} {upvoted ? 'Liked' : 'Like'}
          </button>
          <span className="story-author-info">
            By {story.authorId?.name} · {new Date(story.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="years-section">
        {sortedYears.map(y => (
          <div key={y.year} className="year-card">
            <div className="year-card-header">
              <div className="year-badge">{YEAR_EMOJIS[y.year]}</div>
              <h2>{YEAR_LABELS[y.year]}</h2>
            </div>
            <p className="year-content">{y.content}</p>
          </div>
        ))}
      </div>

      {story.tips && (
        <div className="tips-card">
          <h2>💡 Tips for Juniors</h2>
          <p className="tips-content">{story.tips}</p>
        </div>
      )}
    </div>
  );
};

export default StoryDetail;
