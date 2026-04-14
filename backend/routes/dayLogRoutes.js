const express = require('express');
const router = express.Router();
const { createLog, getLogs, getLog, getWeeklySummary } = require('../controllers/dayLogController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createLog);
router.get('/', protect, getLogs);
router.get('/summary', protect, getWeeklySummary);
router.get('/:date', protect, getLog);

module.exports = router;
