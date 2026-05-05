import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => (
  <div className="home-page">
    <div className="home-eyebrow">
      <span className="home-eyebrow-dot" />
      NIT Jalandhar Growth Community
    </div>
    <div className="home-cta">
      <Link to="/stories" className="btn-hero-primary">Browse Stories →</Link>
      <Link to="/recommend" className="btn-hero-secondary">✨ Find Growth Partner</Link>
    </div>
  </div>
);

export default Home;
