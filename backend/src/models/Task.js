const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true
  },
  module: {
    type: String,
    required: [true, 'Module name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['Assignment', 'Exam', 'Quiz', 'Presentation'],
    required: [true, 'Task type is required']
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  deadline: {
    type: Date,
    required: [true, 'Deadline is required']
  },
  workloadHours: {
    type: Number,
    required: [true, 'Workload hours is required'],
    min: [1, 'Workload must be at least 1 hour'],
    max: [48, 'Workload cannot exceed 48 hours']
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Overdue'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Update status based on deadline - using async function
taskSchema.pre('save', async function() {
  if (this.status !== 'Completed' && new Date() > this.deadline) {
    this.status = 'Overdue';
  }
});

// Prevent model overwrite error
module.exports = mongoose.models.Task || mongoose.model('Task', taskSchema);
