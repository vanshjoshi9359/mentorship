import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './History.css';

const History = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/logs`)
      .then(res => setLogs(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading history...</div>;

  return (
    <div className="history-page">
      <div className="history-header">
        <h1>Your History</h1>
        <Link to="/log" className="btn-new">+ Log New Day</Link>
      </div>

      {logs.length === 0 ? (
        <div className="empty-state">
          <p>No logs yet. <Link to="/log">Log your first day!</Link></p>
        </div>
      ) : (
        <div className="history-grid">
          {logs.map(log => {
            const scoreColor = log.score >= 70 ? '#3fb950' : log.score >= 50 ? '#d29922' : '#f85149';
            return (
              <Link to={`/day/${log.date}`} key={log._id} className="history-card">
                <div className="hc-top">
                  <div className="hc-date">
                    <span className="hc-day">{new Date(log.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' })}</span>
                    <span className="hc-full">{new Date(log.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="hc-score" style={{ color: scoreColor }}>{log.score}</div>
                  <div className="hc-mood">{
                    { great: '😄', good: '🙂', okay: '😐', bad: '😕', terrible: '😞' }[log.mood]
                  }</div>
                </div>
                <div className="hc-bar">
                  <div className="hc-bar-fill" style={{ width: `${log.score}%`, background: scoreColor }} />
                </div>
                <div className="hc-stats">
                  <span style={{ color: '#3fb950' }}>💼 {log.productiveHours}h</span>
                  <span style={{ color: '#f85149' }}>⚠️ {log.wastedHours}h</span>
                </div>
                <p className="hc-insight">{log.insights?.slice(0, 80)}...</p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default History;
