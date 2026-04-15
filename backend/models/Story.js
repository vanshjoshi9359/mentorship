const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, trim: true },
  replies: [{
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

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
  linkedIn: { type: String, trim: true },
  years: [yearSchema],
  tips: { type: String, trim: true },
  logoUrl: { type: String, default: '' },
  upvotes: { type: Number, default: 0 },
  upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [commentSchema],
  tags: [String]
}, { timestamps: true });

module.exports = mongoose.model('Story', storySchema);
