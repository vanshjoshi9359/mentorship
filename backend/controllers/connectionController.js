const ConnectionRequest = require('../models/ConnectionRequest');
const UserProfile = require('../models/UserProfile');
const User = require('../models/User');

// Send a connection request
exports.sendRequest = async (req, res) => {
  try {
    const { toUserId, message } = req.body;

    if (!toUserId || !message?.trim()) {
      return res.status(400).json({ message: 'Recipient and message are required' });
    }

    if (toUserId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot connect with yourself' });
    }

    const toUser = await User.findById(toUserId);
    if (!toUser) return res.status(404).json({ message: 'User not found' });

    // Check if already sent
    const existing = await ConnectionRequest.findOne({
      fromUser: req.user._id,
      toUser: toUserId
    });
    if (existing) {
      return res.status(409).json({ message: 'You already sent a request to this person' });
    }

    const request = await ConnectionRequest.create({
      fromUser: req.user._id,
      toUser: toUserId,
      message: message.trim()
    });

    await request.populate('fromUser', 'name email');
    res.status(201).json(request);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'You already sent a request to this person' });
    }
    console.error('Send request error:', error);
    res.status(500).json({ message: 'Failed to send request' });
  }
};

// Get all requests received by the logged-in user
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await ConnectionRequest.find({ toUser: req.user._id })
      .populate('fromUser', 'name email')
      .populate({
        path: 'fromUser',
        select: 'name email',
        populate: { path: '_id' }
      })
      .sort({ createdAt: -1 });

    // Attach sender's profile info
    const enriched = await Promise.all(requests.map(async (r) => {
      const profile = await UserProfile.findOne({ userId: r.fromUser._id });
      return {
        _id: r._id,
        fromUser: r.fromUser,
        message: r.message,
        status: r.status,
        createdAt: r.createdAt,
        senderProfile: profile ? {
          goal: profile.goal,
          skill: profile.skill,
          batch: profile.batch,
          branch: profile.branch,
          linkedIn: profile.linkedIn
        } : null
      };
    }));

    // Mark all as seen
    await ConnectionRequest.updateMany(
      { toUser: req.user._id, status: 'pending' },
      { status: 'seen' }
    );

    res.json(enriched);
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ message: 'Failed to fetch requests' });
  }
};

// Get count of unseen requests
exports.getUnseenCount = async (req, res) => {
  try {
    const count = await ConnectionRequest.countDocuments({
      toUser: req.user._id,
      status: 'pending'
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ count: 0 });
  }
};

// Check if current user already sent a request to a specific user
exports.checkSent = async (req, res) => {
  try {
    const { toUserId } = req.params;
    const existing = await ConnectionRequest.findOne({
      fromUser: req.user._id,
      toUser: toUserId
    });
    res.json({ sent: !!existing });
  } catch (error) {
    res.status(500).json({ sent: false });
  }
};
