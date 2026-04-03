const mongoose = require('mongoose');

const collisionResolutionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    issueKey: {
      type: String,
      required: [true, 'Issue key is required'],
      trim: true,
    },
    issueLabel: {
      type: String,
      required: [true, 'Issue label is required'],
      trim: true,
    },
    issueType: {
      type: String,
      enum: ['Same-Day Conflict', 'Daily Overload', 'Schedule Warning'],
      required: [true, 'Issue type is required'],
    },
    issueDate: {
      type: Date,
      required: [true, 'Issue date is required'],
    },
    status: {
      type: String,
      enum: ['Reviewed', 'Resolved', 'Ignored', 'Needs Follow-Up'],
      required: [true, 'Resolution status is required'],
    },
    action: {
      type: String,
      enum: ['Reschedule', 'Reduce workload', 'Split into smaller tasks', 'Keep as planned', 'Ask for extension'],
      required: [true, 'Resolution action is required'],
    },
    suggestedDate: {
      type: Date,
      default: null,
    },
    note: {
      type: String,
      required: [true, 'Resolution note is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.CollisionResolution ||
  mongoose.model('CollisionResolution', collisionResolutionSchema);
