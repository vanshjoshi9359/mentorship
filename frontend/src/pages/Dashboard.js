import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './Dashboard.css';

const CATEGORY_COLORS = {
  productive: '#3fb950', leisure: '#58a6ff', health: '#f0883e',
  social: '#bc8cff', waste: '#f85149', other: '#8b949e'
};

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`${process.env.REACT_APP_API_URL}/api/logs`),
      axios.get(`${process.env.REACT_APP_API_URL}/api/logs/summary`)
    ]).then(([logsRes, summaryRes]) => {
      setLogs(logsRes.data);
      setSummary(summaryRes.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const todayLog = logs.find(l => l.date === today);

  if (loading) return <div className="loading">Loading your dashboard...</div>;

  return (
    <div className="dashboard-page">
      <div className="dash-header">
        <div>
          <h1>Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]} 👋</h1>
          <p>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <Link to="/log" className="btn-log-today">
          {todayLog ? '✏️ Update Today' : '+ Log Today'}
        </Link>
      </div>

      {logs.length === 0 ? (
        <div className="empty-dash">
          <div className="empty-icon">⏱️</div>
          <h2>Start tracking your time</h2>
          <p>Log your first day and get AI-powered insights about how you spend your time.</p>
          <Link to="/log" className="btn-log-today">Log Today's Activities</Link>
        </div>
      ) : (
        <>
          {/* Weekly Stats */}
          {summary && summary.avgScore && (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-value">{summary.avgScore}</div>
                <div className="stat-label">Avg Day Score</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💼</div>
                <div className="stat-value">{summary.avgProductiveHours}h</div>
                <div className="stat-label">Avg Productive</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⚠️</div>
                <div className="stat-value">{summary.avgWastedHours}h</div>
                <div className="stat-label">Avg Wasted</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-value">{summary.days}</div>
                <div className="stat-label">Days Logged</div>
              </div>
            </div>
          )}

          {/* Category Breakdown */}
          {summary?.categoryTotals && (
            <div className="category-card">
              <h2>Time Breakdown (Last 7 Days)</h2>
              <div className="category-bars">
                {Object.entries(summary.categoryTotals)
                  .sort((a, b) => b[1] - a[1])
                  .map(([cat, mins]) => {
                    const total = Object.values(summary.categoryTotals).reduce((s, v) => s + v, 0);
                    const pct = Math.round((mins / total) * 100);
                    return (
                      <div key={cat} className="cat-bar-row">
                        <span className="cat-name">{cat}</span>
                        <div className="cat-bar-wrap">
                          <div className="cat-bar-fill" style={{ width: `${pct}%`, background: CATEGORY_COLORS[cat] }} />
                        </div>
                        <span className="cat-pct" style={{ color: CATEGORY_COLORS[cat] }}>{pct}%</span>
                        <span className="cat-time">{Math.round(mins / 60)}h</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Recent Logs */}
          <div className="recent-logs">
            <h2>Recent Days</h2>
            <div className="logs-list">
              {logs.slice(0, 7).map(log => {
                const scoreColor = log.score >= 70 ? '#3fb950' : log.score >= 50 ? '#d29922' : '#f85149';
                return (
                  <Link to={`/day/${log.date}`} key={log._id} className="log-row">
                    <div className="log-date">
                      <span className="log-day">{new Date(log.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' })}</span>
                      <span className="log-full-date">{new Date(log.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="log-score" style={{ color: scoreColor }}>{log.score}</div>
                    <div className="log-hours">
                      <span style={{ color: '#3fb950' }}>{log.productiveHours}h productive</span>
                      <span style={{ color: '#f85149' }}>{log.wastedHours}h wasted</span>
                    </div>
                    <div className="log-mood">{
                      { great: '😄', good: '🙂', okay: '😐', bad: '😕', terrible: '😞' }[log.mood]
                    }</div>
                    <span className="log-arrow">→</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
