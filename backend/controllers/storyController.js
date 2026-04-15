const Story = require('../models/Story');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const generateSummary = async (story) => {
  try {
    const yearContent = story.years.map(y => `Year ${y.year}: ${y.content}`).join('\n\n');
    const prompt = `Summarise this placement journey in 3-4 bullet points. Be concise and highlight the most important advice and milestones.

Company: ${story.company}
Role: ${story.role}
${yearContent}
Tips: ${story.tips || 'None'}

Return only bullet points starting with •`;

    const response = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      max_tokens: 300
    });
    return response.choices[0].message.content.trim();
  } catch (e) {
    console.error('Summary error:', e.message);
    return '';
  }
};

exports.createStory = async (req, res) => {
  try {
    const { company, role, package: pkg, batch, branch, years, tips, tags } = req.body;

    const story = await Story.create({
      authorId: req.user._id,
      company, role, package: pkg, batch, branch,
      years: years || [],
      tips: tips || '',
      tags: tags || []
    });

    // Generate AI summary async
    const summary = await generateSummary(story);
    story.aiSummary = summary;
    await story.save();

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
    const story = await Story.findById(req.params.id).populate('authorId', 'name email');
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
