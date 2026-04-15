const Story = require('../models/Story');
const Groq = require('groq-sdk');

exports.getRecommendations = async (req, res) => {
  try {
    const { goal, skill, problem } = req.body;

    if (!goal || !skill || !problem) {
      return res.status(400).json({ message: 'All three fields are required' });
    }

    // Get all stories that have LinkedIn links
    const stories = await Story.find({ linkedIn: { $exists: true, $ne: '' } })
      .populate('authorId', 'name email')
      .select('company role batch branch tips years linkedIn authorId')
      .limit(50);

    if (stories.length === 0) {
      return res.json({ recommendations: [], message: 'No profiles available yet. Check back later!' });
    }

    // Build profile summaries for Groq
    const profiles = stories.map((s, i) => {
      const yearSummary = s.years.map(y => y.content).join(' ').substring(0, 200);
      return `Profile ${i + 1}:
Name: ${s.authorId?.name}
Company: ${s.company}
Role: ${s.role}
Batch: ${s.batch}
Branch: ${s.branch || 'N/A'}
Experience: ${yearSummary}
Tips: ${(s.tips || '').substring(0, 150)}
LinkedIn: ${s.linkedIn}`;
    }).join('\n\n---\n\n');

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const prompt = `You are a career mentor. A student needs LinkedIn profile recommendations.

Student's Profile:
- Goal: ${goal}
- Currently Learning: ${skill}
- Problem Facing: ${problem}

Available Profiles:
${profiles}

Recommend the TOP 3 most relevant profiles for this student. For each recommendation explain WHY they are relevant in 1-2 sentences.

Return ONLY valid JSON array (no markdown):
[
  {
    "name": "person name",
    "company": "company name",
    "role": "their role",
    "linkedIn": "their linkedin url",
    "reason": "why this person is relevant to the student",
    "matchScore": 85
  }
]

Base recommendations on: similar goals, complementary skills, ability to help with the problem, career path alignment.`;

    const response = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      max_tokens: 800,
      temperature: 0.7
    });

    const text = response.choices[0].message.content.trim()
      .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const recommendations = JSON.parse(text);

    res.json({ recommendations });
  } catch (error) {
    console.error('Recommend error:', error.message);
    res.status(500).json({ message: 'Failed to get recommendations. Please try again.' });
  }
};
