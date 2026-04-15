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
  { name: 'Razorpay', domain: 'razorpay.com' },
  { name: 'Zomato', domain: 'zomato.com' },
  { name: 'Adobe', domain: 'adobe.com' },
  { name: 'Oracle', domain: 'oracle.com' },
  { name: 'IBM', domain: 'ibm.com' },
];

const FloatingLogo = ({ company, style }) => {
  const [src, setSrc] = React.useState(`https://logo.clearbit.com/${company.domain}`);
  return (
    <div className="floating-logo" style={style}>
      <img src={src} alt={company.name}
        onError={() => setSrc(`https://www.google.com/s2/favicons?domain=${company.domain}&sz=64`)} />
    </div>
  );
};

const STATS = [
  { num: '200+', label: 'Stories Shared', icon: '📖', color: 'var(--grad)' },
  { num: '50+', label: 'Companies', icon: '🏢', color: 'var(--grad-warm)' },
  { num: '100%', label: 'Real Experiences', icon: '✅', color: 'var(--grad-green)' },
  { num: 'AI', label: 'Logo Detection', icon: '🤖', color: 'var(--grad-cool)' },
];

const Home = () => (
  <div className="home-page">
    <div className="floating-logos-bg">
      {COMPANIES.map((c, i) => (
        <FloatingLogo key={c.name} company={c} style={{
          left: `${(i % 6) * 17 + 2}%`,
          top: `${Math.floor(i / 6) * 50 + 5}%`,
          animationDelay: `${i * 0.5}s`,
          animationDuration: `${3.5 + (i % 3)}s`
        }} />
      ))}
    </div>

    <div className="hero">
      <div className="hero-badge">🎓 NIT Jalandhar Growth Community</div>
      <div className="hero-btns">
        <Link to="/stories" className="btn-hero-primary">📖 Explore Stories</Link>
        <Link to="/post-story" className="btn-hero-secondary">✍️ Share Your Story</Link>
      </div>
    </div>

    <div className="stats-row">
      {STATS.map(s => (
        <div key={s.label} className="stat-card" style={{ background: s.color }}>
          <div className="stat-icon">{s.icon}</div>
          <div className="stat-num">{s.num}</div>
          <div className="stat-label">{s.label}</div>
        </div>
      ))}
    </div>

    <div className="features-section">
      <h2 className="section-title">Why PlaceConnect?</h2>
      <div className="features-grid">
        {[
          { icon: '📅', title: 'Year-wise Journey', desc: 'See exactly what seniors did in 1st, 2nd, 3rd and 4th year to land their dream job.', color: '#ede9fe' },
          { icon: '💼', title: 'Real Companies', desc: 'Stories from Google, Microsoft, TCS, Infosys and 50+ more companies with real package details.', color: '#fce7f3' },
          { icon: '💬', title: 'Ask the Senior', desc: 'Comment on stories and get direct replies from the placed senior themselves.', color: '#dbeafe' },
          { icon: '🔗', title: 'LinkedIn Connect', desc: 'Connect directly with seniors on LinkedIn for mentorship and referrals.', color: '#d1fae5' },
        ].map(f => (
          <div key={f.title} className="feature-card" style={{ background: f.color }}>
            <div className="feature-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Home;
