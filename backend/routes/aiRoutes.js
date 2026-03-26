const express = require('express');
const router = express.Router();
const { extractResume, matchJobs, tailorResume } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/extract-resume', upload.single('file'), extractResume);
router.post('/match-jobs', matchJobs);
router.post('/tailor-resume', protect, tailorResume);

module.exports = router;
