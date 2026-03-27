import React from 'react';
import { motion } from 'framer-motion';
import Auth from '../components/Auth';

const AuthPage = ({ onAuthenticated }) => {
  return (
    <motion.div
      style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: 'spring' }}
    >
      <Auth onAuthenticated={onAuthenticated} />
    </motion.div>
  );
};

export default AuthPage;
