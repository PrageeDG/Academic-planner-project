const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const collisionController = require('../controllers/collisionController');

// All routes are protected with authentication
router.use(authMiddleware);

// @route   GET /api/collision/analyze
// @desc    Analyze all user tasks for deadline collisions and workload overload
// @access  Private
router.get('/analyze', collisionController.analyzeCollisions);

// @route   POST /api/collision/check
// @desc    Check if a new task will cause collision
// @access  Private
router.post('/check', collisionController.checkTaskCollision);

module.exports = router;
