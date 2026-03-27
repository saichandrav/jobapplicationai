import React from 'react';
import { motion } from 'framer-motion';
import Dashboard from '../components/Dashboard';

const DashboardPage = ({ userSkills }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="ui-content"
    >
      <Dashboard userSkills={userSkills} />
    </motion.div>
  );
};

export default DashboardPage;
