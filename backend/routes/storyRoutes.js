const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getStories, getStory, createStory, deleteStory,
  toggleUpvote, addComment, deleteComment
} = require('../controllers/storyController');

router.get('/', getStories);
router.get('/:id', getStory);
router.post('/', protect, createStory);
router.delete('/:id', protect, deleteStory);
router.post('/:id/upvote', protect, toggleUpvote);
router.post('/:id/comments', protect, addComment);
router.delete('/:id/comments/:commentId', protect, deleteComment);

module.exports = router;
