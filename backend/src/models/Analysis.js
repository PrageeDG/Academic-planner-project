const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  weeklyLoad: {
    type: Number,
    default: 0
  },
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  riskLevel: {
    type: String,
    enum: ['Low', 'Moderate', 'High'],
    required: true
  },
  collisionCount: {
    type: Number,
    default: 0
  },
  heavyDaysCount: {
    type: Number,
    default: 0
  },
  averageDailyLoad: {
    type: Number,
    default: 0
  },
  peakWorkloadDay: {
    type: String,
    default: null
  },
  consecutiveHeavyDays: {
    type: Number,
    default: 0
  },
  taskDensity: {
    type: Number,
    default: 0
  },
  suggestions: [{
    type: String
  }],
  generatedAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent model overwrite
module.exports = mongoose.models.Analysis || mongoose.model('Analysis', analysisSchema);
