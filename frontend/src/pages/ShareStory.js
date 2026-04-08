import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ShareStory.css';

const ShareStory = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    company: '', role: '', type: 'placement', package: '',
    tag: 'on-campus', prepTime: '', resources: '', rounds: '',
    tips: '', story: '', graduationYear: ''
  });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/stories`, form);
      navigate(`/stories/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to share story');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="share-page">
      <div className="share-container">
        <h1>Share Your Story</h1>
        <p className="share-subtitle">Help juniors by sharing your placement or internship experience</p>

        <form onSubmit={handleSubmit} className="share-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-row-2">
            <div className="form-group">
              <label>Company Name *</label>
              <input name="company" value={form.company} onChange={handleChange} required placeholder="e.g. Google, Infosys" />
            </div>
            <div className="form-group">
              <label>Role / Position *</label>
              <input name="role" value={form.role} onChange={handleChange} required placeholder="e.g. SDE Intern, Data Analyst" />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Type *</label>
              <select name="type" value={form.type} onChange={handleChange}>
                <option value="placement">Placement (Full-time)</option>
                <option value="internship">Internship</option>
              </select>
            </div>
            <div className="form-group">
              <label>Source *</label>
              <select name="tag" value={form.tag} onChange={handleChange}>
                <option value="on-campus">On-Campus</option>
                <option value="off-campus">Off-Campus</option>
                <option value="referral">Referral</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Package / Stipend</label>
              <input name="package" value={form.package} onChange={handleChange} placeholder="e.g. 12 LPA, ₹40k/month" />
            </div>
            <div className="form-group">
              <label>Graduation Year</label>
              <select name="graduationYear" value={form.graduationYear} onChange={handleChange}>
                <option value="">Select year</option>
                {[2022,2023,2024,2025,2026,2027,2028].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Preparation Time</label>
              <input name="prepTime" value={form.prepTime} onChange={handleChange} placeholder="e.g. 3 months, 6 weeks" />
            </div>
            <div className="form-group">
              <label>Interview Rounds</label>
              <textarea name="rounds" value={form.rounds} onChange={handleChange} rows="3"
                placeholder="Describe the interview rounds — OA, technical, HR, etc." />
            </div>
          </div>

          <div className="form-group">
            <label>Resources Used</label>
            <textarea name="resources" value={form.resources} onChange={handleChange} rows="3"
              placeholder="Books, courses, platforms you used to prepare..." />
          </div>

          <div className="form-group">
            <label>Your Story *</label>
            <textarea name="story" value={form.story} onChange={handleChange} rows="6" required
              placeholder="Tell your full story — how you applied, what the process was like, how you felt..." />
          </div>

          <div className="form-group">
            <label>Tips for Juniors</label>
            <textarea name="tips" value={form.tips} onChange={handleChange} rows="4"
              placeholder="What advice would you give to juniors preparing for this company or role?" />
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/')} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Sharing...' : '🚀 Share Story'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShareStory;
