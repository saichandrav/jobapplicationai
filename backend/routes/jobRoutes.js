const express = require('express');
const router = express.Router();
const { scrapeJobs } = require('../controllers/scraperController');
const { protect } = require('../middleware/authMiddleware');

router.post('/scrape', protect, scrapeJobs);

module.exports = router;
