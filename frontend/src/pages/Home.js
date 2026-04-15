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
    </div>
  </div>
);

export default Home;
