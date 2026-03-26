const express = require('express');
const router = express.Router();
const { triggerWorkflow } = require('../controllers/n8nController');

router.post('/webhook', triggerWorkflow);

module.exports = router;
