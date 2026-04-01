const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  skills: {
    type: [String],
    default: []
  },
  price: {
    type: Number,
    default: 0
  },
  duration: {
    type: String,
    default: ''
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    }
  }],
  joinRequests: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    }
  }],
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  maxMembers: {
    type: Number,
    default: 50
  },
  inviteCode: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

groupSchema.index({ name: 'text', description: 'text' });
groupSchema.index({ creatorId: 1 });
groupSchema.index({ 'members.userId': 1 });

module.exports = mongoose.model('Group', groupSchema);
