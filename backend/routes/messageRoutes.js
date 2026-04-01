const express = require('express');
const router = express.Router();
const {
  getGroupMessages,
  createMessage,
  resolveMessage,
  deleteMessage
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.get('/group/:groupId', getGroupMessages);
router.post('/', protect, createMessage);
router.patch('/:id/resolve', protect, resolveMessage);
router.delete('/:id', protect, deleteMessage);

module.exports = router;
