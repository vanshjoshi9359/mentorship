import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './ItemDetail.css';

const ItemDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchItem = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/items/${id}`);
      setItem(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    try {
      await axios.patch(`${process.env.REACT_APP_API_URL}/api/items/${id}/status`, { status: 'resolved' });
      fetchItem();
    } catch (e) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/items/${id}`);
      navigate('/');
    } catch (e) {
      alert('Failed to delete');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!item) return <div className="error">Item not found</div>;

  const isOwner = user && item.postedBy._id === user._id;

  return (
    <div className="item-detail-page">
      <Link to="/" className="back-link">← Back to listings</Link>

      <div className="detail-grid">
        {/* Main Content */}
        <div className="detail-main">
          <div className="detail-card">
            <div className="detail-header">
              <span className={`type-badge ${item.type}`}>
                {item.type === 'lost' ? '🔴 Lost' : '🟢 Found'}
              </span>
              <span className={`status-badge ${item.status}`}>
                {item.status === 'open' ? '🔓 Open' : '✅ Resolved'}
              </span>
            </div>

            {item.imageUrl && (
              <div className="detail-image">
                <img src={item.imageUrl} alt={item.title} />
              </div>
            )}

            <h1 className="detail-title">{item.title}</h1>

            <div className="detail-meta-grid">
              <div className="meta-item">
                <span className="meta-label">Category</span>
                <span className="meta-value">{item.category}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Location</span>
                <span className="meta-value">📍 {item.location}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Date</span>
                <span className="meta-value">📅 {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Posted by</span>
                <span className="meta-value">👤 {item.postedBy.name}</span>
              </div>
            </div>

            <div className="detail-description">
              <h3>Description</h3>
              <p>{item.description}</p>
            </div>

            {item.aiTags?.length > 0 && (
              <div className="ai-tags">
                <span className="ai-label">🤖 AI Tags:</span>
                {item.aiTags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            )}

            {item.contactInfo && (
              <div className="contact-section">
                <h3>Contact</h3>
                <p className="contact-info">📞 {item.contactInfo}</p>
              </div>
            )}

            {isOwner && item.status === 'open' && (
              <div className="owner-actions">
                <button onClick={handleResolve} className="btn-resolve">✅ Mark as Resolved</button>
                <button onClick={handleDelete} className="btn-delete">🗑️ Delete</button>
              </div>
            )}
          </div>
        </div>

        {/* AI Matches Sidebar */}
        <div className="detail-sidebar">
          <div className="matches-card">
            <h2>🤖 AI Matches</h2>
            <p className="matches-subtitle">
              Potential {item.type === 'lost' ? 'found' : 'lost'} items that may match yours
            </p>

            {!item.matches || item.matches.length === 0 ? (
              <div className="no-matches">
                <p>No matches found yet.</p>
                <p>Check back later as more items are reported.</p>
              </div>
            ) : (
              <div className="matches-list">
                {item.matches.map(match => (
                  <Link to={`/items/${match._id}`} key={match._id} className="match-card">
                    <div className={`match-type ${match.type}`}>
                      {match.type === 'lost' ? '🔴' : '🟢'}
                    </div>
                    <div className="match-info">
                      <h4>{match.title}</h4>
                      <p>📍 {match.location}</p>
                      <p>📅 {new Date(match.date).toLocaleDateString()}</p>
                    </div>
                    <span className="match-arrow">→</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="tips-card">
            <h3>💡 Tips</h3>
            <ul>
              <li>Contact the poster directly using their contact info</li>
              <li>Visit the college security office with proof of ownership</li>
              <li>Check the lost & found box near the main gate</li>
              <li>Mark as resolved once the item is returned</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;
