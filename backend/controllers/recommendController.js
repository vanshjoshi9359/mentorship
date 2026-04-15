const UserProfile = require('../models/UserProfile');
const Groq = require('groq-sdk');

// Save/update user's own profile
exports.saveProfile = async (req, res) => {
  try {
    const { linkedIn, goal, skill, problem, batch, branch } = req.body;

    const profile = await UserProfile.findOneAndUpdate(
      { userId: req.user._id },
      { userId: req.user._id, linkedIn, goal, skill, problem, batch, branch },
      { upsert: true, new: true }
    );

    res.json(profile);
  } catch (error) {
    console.error('Save profile error:', error);
    res.status(500).json({ message: 'Failed to save profile' });
  }
};

// Get current user's profile
exports.getMyProfile = async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ userId: req.user._id });
    res.json(profile || {});
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

// Get AI recommendations
exports.getRecommendations = async (req, res) => {
  try {
    const { goal, skill, problem } = req.body;

    if (!goal || !skill || !problem) {
      return res.status(400).json({ message: 'All three fields are required' });
    }

    // Get all user profiles that have LinkedIn + at least one filled field
    const profiles = await UserProfile.find({
      linkedIn: { $exists: true, $ne: '' },
      userId: { $ne: req.user._id }, // exclude self
      $or: [
        { goal: { $ne: '' } },
        { skill: { $ne: '' } },
        { problem: { $ne: '' } }
      ]
    }).populate('userId', 'name email').limit(60);

    if (profiles.length === 0) {
      return res.json({
        recommendations: [],
        message: 'No profiles available yet. Ask your friends to register and fill their profiles!'
      });
    }

    // Build profile summaries for Groq
    const profileList = profiles.map((p, i) => {
      return `Profile ${i + 1}:
Name: ${p.userId?.name}
Batch: ${p.batch || 'N/A'}
Branch: ${p.branch || 'N/A'}
Goal: ${p.goal || 'Not specified'}
Learning: ${p.skill || 'Not specified'}
Problem: ${p.problem || 'Not specified'}
LinkedIn: ${p.linkedIn}`;
    }).join('\n\n---\n\n');

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const prompt = `You are a smart career mentor. Match a student with the most relevant people from a community.

STUDENT LOOKING FOR CONNECTIONS:
- Goal: ${goal}
- Currently Learning: ${skill}
- Problem Facing: ${problem}

AVAILABLE COMMUNITY PROFILES:
${profileList}

TASK: Recommend the TOP 3 most relevant profiles. Consider:
1. Complementary goals (someone who achieved what this student wants)
2. Shared skills (someone learning the same thing = study buddy)
3. Someone who solved the same problem this student faces
4. Batch/branch similarity for peer support

Return ONLY valid JSON array (no markdown, no explanation):
[
  {
    "name": "exact name from profile",
    "batch": "their batch",
    "branch": "their branch",
    "linkedIn": "their exact linkedin url",
    "reason": "specific 1-2 sentence reason why this person is the right match",
    "matchType": "Mentor|Study Buddy|Peer Support|Problem Solver",
    "matchScore": 85
  }
]`;

    const response = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      max_tokens: 900,
      temperature: 0.6
    });

    const text = response.choices[0].message.content.trim()
      .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const recommendations = JSON.parse(text);
    res.json({ recommendations });
  } catch (error) {
    console.error('Recommend error:', error.message);
    res.status(500).json({ message: 'AI recommendation failed. Please try again.' });
  }
};
