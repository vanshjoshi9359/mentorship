import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LogDay.css';

const PROMPTS = [
  "What time did you wake up?",
  "What did you work on or study today?",
  "How much time did you spend on social media or entertainment?",
  "Did you exercise or do anything for your health?",
  "What did you eat and when?",
  "Did you meet or talk to anyone important?",
  "What was the best part of your day?",
  "What did you waste time on?",
  "How are you feeling right now?"
];

const LogDay = () => {
  const navigate = useNavigate();
  const [entry, setEntry] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    setCharCount(entry.length);
  }, [entry]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (entry.trim().length < 50) {
      setError('Please write at least 50 characters for a meaningful analysis.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/logs`, { rawEntry: entry, date });
      navigate(`/day/${res.data.date}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyse. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addPrompt = (prompt) => {
    setEntry(prev => prev ? `${prev}\n${prompt} ` : `${prompt} `);
  };

  return (
    <div className="log-day-page">
      <div className="log-container">
        <div className="log-header">
          <h1>How was your day?</h1>
          <p>Write freely about what you did today. AI will analyse your time usage.</p>
        </div>

        <div className="prompt-chips">
          {PROMPTS.map((p, i) => (
            <button key={i} type="button" className="prompt-chip" onClick={() => addPrompt(p)}>
              + {p}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="log-form">
          <div className="date-row">
            <label>Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="textarea-wrap">
            <textarea
              value={entry}
              onChange={e => setEntry(e.target.value)}
              placeholder="Today I woke up at 7am, had breakfast, then studied for 2 hours. After that I spent about 3 hours on YouTube and Instagram. I went for a 30 minute walk in the evening..."
              rows="12"
              required
            />
            <div className="char-count">{charCount} characters</div>
          </div>

          {error && <div className="error-msg">⚠️ {error}</div>}

          <button type="submit" disabled={loading} className="btn-analyse">
            {loading ? (
              <span className="loading-text">
                <span className="spinner"></span>
                Analysing with AI...
              </span>
            ) : '✨ Analyse My Day'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LogDay;
