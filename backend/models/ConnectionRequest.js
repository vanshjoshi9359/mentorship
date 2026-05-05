const mongoose = require('mongoose');

const connectionRequestSchema = new mongoose.Schema({
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true, trim: true, maxlength: 500 },
  status: { type: String, enum: ['pending', 'seen'], default: 'pending' }
}, { timestamps: true });

// One request per pair (prevent duplicates)
connectionRequestSchema.index({ fromUser: 1, toUser: 1 }, { unique: true });

module.exports = mongoose.model('ConnectionRequest', connectionRequestSchema);
