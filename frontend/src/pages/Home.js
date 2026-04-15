import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const COMPANIES = [
  { name: 'Google', domain: 'google.com' },
  { name: 'Microsoft', domain: 'microsoft.com' },
  { name: 'Amazon', domain: 'amazon.com' },
  { name: 'TCS', domain: 'tcs.com' },
  { name: 'Infosys', domain: 'infosys.com' },
  { name: 'Wipro', domain: 'wipro.com' },
  { name: 'Flipkart', domain: 'flipkart.com' },
  { name: 'Paytm', domain: 'paytm.com' },
  { name: 'Zomato', domain: 'zomato.com' },
  { name: 'Swiggy', domain: 'swiggy.com' },
  { name: 'Razorpay', domain: 'razorpay.com' },
  { name: 'Atlassian', domain: 'atlassian.com' },
  { name: 'Adobe', domain: 'adobe.com' },
  { name: 'Oracle', domain: 'oracle.com' },
  { name: 'IBM', domain: 'ibm.com' },
  { name: 'Accenture', domain: 'accenture.com' },
];

const FloatingLogo = ({ company, style }) => {
  const [imgSrc, setImgSrc] = React.useState(
    `https://logo.clearbit.com/${company.domain}`
  );

  return (
    <div className="floating-logo" style={style}>
      <img
        src={imgSrc}
        alt={company.name}
        onError={() => setImgSrc(`https://www.google.com/s2/favicons?domain=${company.domain}&sz=64`)}
      />
    </div>
  );
};

const Home = () => (
  <div className="home-page">
    {/* Floating logos background */}
    <div className="floating-logos-bg">
      {COMPANIES.map((company, i) => (
        <FloatingLogo
          key={company.name}
          company={company}
          style={{
            left: `${(i % 8) * 13 + 2}%`,
            top: `${Math.floor(i / 8) * 45 + 10}%`,
            animationDelay: `${i * 0.4}s`,
            animationDuration: `${3 + (i % 4)}s`
          }}
        />
      ))}
    </div>

    {/* Hero */}
    <div className="hero">
      <div className="hero-badge">🎓 AKGEC Placement Community</div>
      <h1>
        Learn from those who
        <span className="hero-highlight"> made it</span>
      </h1>
      <p>Real placement journeys from seniors. Year-by-year breakdowns, honest tips, and AI-powered summaries.</p>
      <div className="hero-btns">
        <Link to="/stories" className="btn-hero-primary">📖 Read Stories</Link>
        <Link to="/doubts" className="btn-hero-secondary">❓ Ask a Doubt</Link>
      </div>
      <div className="hero-stats">
        <div className="hero-stat">
          <span className="stat-num">50+</span>
          <span className="stat-label">Companies</span>
        </div>
        <div className="hero-divider" />
        <div className="hero-stat">
          <span className="stat-num">100+</span>
          <span className="stat-label">Stories</span>
        </div>
        <div className="hero-divider" />
        <div className="hero-stat">
          <span className="stat-num">AI</span>
          <span className="stat-label">Summaries</span>
        </div>
      </div>
    </div>

    {/* Sections */}
    <div className="sections-grid">
      <Link to="/stories" className="section-card stories-card">
        <div className="section-icon">📖</div>
        <h2>Placement Stories</h2>
        <p>Seniors share their complete journey — what they did each year, how they prepared, and tips for you.</p>
        <ul>
          <li>✅ Year-wise breakdown (1st to 4th year)</li>
          <li>✅ Company, role & package details</li>
          <li>✅ AI-generated key takeaways</li>
          <li>✅ Real company logos</li>
        </ul>
        <span className="section-cta">Browse Stories →</span>
      </Link>

      <Link to="/doubts" className="section-card doubts-card">
        <div className="section-icon">❓</div>
        <h2>Junior Doubts</h2>
        <p>Post your placement questions and get answers from seniors who've been through it all.</p>
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
