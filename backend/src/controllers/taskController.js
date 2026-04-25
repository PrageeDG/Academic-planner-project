const Task = require('../models/Task');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    const { title, module, type, priority, deadline, workloadHours } = req.body;

    // Validate required fields
    if (!title || !module || !type || !deadline || !workloadHours) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Parse and validate workload hours
    const hours = parseInt(workloadHours);
    if (isNaN(hours) || hours < 1 || hours > 48) {
      return res.status(400).json({ message: 'Workload hours must be between 1 and 48' });
    }

    // Validate deadline is in future
    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) {
      return res.status(400).json({ message: 'Invalid deadline date' });
    }
    if (deadlineDate < new Date()) {
      return res.status(400).json({ message: 'Deadline must be a future date' });
    }

    const task = await Task.create({
      userId: req.userId,
      title,
      module,
      type,
      priority: priority || 'Medium',
      deadline: deadlineDate,
      workloadHours: hours
    });

    res.status(201).json({ success: true, task });
  } catch (error) {
    console.error('Task creation error:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all tasks for logged-in user
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId }).sort({ deadline: 1 });

    // Update overdue tasks
    const now = new Date();
    for (let task of tasks) {
      if (task.status !== 'Completed' && task.deadline < now && task.status !== 'Overdue') {
        task.status = 'Overdue';
        await task.save();
      }
    }

    res.status(200).json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if task belongs to user
    if (task.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this task' });
    }

    res.status(200).json({ success: true, task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if task belongs to user
    if (task.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    // Validate deadline if provided
    if (req.body.deadline) {
      const deadlineDate = new Date(req.body.deadline);
      if (deadlineDate < new Date() && req.body.status !== 'Completed') {
        return res.status(400).json({ message: 'Deadline must be a future date' });
      }
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, task });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if task belongs to user
    if (task.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
