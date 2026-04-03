const express = require('express');
const { register, login, getProfile, changePassword } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', authMiddleware, getProfile);
router.post('/change-password', authMiddleware, changePassword);

module.exports = router;
