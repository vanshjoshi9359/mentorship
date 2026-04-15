const express = require('express');
const router = express.Router();
const { getRecommendations, saveProfile, getMyProfile } = require('../controllers/recommendController');
const { protect } = require('../middleware/auth');

router.post('/', protect, getRecommendations);
router.post('/profile', protect, saveProfile);
router.get('/profile', protect, getMyProfile);

module.exports = router;
