import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

const HeroPage = ({ onGetStarted }) => {
  return (
    <motion.div
      className="ui-content"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="badge">
        <Sparkles size={16} style={{ display: 'inline', marginRight: '8px', marginBottom: '-3px' }} />
        Next-Gen Intelligence
      </div>

      <h1 className="title">
        Automate Your Career with <span>AI-Powered</span> Job Scraping
      </h1>

      <p className="description">
        Harness the power of artificial intelligence to effortlessly scour the web, analyze job listings, and find your perfect role faster than ever before.
      </p>

      <motion.button
        className="btn-primary"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onGetStarted}
      >
        Get Started <ArrowRight size={20} />
      </motion.button>

      <div className="glass-stats">
        <div className="stat">
          <span className="stat-value">100k+</span>
          <span className="stat-label">Jobs Scanned</span>
        </div>
        <div className="stat">
          <span className="stat-value">24/7</span>
          <span className="stat-label">AI Processing</span>
        </div>
        <div className="stat">
          <span className="stat-value">98%</span>
          <span className="stat-label">Match Rate</span>
        </div>
      </div>
    </motion.div>
  );
};

export default HeroPage;
