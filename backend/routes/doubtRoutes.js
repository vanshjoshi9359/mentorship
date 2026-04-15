const express = require('express');
const router = express.Router();
const { createDoubt, getDoubts, getDoubt, addReply, upvoteDoubt, resolveDoubt } = require('../controllers/doubtController');
const { protect } = require('../middleware/auth');
const { optionalAuth } = require('../middleware/optionalAuth');

router.get('/', optionalAuth, getDoubts);
router.get('/:id', optionalAuth, getDoubt);
router.post('/', protect, createDoubt);
router.post('/:id/reply', protect, addReply);
router.post('/:id/upvote', protect, upvoteDoubt);
router.patch('/:id/resolve', protect, resolveDoubt);

module.exports = router;
