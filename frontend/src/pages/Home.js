import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => (
  <div className="home-page">
    <div className="hero">
      <h1>🎓 PlaceConnect</h1>
      <p>Real placement journeys from AKGEC seniors. Learn from their experience, ask your doubts.</p>
      <div className="hero-btns">
        <Link to="/stories" className="btn-primary-lg">📖 Read Stories</Link>
        <Link to="/doubts" className="btn-secondary-lg">❓ Ask a Doubt</Link>
      </div>
    </div>

    <div className="sections-grid">
      <Link to="/stories" className="section-card stories-card">
        <div className="section-icon">📖</div>
        <h2>Placement Stories</h2>
        <p>Seniors share their complete journey — what they did in each year, how they prepared, and tips for you.</p>
        <ul>
          <li>✅ Year-wise breakdown (1st to 4th year)</li>
          <li>✅ Company, role & package details</li>
          <li>✅ AI-generated key takeaways</li>
          <li>✅ Actionable tips from placed seniors</li>
        </ul>
        <span className="section-cta">Browse Stories →</span>
      </Link>

      <Link to="/doubts" className="section-card doubts-card">
        <div className="section-icon">❓</div>
        <h2>Junior Doubts</h2>
        <p>Post your placement-related questions and get answers from seniors who've been through it.</p>
        <ul>
          <li>✅ Ask about DSA, projects, resume</li>
          <li>✅ Get answers from placed seniors</li>
          <li>✅ Upvote helpful answers</li>
          <li>✅ Mark doubts as resolved</li>
        </ul>
        <span className="section-cta">Ask a Doubt →</span>
      </Link>
    </div>
  </div>
);

export default Home;
