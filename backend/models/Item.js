const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['lost', 'found'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Electronics', 'Books', 'Clothing', 'ID/Cards', 'Keys', 'Bags', 'Jewellery', 'Sports', 'Stationery', 'Other']
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  imageUrl: {
    type: String,
    default: '',
    // Stores compressed base64 or URL
  },
  contactInfo: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['open', 'resolved'],
    default: 'open'
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  aiTags: [{
    type: String
  }],
  matches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item'
  }]
}, { timestamps: true });

itemSchema.index({ title: 'text', description: 'text', location: 'text' });
itemSchema.index({ type: 1, status: 1, createdAt: -1 });
itemSchema.index({ category: 1 });

module.exports = mongoose.model('Item', itemSchema);
