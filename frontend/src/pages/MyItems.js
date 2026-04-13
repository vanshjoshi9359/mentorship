import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './MyItems.css';

const MyItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyItems();
  }, []);

  const fetchMyItems = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/items/my-items`);
      setItems(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      await axios.patch(`${process.env.REACT_APP_API_URL}/api/items/${id}/status`, { status: 'resolved' });
      fetchMyItems();
    } catch (e) {
      alert('Failed to update');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/items/${id}`);
      fetchMyItems();
    } catch (e) {
      alert('Failed to delete');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="my-items-page">
      <div className="my-items-header">
        <h1>My Posts</h1>
        <Link to="/post" className="btn-post">+ Report Item</Link>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <p>You haven't posted anything yet.</p>
          <Link to="/post" className="btn-post">Report a Lost or Found Item</Link>
        </div>
      ) : (
        <div className="my-items-list">
          {items.map(item => (
            <div key={item._id} className={`my-item-card ${item.status}`}>
              <div className="my-item-left">
                <span className={`type-badge ${item.type}`}>
                  {item.type === 'lost' ? '🔴 Lost' : '🟢 Found'}
                </span>
                <div className="my-item-info">
                  <h3>{item.title}</h3>
                  <p>📍 {item.location} · 📅 {new Date(item.date).toLocaleDateString()} · {item.category}</p>
                  {item.matches?.length > 0 && (
                    <span className="match-badge">🤖 {item.matches.length} AI Match{item.matches.length > 1 ? 'es' : ''}</span>
                  )}
                </div>
              </div>
              <div className="my-item-actions">
                <span className={`status-pill ${item.status}`}>
                  {item.status === 'open' ? '🔓 Open' : '✅ Resolved'}
                </span>
                <Link to={`/items/${item._id}`} className="btn-view">View</Link>
                {item.status === 'open' && (
                  <button onClick={() => handleResolve(item._id)} className="btn-resolve-sm">Resolve</button>
                )}
                <button onClick={() => handleDelete(item._id)} className="btn-delete-sm">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyItems;
