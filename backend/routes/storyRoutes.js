const express = require('express');
const router = express.Router();
const { createStory, getStories, getStory, upvoteStory, deleteStory } = require('../controllers/storyController');
const { protect } = require('../middleware/auth');
const { optionalAuth } = require('../middleware/optionalAuth');

router.get('/', optionalAuth, getStories);
router.get('/:id', optionalAuth, getStory);
router.post('/', protect, createStory);
router.post('/:id/upvote', protect, upvoteStory);
router.delete('/:id', protect, deleteStory);

module.exports = router;
