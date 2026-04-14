const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  name: String,
  duration: Number, // in minutes
  category: {
    type: String,
    enum: ['productive', 'leisure', 'health', 'social', 'waste', 'other'],
    default: 'other'
  }
});

const dayLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true
  },
  rawEntry: {
    type: String,
    required: true
  },
  activities: [activitySchema],
  totalHours: Number,
  productiveHours: Number,
  wastedHours: Number,
  score: { type: Number, min: 0, max: 100 },
  mood: { type: String, enum: ['great', 'good', 'okay', 'bad', 'terrible'] },
  insights: String,
  suggestions: [String],
  highlights: [String],
  aiAnalysis: String
}, { timestamps: true });

dayLogSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('DayLog', dayLogSchema);
