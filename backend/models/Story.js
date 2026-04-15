const mongoose = require('mongoose');

const yearSchema = new mongoose.Schema({
  year: { type: Number, enum: [1, 2, 3, 4], required: true },
  content: { type: String, required: true, trim: true }
});

const storySchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: String, required: true, trim: true },
  role: { type: String, required: true, trim: true },
  package: { type: String, trim: true },
  batch: { type: String, required: true },
  branch: { type: String, trim: true },
  years: [yearSchema],
  tips: { type: String, trim: true },
  aiSummary: { type: String, default: '' },
  upvotes: { type: Number, default: 0 },
  upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  tags: [String]
}, { timestamps: true });

storySchema.index({ company: 1 });
storySchema.index({ batch: 1 });
storySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Story', storySchema);
