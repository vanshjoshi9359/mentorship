const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  linkedIn: { type: String, trim: true, default: '' },
  goal: { type: String, trim: true, default: '' },
  skill: { type: String, trim: true, default: '' },
  problem: { type: String, trim: true, default: '' },
  batch: { type: String, trim: true, default: '' },
  branch: { type: String, trim: true, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('UserProfile', userProfileSchema);
