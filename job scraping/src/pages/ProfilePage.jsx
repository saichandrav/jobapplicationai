import React from 'react';
import { motion } from 'framer-motion';
import UserProfile from '../components/UserProfile';

const ProfilePage = ({ onProfileSaved }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: 'spring' }}
    >
      <UserProfile onProfileSaved={onProfileSaved} />
    </motion.div>
  );
};

export default ProfilePage;
