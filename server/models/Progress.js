const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  signId: {
    type: String,
    required: true
  },
  matchScore: {
    type: Number,
    default: 0
  },
  attempts: {
    type: Number,
    default: 0
  },
  completed: {
    type: Boolean,
    default: false
  },
  lastPracticed: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Progress', ProgressSchema);
