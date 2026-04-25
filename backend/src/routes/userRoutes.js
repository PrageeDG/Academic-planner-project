const express = require('express');
const { getProfile, updateProfile, getSettings, updateSettings, getAllUsers } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// All user routes require authentication
router.use(authMiddleware);

// Protected routes
router.get('/profile', getProfile);
router.put('/profile', upload.single('profileImage'), updateProfile);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.get('/', getAllUsers); // Admin only - getAllUsers middleware check inside controller

module.exports = router;
