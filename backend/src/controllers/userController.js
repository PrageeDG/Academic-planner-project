const User = require('../models/User');
const fs = require('fs/promises');
const path = require('path');

const defaultSettings = {
  dailyWorkloadLimit: 10,
  weeklyWorkloadLimit: 25,
  dueSoonWindow: 3,
  notificationRefreshMinutes: 1,
  showUnreadFirst: true,
  browserAlerts: true,
  reminderHighlights: true,
  dashboardFocus: 'Balanced overview',
};

const getProfileImageUrl = (profileImage, req) => {
  if (!profileImage) {
    return '';
  }

  if (profileImage.startsWith('data:') || profileImage.startsWith('http')) {
    return profileImage;
  }

  if (profileImage.startsWith('/')) {
    return `${req.protocol}://${req.get('host')}${profileImage}`;
  }

  return profileImage;
};

const deleteStoredProfileImage = async (profileImage) => {
  if (!profileImage || profileImage.startsWith('data:') || profileImage.startsWith('http')) {
    return;
  }

  if (!profileImage.startsWith('/uploads/')) {
    return;
  }

  const filePath = path.join(__dirname, '..', '..', profileImage.replace(/^\//, ''));

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
};

const serializeUser = (user, req) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  studentId: user.studentId,
  faculty: user.faculty,
  degree: user.degree,
  year: user.year,
  campus: user.campus,
  profileImage: getProfileImageUrl(user.profileImage, req),
  settings: {
    ...defaultSettings,
    ...(user.settings || {}),
  },
  createdAt: user.createdAt,
});

const normalizeSettingsPayload = (payload = {}) => {
  const normalized = {};

  if (payload.dailyWorkloadLimit !== undefined) {
    const value = parseInt(payload.dailyWorkloadLimit, 10);
    if (Number.isNaN(value) || value < 1 || value > 24) {
      throw new Error('Daily workload limit must be between 1 and 24');
    }
    normalized['settings.dailyWorkloadLimit'] = value;
  }

  if (payload.weeklyWorkloadLimit !== undefined) {
    const value = parseInt(payload.weeklyWorkloadLimit, 10);
    if (Number.isNaN(value) || value < 5 || value > 80) {
      throw new Error('Weekly workload limit must be between 5 and 80');
    }
    normalized['settings.weeklyWorkloadLimit'] = value;
  }

  if (payload.dueSoonWindow !== undefined) {
    const value = parseInt(payload.dueSoonWindow, 10);
    if (Number.isNaN(value) || value < 1 || value > 14) {
      throw new Error('Due soon window must be between 1 and 14');
    }
    normalized['settings.dueSoonWindow'] = value;
  }

  if (payload.notificationRefreshMinutes !== undefined) {
    const value = parseInt(payload.notificationRefreshMinutes, 10);
    if (![1, 5, 10, 15].includes(value)) {
      throw new Error('Notification refresh must be 1, 5, 10, or 15 minutes');
    }
    normalized['settings.notificationRefreshMinutes'] = value;
  }

  ['showUnreadFirst', 'browserAlerts', 'reminderHighlights'].forEach((key) => {
    if (payload[key] !== undefined) {
      normalized[`settings.${key}`] = Boolean(payload[key]);
    }
  });

  if (payload.dashboardFocus !== undefined) {
    const allowed = ['Balanced overview', 'Deadline first', 'Health first', 'Progress first'];
    if (!allowed.includes(payload.dashboardFocus)) {
      throw new Error('Invalid dashboard focus option');
    }
    normalized['settings.dashboardFocus'] = payload.dashboardFocus;
  }

  return normalized;
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user: serializeUser(user, req),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, faculty, degree, year, studentId, campus, removeProfileImage } = req.body;
    const currentUser = await User.findById(req.userId);

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const updates = {
      name,
      faculty,
      degree,
      studentId,
      campus,
    };

    if (year !== undefined && year !== '') {
      const parsedYear = Number(year);
      if (Number.isNaN(parsedYear)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid academic year',
        });
      }
      updates.year = parsedYear;
    }

    const shouldRemoveProfileImage = removeProfileImage === 'true' || removeProfileImage === true;

    if (req.file) {
      await deleteStoredProfileImage(currentUser.profileImage);
      updates.profileImage = `/uploads/profile-images/${req.file.filename}`;
    } else if (shouldRemoveProfileImage) {
      await deleteStoredProfileImage(currentUser.profileImage);
      updates.profileImage = '';
    }

    // Find user and update
    const user = await User.findByIdAndUpdate(
      req.userId,
      updates,
      {
        returnDocument: 'after',
        runValidators: true,
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: serializeUser(user, req),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get user settings
// @route   GET /api/users/settings
// @access  Private
exports.getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      settings: {
        ...defaultSettings,
        ...(user.settings || {}),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update user settings
// @route   PUT /api/users/settings
// @access  Private
exports.updateSettings = async (req, res) => {
  try {
    const normalizedSettings = normalizeSettingsPayload(req.body);

    const user = await User.findByIdAndUpdate(
      req.userId,
      normalizedSettings,
      {
        returnDocument: 'after',
        runValidators: true,
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      settings: {
        ...defaultSettings,
        ...(user.settings || {}),
      },
      user: serializeUser(user),
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    // Check if user is admin
    if (req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this resource',
      });
    }

    const users = await User.find();

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
