const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createItem, getItems, getItem,
  updateItemStatus, deleteItem, getMyItems, getStats
} = require('../controllers/itemController');
const { protect } = require('../middleware/auth');
const { optionalAuth } = require('../middleware/optionalAuth');

router.get('/stats', getStats);
router.get('/my-items', protect, getMyItems);
router.get('/', optionalAuth, getItems);
router.get('/:id', optionalAuth, getItem);

router.post('/',
  protect,
  [
    body('type').isIn(['lost', 'found']).withMessage('Type must be lost or found'),
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('date').notEmpty().withMessage('Date is required'),
  ],
  createItem
);

router.patch('/:id/status', protect, updateItemStatus);
router.delete('/:id', protect, deleteItem);

module.exports = router;
