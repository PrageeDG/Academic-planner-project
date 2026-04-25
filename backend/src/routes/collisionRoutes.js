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

// @route   GET /api/collision/resolutions
// @desc    Get saved collision resolution records
// @access  Private
router.get('/resolutions', collisionController.getCollisionResolutions);

// @route   POST /api/collision/resolutions
// @desc    Create a collision resolution record
// @access  Private
router.post('/resolutions', collisionController.createCollisionResolution);

// @route   PUT /api/collision/resolutions/:id
// @desc    Update a collision resolution record
// @access  Private
router.put('/resolutions/:id', collisionController.updateCollisionResolution);

// @route   DELETE /api/collision/resolutions/:id
// @desc    Delete a collision resolution record
// @access  Private
router.delete('/resolutions/:id', collisionController.deleteCollisionResolution);

module.exports = router;
