const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createGroup, getGroups, getUserGroups, getGroup,
  joinGroup, leaveGroup, getLeaderboard,
  generateInviteCode, joinByInviteCode, getGroupByInviteCode,
  requestJoin, getJoinRequests, handleJoinRequest
} = require('../controllers/groupController');
const { protect } = require('../middleware/auth');

router.post('/', protect, [
    body('name').trim().notEmpty().withMessage('Group name is required'),
    body('description').trim().notEmpty().withMessage('Description is required')
  ], createGroup);

router.get('/', getGroups);
router.get('/my-groups', protect, getUserGroups);
router.get('/invite/:code', getGroupByInviteCode);
router.post('/invite/:code/join', protect, joinByInviteCode);
router.get('/:id', getGroup);
router.post('/:id/join', protect, joinGroup);
router.post('/:id/leave', protect, leaveGroup);
router.get('/:id/leaderboard', getLeaderboard);
router.post('/:id/invite', protect, generateInviteCode);
router.post('/:id/request-join', protect, requestJoin);
router.get('/:id/join-requests', protect, getJoinRequests);
router.post('/:id/handle-request', protect, handleJoinRequest);

module.exports = router;
