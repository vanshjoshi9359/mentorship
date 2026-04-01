import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CreateGroup.css';

const SKILL_COLORS = [
  '#667eea', '#764ba2', '#f093fb', '#f5576c',
  '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
  '#fa709a', '#fee140', '#a18cd1', '#fbc2eb'
];

const CreateGroup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    skills: '',
    price: '',
    duration: '',
    maxMembers: 50
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const skillsPreview = formData.skills
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(Boolean);
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/groups`, {
        name: formData.name,
        description: formData.description,
        skills: skillsArray,
        price: parseFloat(formData.price) || 0,
        duration: formData.duration,
        maxMembers: parseInt(formData.maxMembers)
      });
      navigate(`/groups/${response.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-group-page">
      <div className="form-container">
        <h1>Create Study Group</h1>
        <p className="form-subtitle">Share your knowledge and build a learning community</p>

        <form onSubmit={handleSubmit} className="create-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Group Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., Advanced Python Bootcamp"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              placeholder="Describe what students will learn, prerequisites, and what makes this group special..."
            />
          </div>

          <div className="form-group">
            <label>Skills to Teach <span className="label-hint">(comma separated)</span></label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="e.g., Python, Machine Learning, Data Analysis"
            />
            {skillsPreview.length > 0 && (
              <div className="skills-preview">
                {skillsPreview.map((skill, idx) => (
                  <span
                    key={idx}
                    className="skill-badge-preview"
                    style={{ background: SKILL_COLORS[idx % SKILL_COLORS.length] }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Price</label>
              <div className="input-prefix-wrap">
                <span className="input-prefix">₹</span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                />
              </div>
              <span className="field-hint">Enter 0 for free</span>
            </div>

            <div className="form-group">
              <label>Duration</label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="e.g., 4 weeks, 3 months"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Maximum Members</label>
            <input
              type="number"
              name="maxMembers"
              value={formData.maxMembers}
              onChange={handleChange}
              min="2"
              max="500"
              required
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/groups')} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Creating...' : '🚀 Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroup;
