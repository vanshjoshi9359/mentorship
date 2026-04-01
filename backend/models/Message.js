const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Template fields
  whatTried: {
    type: String,
    required: true,
    trim: true
  },
  problem: {
    type: String,
    required: true,
    trim: true
  },
  // Resolution by admin/senior
  isResolved: {
    type: Boolean,
    default: false
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  resolution: {
    type: String,
    default: ''
  },
  resolvedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

messageSchema.index({ groupId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
