const Story = require('../models/Story');
const Groq = require('groq-sdk');

const getGroq = () => new Groq({ apiKey: process.env.GROQ_API_KEY });

const getCompanyLogo = async (companyName) => {
  if (!process.env.GROQ_API_KEY) return '';
  try {
    const groq = getGroq();
    const response = await groq.chat.completions.create({
      messages: [{ role: 'user', content: `What is the official website domain of "${companyName}"? Reply with ONLY the domain like "google.com". No explanation.` }],
      model: 'llama-3.3-70b-versatile',
      max_tokens: 20
    });
    const domain = response.choices[0].message.content.trim().toLowerCase()
      .replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '').trim();
    return `https://logo.clearbit.com/${domain}`;
  } catch (e) {
    console.error('Logo error:', e.message);
    return '';
  }
};

exports.createStory = async (req, res) => {
  try {
    const { company, role, package: pkg, batch, branch, linkedIn, years, tips, tags } = req.body;

    const story = await Story.create({
      authorId: req.user._id,
      company, role, package: pkg, batch, branch,
      linkedIn: linkedIn || '',
      years: years || [], tips: tips || '', tags: tags || []
    });

    // Fetch logo in background
    try {
      const logoUrl = await getCompanyLogo(company);
      story.logoUrl = logoUrl;
      await story.save();
    } catch (e) { console.error('Logo fetch failed:', e.message); }

    await story.populate('authorId', 'name email');
    res.status(201).json(story);
  } catch (error) {
    console.error('Create story error:', error);
    res.status(500).json({ message: 'Failed to create story' });
  }
};

exports.getStories = async (req, res) => {
  try {
    const { company, batch, page = 1, limit = 10 } = req.query;
    const query = {};
    if (company) query.company = new RegExp(company, 'i');
    if (batch) query.batch = batch;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [stories, total] = await Promise.all([
      Story.find(query).populate('authorId', 'name email').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Story.countDocuments(query)
    ]);
    res.json({ stories, total, pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stories' });
  }
};

exports.getStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id)
      .populate('authorId', 'name email')
      .populate('comments.authorId', 'name email')
      .populate('comments.replies.authorId', 'name email');
    if (!story) return res.status(404).json({ message: 'Story not found' });
    res.json(story);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch story' });
  }
};

exports.upvoteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });
    const userId = req.user._id.toString();
    const alreadyUpvoted = story.upvotedBy.map(id => id.toString()).includes(userId);
    if (alreadyUpvoted) {
      story.upvotes -= 1;
      story.upvotedBy = story.upvotedBy.filter(id => id.toString() !== userId);
    } else {
      story.upvotes += 1;
      story.upvotedBy.push(req.user._id);
    }
    await story.save();
    res.json({ upvotes: story.upvotes, upvoted: !alreadyUpvoted });
  } catch (error) {
    res.status(500).json({ message: 'Failed to upvote' });
  }
};

// Add comment (anyone logged in)
exports.addComment = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });
    story.comments.push({ authorId: req.user._id, content: req.body.content });
    await story.save();
    await story.populate('authorId', 'name email');
    await story.populate('comments.authorId', 'name email');
    res.json(story);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add comment' });
  }
};

// Reply to comment (only story poster)
exports.replyComment = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    if (story.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the story author can reply to comments' });
    }

    const comment = story.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    comment.replies.push({ authorId: req.user._id, content: req.body.content });
    await story.save();
    await story.populate('authorId', 'name email');
    await story.populate('comments.authorId', 'name email');
    await story.populate('comments.replies.authorId', 'name email');
    res.json(story);
  } catch (error) {
    res.status(500).json({ message: 'Failed to reply' });
  }
};

exports.deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });
    if (story.authorId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
    await Story.findByIdAndDelete(req.params.id);
    res.json({ message: 'Story deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete story' });
  }
};
