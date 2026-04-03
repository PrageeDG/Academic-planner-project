const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const burnoutController = require('../controllers/burnoutController');

// All routes are protected with authentication
router.use(authMiddleware);

// @route   GET /api/burnout/analyze
// @desc    Analyze user tasks and calculate burnout risk
// @access  Private
router.get('/analyze', burnoutController.analyzeBurnout);

// @route   GET /api/burnout/history
// @desc    Get previous burnout analysis records
// @access  Private
router.get('/history', burnoutController.getAnalysisHistory);

// @route   GET /api/burnout/latest
// @desc    Get the latest burnout analysis
// @access  Private
router.get('/latest', burnoutController.getLatestAnalysis);

module.exports = router;
