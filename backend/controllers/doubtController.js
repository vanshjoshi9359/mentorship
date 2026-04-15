const Doubt = require('../models/Doubt');

exports.createDoubt = async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const doubt = await Doubt.create({ authorId: req.user._id, title, content, category });
    await doubt.populate('authorId', 'name email');
    res.status(201).json(doubt);
  } catch (error) {
    res.status(500).json({ message: 'Failed to post doubt' });
  }
};

exports.getDoubts = async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const query = {};
    if (category && category !== 'All') query.category = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [doubts, total] = await Promise.all([
      Doubt.find(query).populate('authorId', 'name email').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Doubt.countDocuments(query)
    ]);

    res.json({ doubts, total, pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch doubts' });
  }
};

exports.getDoubt = async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id)
      .populate('authorId', 'name email')
      .populate('replies.authorId', 'name email');
    if (!doubt) return res.status(404).json({ message: 'Doubt not found' });
    res.json(doubt);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch doubt' });
  }
};

exports.addReply = async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) return res.status(404).json({ message: 'Doubt not found' });

    doubt.replies.push({ authorId: req.user._id, content: req.body.content });
    await doubt.save();
    await doubt.populate('authorId', 'name email');
    await doubt.populate('replies.authorId', 'name email');
    res.json(doubt);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add reply' });
  }
};

exports.upvoteDoubt = async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) return res.status(404).json({ message: 'Doubt not found' });

    const userId = req.user._id.toString();
    const alreadyUpvoted = doubt.upvotedBy.map(id => id.toString()).includes(userId);

    if (alreadyUpvoted) {
      doubt.upvotes -= 1;
      doubt.upvotedBy = doubt.upvotedBy.filter(id => id.toString() !== userId);
    } else {
      doubt.upvotes += 1;
      doubt.upvotedBy.push(req.user._id);
    }

    await doubt.save();
    res.json({ upvotes: doubt.upvotes, upvoted: !alreadyUpvoted });
  } catch (error) {
    res.status(500).json({ message: 'Failed to upvote' });
  }
};

exports.resolveDoubt = async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) return res.status(404).json({ message: 'Doubt not found' });
    if (doubt.authorId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    doubt.resolved = !doubt.resolved;
    await doubt.save();
    res.json({ resolved: doubt.resolved });
  } catch (error) {
    res.status(500).json({ message: 'Failed to resolve doubt' });
  }
};
