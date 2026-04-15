import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PostStory.css';

const YEAR_PROMPTS = {
  1: ['What did you study?', 'Any clubs/activities?', 'First coding steps?', 'Mistakes to avoid?'],
  2: ['DSA preparation?', 'Projects built?', 'Internship attempts?', 'Skills learned?'],
  3: ['Internship experience?', 'Interview preparation?', 'Competitive programming?', 'Key projects?'],
  4: ['Placement preparation?', 'Companies applied to?', 'Interview rounds?', 'Final offer details?']
};

const YEAR_LABELS = { 1: '1st Year', 2: '2nd Year', 3: '3rd Year', 4: '4th Year' };

const PostStory = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ company: '', role: '', package: '', batch: '', branch: '', tips: '' });
  const [years, setYears] = useState({ 1: '', 2: '', 3: '', 4: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const addPrompt = (year, prompt) => {
    setYears(prev => ({ ...prev, [year]: prev[year] ? `${prev[year]}\n${prompt}: ` : `${prompt}: ` }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const filledYears = Object.entries(years).filter(([, v]) => v.trim()).map(([y, content]) => ({ year: parseInt(y), content }));
    if (filledYears.length === 0) { setError('Please fill at least one year section.'); return; }

    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/stories`, { ...form, years: filledYears });
      navigate(`/stories/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post story');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-story-page">
      <div className="post-container">
        <h1>Share Your Placement Story</h1>
        <p className="post-subtitle">Help juniors by sharing your journey. AI will generate a summary automatically.</p>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-msg">⚠️ {error}</div>}

          <div className="form-grid">
            <div className="form-group">
              <label>Company *</label>
              <input name="company" value={form.company} onChange={handleChange} required placeholder="e.g. Google, TCS, Infosys" />
            </div>
            <div className="form-group">
              <label>Role *</label>
              <input name="role" value={form.role} onChange={handleChange} required placeholder="e.g. Software Engineer" />
            </div>
            <div className="form-group">
              <label>Package (CTC)</label>
              <input name="package" value={form.package} onChange={handleChange} placeholder="e.g. 12 LPA" />
            </div>
            <div className="form-group">
              <label>Batch *</label>
              <input name="batch" value={form.batch} onChange={handleChange} required placeholder="e.g. 2024" />
            </div>
            <div className="form-group">
              <label>Branch</label>
              <input name="branch" value={form.branch} onChange={handleChange} placeholder="e.g. CSE, IT, ECE" />
            </div>
          </div>

          <div className="year-section">
            <h2>📅 Year-wise Journey</h2>
            {[1, 2, 3, 4].map(year => (
              <div key={year} className="year-block">
                <h3>{YEAR_LABELS[year]}</h3>
                <div className="year-prompts">
                  {YEAR_PROMPTS[year].map(p => (
                    <button key={p} type="button" className="year-prompt" onClick={() => addPrompt(year, p)}>+ {p}</button>
                  ))}
                </div>
                <textarea
                  value={years[year]}
                  onChange={e => setYears(prev => ({ ...prev, [year]: e.target.value }))}
                  placeholder={`What did you do in your ${YEAR_LABELS[year]}? What worked, what didn't?`}
                  rows="5"
                />
              </div>
            ))}
          </div>

          <div className="form-group" style={{ marginTop: '24px' }}>
            <label>💡 Final Tips for Juniors</label>
            <textarea name="tips" value={form.tips} onChange={handleChange} placeholder="What advice would you give to juniors starting their placement journey?" rows="4" />
          </div>

          <div className="ai-notice">
            🤖 <strong>AI Summary:</strong> After posting, Groq AI will automatically generate key takeaways from your story to help juniors quickly understand your journey.
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate('/stories')}>Cancel</button>
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? '⏳ Posting & Generating AI Summary...' : '🚀 Share My Story'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostStory;
