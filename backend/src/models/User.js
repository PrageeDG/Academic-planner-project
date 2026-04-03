const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const settingsSchema = new mongoose.Schema(
  {
    dailyWorkloadLimit: {
      type: Number,
      default: 10,
      min: 1,
      max: 24,
    },
    weeklyWorkloadLimit: {
      type: Number,
      default: 25,
      min: 5,
      max: 80,
    },
    dueSoonWindow: {
      type: Number,
      default: 3,
      min: 1,
      max: 14,
    },
    notificationRefreshMinutes: {
      type: Number,
      default: 1,
      enum: [1, 5, 10, 15],
    },
    showUnreadFirst: {
      type: Boolean,
      default: true,
    },
    browserAlerts: {
      type: Boolean,
      default: true,
    },
    reminderHighlights: {
      type: Boolean,
      default: true,
    },
    dashboardFocus: {
      type: String,
      default: 'Balanced overview',
      enum: ['Balanced overview', 'Deadline first', 'Health first', 'Progress first'],
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['student', 'lecturer', 'admin'],
      default: 'student',
    },
    studentId: {
      type: String,
      unique: true,
      sparse: true,
    },
    faculty: {
      type: String,
      required: [true, 'Please specify your faculty'],
    },
    degree: {
      type: String,
      required: [true, 'Please specify your degree program'],
    },
    year: {
      type: Number,
      enum: [1, 2, 3, 4],
      required: [true, 'Please specify your academic year'],
    },
    campus: {
      type: String,
      default: 'SLIIT Malabe',
    },
    settings: {
      type: settingsSchema,
      default: () => ({}),
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash if password is modified
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to match password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
