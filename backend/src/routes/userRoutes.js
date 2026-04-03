const express = require('express');
const { getProfile, updateProfile, getAllUsers } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All user routes require authentication
router.use(authMiddleware);

// Protected routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/', getAllUsers); // Admin only - getAllUsers middleware check inside controller

module.exports = router;
