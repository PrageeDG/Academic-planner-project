const Task = require('../models/Task');

const normalizeTaskPayload = (payload, { creating = false } = {}) => {
  const data = { ...payload };

  if (data.deadline) {
    const deadlineDate = new Date(data.deadline);
    if (isNaN(deadlineDate.getTime())) {
      throw new Error('Invalid deadline date');
    }
    data.deadline = deadlineDate;
  }

  if (data.workloadHours !== undefined) {
    const hours = parseInt(data.workloadHours, 10);
    if (isNaN(hours) || hours < 1 || hours > 48) {
      throw new Error('Workload hours must be between 1 and 48');
    }
    data.workloadHours = hours;
  }

  if (data.progress !== undefined) {
    const progress = parseInt(data.progress, 10);
    if (isNaN(progress) || progress < 0 || progress > 100) {
      throw new Error('Progress must be between 0 and 100');
    }
    data.progress = progress;
  }

  if (data.resourceLink) {
    const isValidUrl = /^https?:\/\/.+/i.test(data.resourceLink);
    if (!isValidUrl) {
      throw new Error('Resource link must start with http:// or https://');
    }
  }

  if (data.reminderSet !== undefined) {
    data.reminderSet = Boolean(data.reminderSet);
  }

  if (data.status === 'Completed' && data.progress !== undefined && data.progress < 100) {
    data.progress = 100;
  }

  if (data.progress === 100 && data.status !== 'Overdue') {
    data.status = 'Completed';
  }

  if (data.deadline && data.status !== 'Completed' && data.deadline < new Date()) {
    data.status = 'Overdue';
  }

  if (creating && data.deadline && data.deadline < new Date()) {
    throw new Error('Deadline must be a future date');
  }

  return data;
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    const { title, module, type, deadline, workloadHours } = req.body;

    // Validate required fields
    if (!title || !module || !type || !deadline || !workloadHours) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const normalizedData = normalizeTaskPayload(req.body, { creating: true });

    const task = await Task.create({
      userId: req.userId,
      ...normalizedData
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

    const normalizedData = normalizeTaskPayload(req.body);

    task = await Task.findByIdAndUpdate(req.params.id, normalizedData, {
      returnDocument: 'after',
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
