const express = require('express');
const router = express.Router();
const { sendRequest, getMyRequests, getUnseenCount, checkSent } = require('../controllers/connectionController');
const { protect } = require('../middleware/auth');

router.post('/', protect, sendRequest);
router.get('/mine', protect, getMyRequests);
router.get('/unseen-count', protect, getUnseenCount);
router.get('/check/:toUserId', protect, checkSent);

module.exports = router;
