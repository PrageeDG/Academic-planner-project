const Task = require('../models/Task');

// Helper function to format date to YYYY-MM-DD
const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to get week number
const getWeekNumber = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getFullYear()}-W${weekNo}`;
};

// Analyze deadlines and detect collisions
exports.analyzeCollisions = async (req, res) => {
  try {
    const userId = req.userId;

    // Get all pending and overdue tasks for the user
    const tasks = await Task.find({
      userId,
      status: { $in: ['Pending', 'Overdue'] }
    }).sort({ deadline: 1 });

    if (!tasks || tasks.length === 0) {
      return res.status(200).json({
        success: true,
        collisions: [],
        heavyDays: [],
        heavyWeeks: [],
        weeklyLoad: 0,
        warnings: [],
        totalTasks: 0
      });
    }

    // Group tasks by date
    const tasksByDate = {};
    tasks.forEach(task => {
      const dateKey = formatDate(task.deadline);
      if (!tasksByDate[dateKey]) {
        tasksByDate[dateKey] = [];
      }
      tasksByDate[dateKey].push(task);
    });

    // Group tasks by week
    const tasksByWeek = {};
    tasks.forEach(task => {
      const weekKey = getWeekNumber(task.deadline);
      if (!tasksByWeek[weekKey]) {
        tasksByWeek[weekKey] = [];
      }
      tasksByWeek[weekKey].push(task);
    });

    // Detect collisions (3+ tasks on same day)
    const collisions = [];
    Object.keys(tasksByDate).forEach(date => {
      const dayTasks = tasksByDate[date];
      if (dayTasks.length >= 3) {
        collisions.push({
          date,
          taskCount: dayTasks.length,
          tasks: dayTasks.map(t => ({
            id: t._id,
            title: t.title,
            module: t.module,
            type: t.type,
            priority: t.priority,
            workloadHours: t.workloadHours
          }))
        });
      }
    });

    // Detect daily overload (>10 hours in a day)
    const heavyDays = [];
    Object.keys(tasksByDate).forEach(date => {
      const dayTasks = tasksByDate[date];
      const totalHours = dayTasks.reduce((sum, task) => sum + task.workloadHours, 0);
      
      if (totalHours > 10) {
        heavyDays.push({
          date,
          totalHours,
          taskCount: dayTasks.length,
          overloadPercentage: Math.round((totalHours / 10) * 100),
          tasks: dayTasks.map(t => ({
            id: t._id,
            title: t.title,
            module: t.module,
            workloadHours: t.workloadHours,
            priority: t.priority
          }))
        });
      }
    });

    // Detect weekly overload (>25 hours in a week)
    const heavyWeeks = [];
    Object.keys(tasksByWeek).forEach(week => {
      const weekTasks = tasksByWeek[week];
      const totalHours = weekTasks.reduce((sum, task) => sum + task.workloadHours, 0);
      
      if (totalHours > 25) {
        heavyWeeks.push({
          week,
          totalHours,
          taskCount: weekTasks.length,
          overloadPercentage: Math.round((totalHours / 25) * 100),
          tasks: weekTasks.map(t => ({
            id: t._id,
            title: t.title,
            deadline: t.deadline,
            workloadHours: t.workloadHours
          }))
        });
      }
    });

    // Calculate total weekly load (current week)
    const currentWeek = getWeekNumber(new Date());
    const currentWeekTasks = tasksByWeek[currentWeek] || [];
    const weeklyLoad = currentWeekTasks.reduce((sum, task) => sum + task.workloadHours, 0);

    // Generate warnings
    const warnings = [];
    
    if (collisions.length > 0) {
      warnings.push({
        type: 'collision',
        severity: 'high',
        message: `You have ${collisions.length} day(s) with 3 or more deadlines`
      });
    }

    if (heavyDays.length > 0) {
      warnings.push({
        type: 'daily_overload',
        severity: 'medium',
        message: `${heavyDays.length} day(s) exceed 10-hour workload limit`
      });
    }

    if (heavyWeeks.length > 0) {
      warnings.push({
        type: 'weekly_overload',
        severity: 'high',
        message: `${heavyWeeks.length} week(s) exceed 25-hour workload limit`
      });
    }

    if (weeklyLoad > 25) {
      warnings.push({
        type: 'current_week_overload',
        severity: 'critical',
        message: `Current week workload (${weeklyLoad}h) exceeds healthy limit`
      });
    }

    // Response data
    res.status(200).json({
      success: true,
      collisions,
      heavyDays,
      heavyWeeks,
      weeklyLoad,
      warnings,
      totalTasks: tasks.length,
      analysis: {
        sameDayConflicts: collisions.length,
        dailyOverloads: heavyDays.length,
        weeklyOverloads: heavyWeeks.length,
        healthScore: calculateHealthScore(collisions.length, heavyDays.length, heavyWeeks.length)
      }
    });

  } catch (error) {
    console.error('Collision analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing collisions',
      error: error.message
    });
  }
};

// Calculate health score (0-100)
const calculateHealthScore = (collisions, heavyDays, heavyWeeks) => {
  let score = 100;
  
  // Deduct points for issues
  score -= collisions * 15;  // -15 per collision day
  score -= heavyDays * 10;   // -10 per heavy day
  score -= heavyWeeks * 20;  // -20 per heavy week
  
  return Math.max(0, score);
};

// Get collision summary for a specific task
exports.checkTaskCollision = async (req, res) => {
  try {
    const userId = req.userId;
    const { deadline, workloadHours } = req.body;

    if (!deadline || !workloadHours) {
      return res.status(400).json({
        success: false,
        message: 'Deadline and workload hours are required'
      });
    }

    const deadlineDate = new Date(deadline);
    const dateKey = formatDate(deadlineDate);

    // Get tasks on the same day
    const sameDayTasks = await Task.find({
      userId,
      status: { $in: ['Pending', 'Overdue'] },
      deadline: {
        $gte: new Date(dateKey),
        $lt: new Date(new Date(dateKey).setDate(new Date(dateKey).getDate() + 1))
      }
    });

    const totalHours = sameDayTasks.reduce((sum, task) => sum + task.workloadHours, 0) + parseInt(workloadHours);
    const totalTasks = sameDayTasks.length + 1;

    const hasCollision = totalTasks >= 3;
    const hasDailyOverload = totalHours > 10;

    const warnings = [];
    if (hasCollision) {
      warnings.push({
        type: 'collision',
        message: `This will create ${totalTasks} deadlines on the same day`
      });
    }
    if (hasDailyOverload) {
      warnings.push({
        type: 'overload',
        message: `Total workload for this day will be ${totalHours} hours (>10h limit)`
      });
    }

    res.status(200).json({
      success: true,
      hasCollision,
      hasDailyOverload,
      sameDayTasks: sameDayTasks.length,
      totalHours,
      warnings
    });

  } catch (error) {
    console.error('Task collision check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking task collision',
      error: error.message
    });
  }
};
