const express = require('express');
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .post(authMiddleware, createTask)
  .get(authMiddleware, getTasks);

router.route('/:id')
  .get(authMiddleware, getTask)
  .put(authMiddleware, updateTask)
  .delete(authMiddleware, deleteTask);

module.exports = router;
