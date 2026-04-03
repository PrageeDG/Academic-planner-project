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
  moduleCode: {
    type: String,
    trim: true,
    default: ''
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
  progress: {
    type: Number,
    min: [0, 'Progress cannot be less than 0'],
    max: [100, 'Progress cannot exceed 100'],
    default: 0
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Overdue'],
    default: 'Pending'
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  resourceLink: {
    type: String,
    trim: true,
    default: ''
  },
  reminderSet: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

taskSchema.pre('save', async function() {
  if (this.progress >= 100) {
    this.progress = 100;
    this.status = 'Completed';
  } else if (this.status === 'Completed' && this.progress < 100) {
    this.progress = 100;
  }

  if (this.status !== 'Completed' && new Date() > this.deadline) {
    this.status = 'Overdue';
  }
});

// Prevent model overwrite error
module.exports = mongoose.models.Task || mongoose.model('Task', taskSchema);
