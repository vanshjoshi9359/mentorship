import React, { useState, useRef } from 'react';
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
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [type, setType] = useState('lost');
  const [form, setForm] = useState({
    title: '', description: '', category: '', location: '',
    date: new Date().toISOString().split('T')[0], contactInfo: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageFile = async (file) => {
    if (!file) return;

    // Compress image before uploading
    const compressImage = (file) => new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const img = new Image();
      img.onload = () => {
        const MAX = 800;
        let w = img.width, h = img.height;
        if (w > h && w > MAX) { h = (h * MAX) / w; w = MAX; }
        else if (h > MAX) { w = (w * MAX) / h; h = MAX; }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        canvas.toBlob(resolve, 'image/jpeg', 0.75);
      };
      img.src = URL.createObjectURL(file);
    });

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);

    // Compress then upload
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const formData = new FormData();
      formData.append('image', compressed, 'image.jpg');
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/upload`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setImageUrl(res.data.url);
    } catch (err) {
      setError('Image upload failed. You can still post without an image.');
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => handleImageFile(e.target.files[0]);

  const removeImage = () => {
    setImagePreview(null);
    setImageUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploading) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/items`, {
        ...form, type, imageUrl
      });
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
            <label>Photo (Optional)</label>
            <div className="image-upload-area">
              {imagePreview ? (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                  {uploading && <div className="upload-overlay">Uploading...</div>}
                  <button type="button" onClick={removeImage} className="remove-image">✕</button>
                </div>
              ) : (
                <div className="upload-buttons">
                  {/* Camera - opens camera on mobile */}
                  <button
                    type="button"
                    className="upload-btn camera-btn"
                    onClick={() => cameraInputRef.current.click()}
                  >
                    📷 Take Photo
                  </button>
                  {/* Gallery - opens file picker */}
                  <button
                    type="button"
                    className="upload-btn gallery-btn"
                    onClick={() => fileInputRef.current.click()}
                  >
                    🖼️ Choose from Gallery
                  </button>
                  {/* Hidden camera input */}
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </div>
              )}
            </div>
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
