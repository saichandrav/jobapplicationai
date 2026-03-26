const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/jobapplicationai');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[WARNING] MongoDB Connection Failed: ${error.message}`);
    console.warn(`[WARNING] Server is running, but database API endpoints will fail until MongoDB is started.`);
    // process.exit(1);
  }
};

module.exports = connectDB;
