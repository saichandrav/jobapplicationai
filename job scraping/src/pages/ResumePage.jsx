import React from 'react';
import { motion } from 'framer-motion';
import ResumeUpload from '../components/ResumeUpload';

const ResumePage = ({ onFinish }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: 'spring' }}
    >
      <ResumeUpload onFinish={onFinish} />
    </motion.div>
  );
};

export default ResumePage;
