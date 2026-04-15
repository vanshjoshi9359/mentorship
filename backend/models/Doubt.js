const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, trim: true },
  upvotes: { type: Number, default: 0 },
  upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const doubtSchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: ['Resume', 'DSA', 'Projects', 'Internship', 'Placement Process', 'Skills', 'General'],
    default: 'General'
  },
  replies: [replySchema],
  resolved: { type: Boolean, default: false },
  upvotes: { type: Number, default: 0 },
  upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

doubtSchema.index({ category: 1, createdAt: -1 });

module.exports = mongoose.model('Doubt', doubtSchema);
