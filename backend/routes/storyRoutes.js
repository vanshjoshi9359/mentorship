const express = require('express');
const router = express.Router();
const { createStory, getStories, getStory, upvoteStory, deleteStory, addComment, replyComment } = require('../controllers/storyController');
const { protect } = require('../middleware/auth');
const { optionalAuth } = require('../middleware/optionalAuth');

router.get('/', optionalAuth, getStories);
router.get('/:id', optionalAuth, getStory);
router.post('/', protect, createStory);
router.post('/:id/upvote', protect, upvoteStory);
router.post('/:id/comment', protect, addComment);
router.post('/:id/comment/:commentId/reply', protect, replyComment);
router.delete('/:id', protect, deleteStory);

module.exports = router;
