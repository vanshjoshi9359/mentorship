import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './DayDetail.css';

const CATEGORY_COLORS = {
  productive: '#3fb950',
  leisure: '#58a6ff',
  health: '#f0883e',
  social: '#bc8cff',
  waste: '#f85149',
  other: '#8b949e'
};

const CATEGORY_ICONS = {
  productive: '💼', leisure: '🎮', health: '💪',
  social: '👥', waste: '⚠️', other: '📦'
};

const ScoreRing = ({ score }) => {
  const color = score >= 70 ? '#3fb950' : score >= 50 ? '#d29922' : '#f85149';
  const label = score >= 70 ? 'Great Day!' : score >= 50 ? 'Decent Day' : 'Needs Work';
  return (
    <div className="score-ring-wrap">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r="60" fill="none" stroke="var(--bg4)" strokeWidth="12" />
        <circle
          cx="70" cy="70" r="60" fill="none"
          stroke={color} strokeWidth="12"
          strokeDasharray={`${(score / 100) * 376} 376`}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div className="score-ring-text">
        <span className="score-number" style={{ color }}>{score}</span>
        <span className="score-label">{label}</span>
      </div>
    </div>
  );
};

const DayDetail = () => {
  const { date } = useParams();
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/logs/${date}`)
      .then(res => setLog(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [date]);

  if (loading) return <div className="loading">Analysing your day...</div>;
  if (!log) return <div className="error">No log found for this date.</div>;

  const totalMins = log.activities.reduce((s, a) => s + a.duration, 0);

  return (
    <div className="day-detail-page">
      <div className="day-header">
        <Link to="/history" className="back-link">← Back</Link>
        <h1>{new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h1>
        <span className={`mood-badge mood-${log.mood}`}>{
          { great: '😄 Great', good: '🙂 Good', okay: '😐 Okay', bad: '😕 Bad', terrible: '😞 Terrible' }[log.mood]
        }</span>
      </div>

      <div className="detail-grid">
        {/* Score */}
        <div className="detail-card score-card">
          <h2>Day Score</h2>
          <ScoreRing score={log.score} />
          <div className="time-stats">
            <div className="time-stat">
              <span className="ts-value" style={{ color: '#3fb950' }}>{log.productiveHours}h</span>
              <span className="ts-label">Productive</span>
            </div>
            <div className="time-stat">
              <span className="ts-value" style={{ color: '#f85149' }}>{log.wastedHours}h</span>
              <span className="ts-label">Wasted</span>
            </div>
            <div className="time-stat">
              <span className="ts-value" style={{ color: '#58a6ff' }}>{log.totalHours}h</span>
              <span className="ts-label">Total</span>
            </div>
          </div>
        </div>

        {/* Activities */}
        <div className="detail-card activities-card">
          <h2>Activities</h2>
          <div className="activities-list">
            {log.activities.map((act, i) => {
              const pct = totalMins > 0 ? Math.round((act.duration / totalMins) * 100) : 0;
              return (
                <div key={i} className="activity-item">
                  <div className="act-header">
                    <span className="act-icon">{CATEGORY_ICONS[act.category]}</span>
                    <span className="act-name">{act.name}</span>
                    <span className="act-time">{act.duration >= 60 ? `${Math.floor(act.duration / 60)}h ${act.duration % 60}m` : `${act.duration}m`}</span>
                  </div>
                  <div className="act-bar-wrap">
                    <div
                      className="act-bar-fill"
                      style={{ width: `${pct}%`, background: CATEGORY_COLORS[act.category] }}
                    />
                  </div>
                  <span className="act-pct" style={{ color: CATEGORY_COLORS[act.category] }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Insights */}
        <div className="detail-card insights-card">
          <h2>🤖 AI Insights</h2>
          <p className="insights-text">{log.insights}</p>
          {log.highlights?.length > 0 && (
            <div className="highlights">
              <h3>✅ Highlights</h3>
              {log.highlights.map((h, i) => <div key={i} className="highlight-item">🌟 {h}</div>)}
            </div>
          )}
        </div>

        {/* Suggestions */}
        <div className="detail-card suggestions-card">
          <h2>💡 Suggestions for Tomorrow</h2>
          <div className="suggestions-list">
            {log.suggestions?.map((s, i) => (
              <div key={i} className="suggestion-item">
                <span className="sug-num">{i + 1}</span>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Full AI Analysis */}
        <div className="detail-card analysis-card">
          <h2>📊 Full Analysis</h2>
          <p className="analysis-text">{log.aiAnalysis}</p>
        </div>

        {/* Raw Entry */}
        <div className="detail-card raw-card">
          <h2>📝 Your Entry</h2>
          <p className="raw-text">{log.rawEntry}</p>
        </div>
      </div>
    </div>
  );
};

export default DayDetail;
