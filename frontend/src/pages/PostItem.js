import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PostItem.css';

const CATEGORIES = ['Electronics', 'Books', 'Clothing', 'ID/Cards', 'Keys', 'Bags', 'Jewellery', 'Sports', 'Stationery', 'Other'];

const LOCATIONS = [
  'Library', 'Canteen', 'Main Gate', 'Hostel Block A', 'Hostel Block B',
  'Hostel Block C', 'Lecture Hall 1', 'Lecture Hall 2', 'Lab Block',
  'Sports Ground', 'Parking Area', 'Admin Block', 'Other'
];

const PostItem = () => {
  const navigate = useNavigate();
  const [type, setType] = useState('lost');
  const [form, setForm] = useState({
    title: '', description: '', category: '', location: '',
    date: new Date().toISOString().split('T')[0], imageUrl: '', contactInfo: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/items`, { ...form, type });
      navigate(`/items/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-item-page">
      <div className="post-container">
        <h1>Report an Item</h1>
        <p className="post-subtitle">Our AI will automatically find potential matches for you</p>

        {/* Type Toggle */}
        <div className="type-toggle">
          <button
            type="button"
            className={`toggle-btn ${type === 'lost' ? 'active lost' : ''}`}
            onClick={() => setType('lost')}
          >
            🔴 I Lost Something
          </button>
          <button
            type="button"
            className={`toggle-btn ${type === 'found' ? 'active found' : ''}`}
            onClick={() => setType('found')}
          >
            🟢 I Found Something
          </button>
        </div>

        <form onSubmit={handleSubmit} className="post-form">
          {error && <div className="error-msg">{error}</div>}

          <div className="form-group">
            <label>Item Title *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder={type === 'lost' ? 'e.g. Black iPhone 14' : 'e.g. Found blue water bottle'}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category *</label>
              <select name="category" value={form.category} onChange={handleChange} required>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Date {type === 'lost' ? 'Lost' : 'Found'} *</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Location *</label>
            <select name="location" value={form.location} onChange={handleChange} required>
              <option value="">Select location</option>
              {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows="4"
              placeholder="Describe the item in detail - color, brand, any identifying marks..."
            />
          </div>

          <div className="form-group">
            <label>Image URL (optional)</label>
            <input
              name="imageUrl"
              value={form.imageUrl}
              onChange={handleChange}
              placeholder="https://... (paste image link)"
            />
          </div>

          <div className="form-group">
            <label>Contact Info (optional)</label>
            <input
              name="contactInfo"
              value={form.contactInfo}
              onChange={handleChange}
              placeholder="Phone number or email to contact you"
            />
          </div>

          <div className="ai-notice">
            🤖 <strong>AI Matching:</strong> After posting, our AI will automatically scan existing items and find potential matches based on category, location, date, and description.
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/')} className="btn-cancel">Cancel</button>
            <button type="submit" disabled={loading} className={`btn-submit ${type}`}>
              {loading ? 'Posting...' : `Post ${type === 'lost' ? 'Lost' : 'Found'} Item`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostItem;
