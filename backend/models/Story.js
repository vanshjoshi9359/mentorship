const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: { type: String, required: true, trim: true },
  role: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: ['placement', 'internship'],
    required: true
  },
  package: { type: String, default: '' }, // e.g. "12 LPA" or "₹30k/month"
  tag: {
    type: String,
    enum: ['on-campus', 'off-campus', 'referral', 'other'],
    default: 'on-campus'
  },
  prepTime: { type: String, default: '' }, // e.g. "3 months"
  resources: { type: String, default: '' }, // books, courses used
  rounds: { type: String, default: '' },   // description of interview rounds
  tips: { type: String, default: '' },     // advice for juniors
  story: { type: String, required: true }, // main story text
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

storySchema.index({ company: 1 });
storySchema.index({ type: 1 });
storySchema.index({ tag: 1 });

module.exports = mongoose.model('Story', storySchema);
