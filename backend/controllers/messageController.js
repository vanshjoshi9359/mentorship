const Message = require('../models/Message');
const Group = require('../models/Group');

// Get messages for a group
exports.getGroupMessages = async (req, res) => {
  try {
    const messages = await Message.find({ groupId: req.params.groupId })
      .populate('userId', 'name email')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Failed to fetch discussions' });
  }
};

// Create a discussion (template-based)
exports.createMessage = async (req, res) => {
  try {
    const { groupId, whatTried, problem } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const message = await Message.create({
      groupId,
      userId: req.user._id,
      whatTried,
      problem
    });

    await message.populate('userId', 'name email');
    res.status(201).json(message);
  } catch (error) {
    console.error('Create discussion error:', error);
    res.status(500).json({ message: 'Failed to create discussion' });
  }
};

// Resolve a discussion (admin only)
exports.resolveMessage = async (req, res) => {
  try {
    const { resolution } = req.body;
    const message = await Message.findById(req.params.id).populate('userId', 'name email');

    if (!message) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // Check if user is admin of the group
    const group = await Group.findById(message.groupId);
    const userId = req.user._id.toString();
    const isAdmin = group.members.some(
      m => m.userId.toString() === userId && m.role === 'admin'
    );

    if (!isAdmin) {
      return res.status(403).json({ message: 'Only group admins can resolve discussions' });
    }

    message.isResolved = true;
    message.resolvedBy = req.user._id;
    message.resolution = resolution;
    message.resolvedAt = new Date();
    await message.save();

    await message.populate('resolvedBy', 'name email');
    res.json(message);
  } catch (error) {
    console.error('Resolve discussion error:', error);
    res.status(500).json({ message: 'Failed to resolve discussion' });
  }
};

// Delete a discussion (own only)
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    if (message.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this discussion' });
    }

    await Message.findByIdAndDelete(req.params.id);
    res.json({ message: 'Discussion deleted successfully' });
  } catch (error) {
    console.error('Delete discussion error:', error);
    res.status(500).json({ message: 'Failed to delete discussion' });
  }
};
