const Group = require('../models/Group');
const Task = require('../models/Task');
const User = require('../models/User');
const crypto = require('crypto');

// Create a new group
exports.createGroup = async (req, res) => {
  try {
    const { name, description, topicId, isPublic, maxMembers } = req.body;

    const group = await Group.create({
      name,
      description,
      creatorId: req.user._id,
      topicId,
      isPublic: isPublic !== undefined ? isPublic : true,
      maxMembers: maxMembers || 50,
      members: [{
        userId: req.user._id,
        role: 'admin'
      }]
    });

    await group.populate('creatorId', 'name email');
    await group.populate('members.userId', 'name email');
    if (topicId) {
      await group.populate('topicId', 'name');
    }

    res.status(201).json(group);
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ message: 'Failed to create group' });
  }
};

// Get all groups
exports.getGroups = async (req, res) => {
  try {
    const groups = await Group.find({ isPublic: true })
      .populate('creatorId', 'name email')
      .populate('topicId', 'name')
      .sort({ createdAt: -1 });

    const groupsWithStats = groups.map(group => ({
      ...group.toObject(),
      memberCount: group.members.length
    }));

    res.json(groupsWithStats);
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ message: 'Failed to fetch groups' });
  }
};

// Get user's groups
exports.getUserGroups = async (req, res) => {
  try {
    const groups = await Group.find({
      'members.userId': req.user._id
    })
      .populate('creatorId', 'name email')
      .populate('topicId', 'name')
      .sort({ createdAt: -1 });

    res.json(groups);
  } catch (error) {
    console.error('Get user groups error:', error);
    res.status(500).json({ message: 'Failed to fetch user groups' });
  }
};

// Get single group
exports.getGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('creatorId', 'name email')
      .populate('members.userId', 'name email')
      .populate('topicId', 'name');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.json(group);
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ message: 'Failed to fetch group' });
  }
};

// Join a group
exports.joinGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.members.length >= group.maxMembers) {
      return res.status(400).json({ message: 'Group is full' });
    }

    const isMember = group.members.some(
      member => member.userId.toString() === req.user._id.toString()
    );

    if (isMember) {
      return res.status(400).json({ message: 'Already a member' });
    }

    group.members.push({
      userId: req.user._id,
      role: 'member'
    });

    await group.save();
    await group.populate('creatorId', 'name email');
    await group.populate('members.userId', 'name email');
    await group.populate('topicId', 'name');

    res.json(group);
  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({ message: 'Failed to join group' });
  }
};

// Leave a group
exports.leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.creatorId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Creator cannot leave the group' });
    }

    group.members = group.members.filter(
      member => member.userId.toString() !== req.user._id.toString()
    );

    await group.save();
    res.json({ message: 'Left group successfully' });
  } catch (error) {
    console.error('Leave group error:', error);
    res.status(500).json({ message: 'Failed to leave group' });
  }
};

// Get group leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const tasks = await Task.find({ groupId: req.params.id });

    const leaderboard = {};
    
    group.members.forEach(member => {
      leaderboard[member.userId.toString()] = {
        userId: member.userId,
        points: 0,
        tasksCompleted: 0
      };
    });

    tasks.forEach(task => {
      task.completions.forEach(completion => {
        const userId = completion.userId.toString();
        if (leaderboard[userId]) {
          leaderboard[userId].points += task.points;
          leaderboard[userId].tasksCompleted += 1;
        }
      });
    });

    const leaderboardArray = await Promise.all(
      Object.values(leaderboard).map(async (entry) => {
        const user = await User.findById(entry.userId).select('name email');
        return {
          ...entry,
          user
        };
      })
    );

    leaderboardArray.sort((a, b) => b.points - a.points);

    res.json(leaderboardArray);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Failed to fetch leaderboard' });
  }
};

// Generate invite link for a group (admin only)
exports.generateInviteCode = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const isAdmin = group.members.some(
      m => m.userId.toString() === req.user._id.toString() && m.role === 'admin'
    );
    if (!isAdmin) return res.status(403).json({ message: 'Only admins can generate invite links' });

    // Generate a random 8-char code
    const inviteCode = crypto.randomBytes(4).toString('hex');
    group.inviteCode = inviteCode;
    await group.save();

    res.json({ inviteCode, inviteUrl: `/join/${inviteCode}` });
  } catch (error) {
    console.error('Generate invite error:', error);
    res.status(500).json({ message: 'Failed to generate invite link' });
  }
};

// Join group via invite code
exports.joinByInviteCode = async (req, res) => {
  try {
    const { code } = req.params;
    const group = await Group.findOne({ inviteCode: code })
      .populate('creatorId', 'name email')
      .populate('members.userId', 'name email');

    if (!group) return res.status(404).json({ message: 'Invalid or expired invite link' });

    if (group.members.length >= group.maxMembers) {
      return res.status(400).json({ message: 'Group is full' });
    }

    const isMember = group.members.some(
      m => m.userId._id.toString() === req.user._id.toString() ||
           m.userId.toString() === req.user._id.toString()
    );
    if (isMember) return res.status(400).json({ message: 'Already a member', groupId: group._id });

    group.members.push({ userId: req.user._id, role: 'member' });
    await group.save();
    await group.populate('members.userId', 'name email');

    res.json({ message: 'Joined successfully', groupId: group._id, group });
  } catch (error) {
    console.error('Join by invite error:', error);
    res.status(500).json({ message: 'Failed to join group' });
  }
};

// Get group info by invite code (for preview before joining)
exports.getGroupByInviteCode = async (req, res) => {
  try {
    const { code } = req.params;
    const group = await Group.findOne({ inviteCode: code })
      .populate('creatorId', 'name email')
      .select('name description members maxMembers creatorId inviteCode');

    if (!group) return res.status(404).json({ message: 'Invalid or expired invite link' });

    res.json({
      _id: group._id,
      name: group.name,
      description: group.description,
      memberCount: group.members.length,
      maxMembers: group.maxMembers,
      creatorName: group.creatorId.name
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch group' });
  }
};

// Request to join a group
exports.requestJoin = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const isMember = group.members.some(m => m.userId.toString() === req.user._id.toString());
    if (isMember) return res.status(400).json({ message: 'Already a member' });

    const alreadyRequested = group.joinRequests.some(
      r => r.userId.toString() === req.user._id.toString() && r.status === 'pending'
    );
    if (alreadyRequested) return res.status(400).json({ message: 'Request already sent' });

    group.joinRequests.push({ userId: req.user._id, status: 'pending' });
    await group.save();

    res.json({ message: 'Join request sent successfully' });
  } catch (error) {
    console.error('Request join error:', error);
    res.status(500).json({ message: 'Failed to send join request' });
  }
};

// Get pending join requests (admin only)
exports.getJoinRequests = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('joinRequests.userId', 'name email');

    if (!group) return res.status(404).json({ message: 'Group not found' });

    const isAdmin = group.members.some(
      m => m.userId.toString() === req.user._id.toString() && m.role === 'admin'
    );
    if (!isAdmin) return res.status(403).json({ message: 'Admins only' });

    const pending = group.joinRequests.filter(r => r.status === 'pending');
    res.json(pending);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch requests' });
  }
};

// Accept or reject a join request (admin only)
exports.handleJoinRequest = async (req, res) => {
  try {
    const { requestId, action } = req.body; // action: 'accept' | 'reject'
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const isAdmin = group.members.some(
      m => m.userId.toString() === req.user._id.toString() && m.role === 'admin'
    );
    if (!isAdmin) return res.status(403).json({ message: 'Admins only' });

    const request = group.joinRequests.id(requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (action === 'accept') {
      request.status = 'accepted';
      group.members.push({ userId: request.userId, role: 'member' });
    } else {
      request.status = 'rejected';
    }

    await group.save();
    await group.populate('joinRequests.userId', 'name email');

    const pending = group.joinRequests.filter(r => r.status === 'pending');
    res.json({ message: `Request ${action}ed`, pending });
  } catch (error) {
    console.error('Handle request error:', error);
    res.status(500).json({ message: 'Failed to handle request' });
  }
};
