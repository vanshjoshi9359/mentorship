const DayLog = require('../models/DayLog');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyseWithGemini = async (rawEntry, date) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are a personal time coach. Analyse this person's day journal entry and return a JSON response.

Date: ${date}
Journal Entry: "${rawEntry}"

Return ONLY valid JSON (no markdown, no code blocks) in this exact format:
{
  "activities": [
    { "name": "activity name", "duration": minutes_as_number, "category": "productive|leisure|health|social|waste|other" }
  ],
  "totalHours": number,
  "productiveHours": number,
  "wastedHours": number,
  "score": number_0_to_100,
  "mood": "great|good|okay|bad|terrible",
  "insights": "2-3 sentence analysis of how they spent their day",
  "highlights": ["positive thing 1", "positive thing 2"],
  "suggestions": ["actionable suggestion 1", "actionable suggestion 2", "actionable suggestion 3"],
  "aiAnalysis": "detailed paragraph about their time usage patterns and what they can improve"
}

Rules:
- Estimate durations from context clues (if not given)
- Score based on productivity, health, balance (100 = perfect day)
- Be encouraging but honest
- Keep suggestions specific and actionable`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    console.log('Gemini raw response:', text.substring(0, 200));

    // Strip markdown code blocks if present
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch (err) {
    console.error('Gemini error details:', err.message);
    throw err;
  }
};

// Create or update today's log
exports.createLog = async (req, res) => {
  try {
    const { rawEntry, date } = req.body;

    // Call Gemini
    let analysis;
    try {
      analysis = await analyseWithGemini(rawEntry, date);
    } catch (aiError) {
      console.error('Gemini error:', aiError.message);
      return res.status(500).json({ message: `AI analysis failed: ${aiError.message}` });
    }

    // Upsert (update if same date exists)
    const log = await DayLog.findOneAndUpdate(
      { userId: req.user._id, date },
      {
        userId: req.user._id,
        date,
        rawEntry,
        activities: analysis.activities || [],
        totalHours: analysis.totalHours || 0,
        productiveHours: analysis.productiveHours || 0,
        wastedHours: analysis.wastedHours || 0,
        score: analysis.score || 50,
        mood: analysis.mood || 'okay',
        insights: analysis.insights || '',
        suggestions: analysis.suggestions || [],
        highlights: analysis.highlights || [],
        aiAnalysis: analysis.aiAnalysis || ''
      },
      { upsert: true, new: true }
    );

    res.status(201).json(log);
  } catch (error) {
    console.error('Create log error:', error);
    res.status(500).json({ message: 'Failed to save log' });
  }
};

// Get all logs for user
exports.getLogs = async (req, res) => {
  try {
    const logs = await DayLog.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(30);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch logs' });
  }
};

// Get single log
exports.getLog = async (req, res) => {
  try {
    const log = await DayLog.findOne({ userId: req.user._id, date: req.params.date });
    if (!log) return res.status(404).json({ message: 'No log for this date' });
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch log' });
  }
};

// Get weekly summary
exports.getWeeklySummary = async (req, res) => {
  try {
    const logs = await DayLog.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(7);

    if (logs.length === 0) return res.json({ message: 'No data yet' });

    const avgScore = Math.round(logs.reduce((s, l) => s + l.score, 0) / logs.length);
    const avgProductiveHours = (logs.reduce((s, l) => s + l.productiveHours, 0) / logs.length).toFixed(1);
    const avgWastedHours = (logs.reduce((s, l) => s + l.wastedHours, 0) / logs.length).toFixed(1);

    // Category totals
    const categoryTotals = {};
    logs.forEach(log => {
      log.activities.forEach(act => {
        categoryTotals[act.category] = (categoryTotals[act.category] || 0) + act.duration;
      });
    });

    res.json({ avgScore, avgProductiveHours, avgWastedHours, categoryTotals, days: logs.length });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch summary' });
  }
};
