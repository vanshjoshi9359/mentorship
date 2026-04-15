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
  { name: 'Atlassian', domain: 'atlassian.com' },
  { name: 'Paytm', domain: 'paytm.com' },
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

const Home = () => (
  <div className="home-page">
    {/* Floating logos background */}
    <div className="floating-logos-bg">
      {COMPANIES.map((c, i) => (
        <FloatingLogo key={c.name} company={c} style={{
          left: `${(i % 7) * 14 + 2}%`,
          top: `${Math.floor(i / 7) * 48 + 8}%`,
          animationDelay: `${i * 0.4}s`,
          animationDuration: `${3.5 + (i % 4)}s`
        }} />
      ))}
    </div>

    {/* Hero */}
    <div className="hero">
      <div className="hero-badge-wrap">
        <span className="hero-badge-dot" />
        <span>NIT Jalandhar Growth Community</span>
      </div>

      <div className="hero-cta">
        <Link to="/stories" className="btn-hero-primary">📖 Explore Stories</Link>
        <Link to="/recommend" className="btn-hero-secondary">🤖 Find Growth Partner</Link>
      </div>

      {/* Animated marquee of companies */}
      <div className="marquee-wrap">
        <div className="marquee-track">
          {[...COMPANIES, ...COMPANIES].map((c, i) => (
            <div key={i} className="marquee-item">
              <img
                src={`https://logo.clearbit.com/${c.domain}`}
                alt={c.name}
                onError={e => { e.target.style.display = 'none'; }}
              />
              <span>{c.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default Home;
