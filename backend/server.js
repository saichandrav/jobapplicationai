const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/n8n', require('./routes/n8nRoutes'));

// Basic health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Job Application AI Node.js Backend is running!' });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
