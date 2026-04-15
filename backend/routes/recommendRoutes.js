const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../controllers/recommendController');
const { protect } = require('../middleware/auth');

router.post('/', protect, getRecommendations);

module.exports = router;
