const Story = require('../models/Story');

// Get all stories (with filters)
exports.getStories = async (req, res) => {
  try {
    const { type, tag, company, search } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (tag) filter.tag = tag;
    if (company) filter.company = new RegExp(company, 'i');
    if (search) {
      filter.$or = [
        { company: new RegExp(search, 'i') },
        { role: new RegExp(search, 'i') },
        { story: new RegExp(search, 'i') }
      ];
    }

    const stories = await Story.find(filter)
      .populate('author', 'name email')
      .populate('comments.userId', 'name')
      .sort({ createdAt: -1 });

    res.json(stories);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stories' });
  }
};

// Get single story
exports.getStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id)
      .populate('author', 'name email')
      .populate('comments.userId', 'name');
    if (!story) return res.status(404).json({ message: 'Story not found' });
    res.json(story);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch story' });
  }
};

// Create story
exports.createStory = async (req, res) => {
  try {
    const { company, role, type, package: pkg, tag, prepTime, resources, rounds, tips, story } = req.body;
    const newStory = await Story.create({
      author: req.user._id,
      company, role, type,
      package: pkg || '',
      tag: tag || 'on-campus',
      prepTime: prepTime || '',
      resources: resources || '',
      rounds: rounds || '',
      tips: tips || '',
      story
    });
    await newStory.populate('author', 'name email');
    res.status(201).json(newStory);
  } catch (error) {
    console.error('Create story error:', error);
    res.status(500).json({ message: 'Failed to create story' });
  }
};

// Delete story
exports.deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });
    if (story.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    await Story.findByIdAndDelete(req.params.id);
    res.json({ message: 'Story deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete story' });
  }
};

// Toggle upvote
exports.toggleUpvote = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    const idx = story.upvotes.indexOf(req.user._id);
    if (idx === -1) story.upvotes.push(req.user._id);
    else story.upvotes.splice(idx, 1);

    await story.save();
    res.json({ upvotes: story.upvotes.length, upvoted: idx === -1 });
  } catch (error) {
    res.status(500).json({ message: 'Failed to upvote' });
  }
};

// Add comment
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    story.comments.push({ userId: req.user._id, text });
    await story.save();
    await story.populate('comments.userId', 'name');
    res.json(story.comments[story.comments.length - 1]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add comment' });
  }
};

// Delete comment
exports.deleteComment = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    const comment = story.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.userId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    comment.deleteOne();
    await story.save();
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete comment' });
  }
};
