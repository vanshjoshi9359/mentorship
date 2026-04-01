import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CreateGroup.css';

const CreateGroup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    skills: '',
    maxMembers: 50
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
        maxMembers: parseInt(formData.maxMembers)
      });
      navigate(`/groups/${response.data._id}`);
    } catch (error) {
      console.error('Create group error:', error);
      setError(error.response?.data?.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-group-page">
      <div className="form-container">
        <h1>Create Study Group</h1>
        <p className="form-subtitle">Start a collaborative learning group and invite others to join</p>
        <form onSubmit={handleSubmit} className="create-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="name">Group Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., Data Structures Study Group"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              placeholder="Describe the purpose and goals of this study group..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="skills">Skills to Teach</label>
            <input
              type="text"
              id="skills"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="e.g., Python, Data Structures, Algorithms"
            />
            <span className="field-hint">Separate multiple skills with commas</span>
          </div>

          <div className="form-group">
            <label htmlFor="maxMembers">Maximum Members</label>
            <input
              type="number"
              id="maxMembers"
              name="maxMembers"
              value={formData.maxMembers}
              onChange={handleChange}
              min="2"
              max="100"
              required
            />
            <span className="field-hint">Set the maximum number of members (2-100)</span>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => navigate('/groups')} 
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroup;
