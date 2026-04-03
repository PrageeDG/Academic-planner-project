const Task = require('../models/Task');
const Analysis = require('../models/Analysis');

// Helper function to format date
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

// Burnout Risk Algorithm
const calculateBurnoutScore = (taskData) => {
  let riskScore = 0;

  // Factor 1: Weekly Workload (Weight: 40%)
  // Healthy: <=25 hours, Moderate: 26-35 hours, High: >35 hours
  const weeklyLoad = taskData.weeklyLoad || 0;
  let workloadRisk = 0;
  
  if (weeklyLoad <= 15) {
    workloadRisk = 0;
  } else if (weeklyLoad <= 25) {
    workloadRisk = ((weeklyLoad - 15) / 10) * 25; // 0-25
  } else if (weeklyLoad <= 35) {
    workloadRisk = 25 + ((weeklyLoad - 25) / 10) * 40; // 25-65
  } else {
    workloadRisk = Math.min(65 + ((weeklyLoad - 35) / 10) * 35, 100); // 65-100
  }
  
  riskScore += workloadRisk * 0.40;

  // Factor 2: Deadline Density / Task Count (Weight: 25%)
  // More tasks in same week = higher density
  const taskDensity = taskData.taskCount || 0;
  let densityRisk = 0;
  
  if (taskDensity <= 3) {
    densityRisk = taskDensity * 8; // 0-24
  } else if (taskDensity <= 6) {
    densityRisk = 24 + ((taskDensity - 3) / 3) * 30; // 24-54
  } else {
    densityRisk = 54 + ((taskDensity - 6) / 4) * 46; // 54-100
  }
  
  riskScore += densityRisk * 0.25;

  // Factor 3: Consecutive Heavy Days (Weight: 20%)
  // Heavy day = more than 10 hours
  const consecutiveHeavy = taskData.consecutiveHeavyDays || 0;
  let consecutiveRisk = 0;
  
  if (consecutiveHeavy === 0) {
    consecutiveRisk = 0;
  } else if (consecutiveHeavy === 1) {
    consecutiveRisk = 15;
  } else if (consecutiveHeavy === 2) {
    consecutiveRisk = 35;
  } else if (consecutiveHeavy === 3) {
    consecutiveRisk = 65;
  } else {
    consecutiveRisk = 100;
  }
  
  riskScore += consecutiveRisk * 0.20;

  // Factor 4: Collision Count (Weight: 15%)
  // Multiple deadlines on same day
  const collisions = taskData.collisionCount || 0;
  let collisionRisk = Math.min(collisions * 20, 100);
  
  riskScore += collisionRisk * 0.15;

  return Math.round(Math.min(riskScore, 100));
};

// Determine risk level
const getRiskLevel = (riskScore) => {
  if (riskScore <= 40) return 'Low';
  if (riskScore <= 70) return 'Moderate';
  return 'High';
};

// Generate suggestions based on analysis
const generateSuggestions = (analysis, riskScore) => {
  const suggestions = [];

  if (analysis.weeklyLoad > 25) {
    suggestions.push('Consider delaying non-critical tasks to reduce your workload.');
  }

  if (analysis.consecutiveHeavyDays > 2) {
    suggestions.push('Take breaks between heavy workload days to prevent burnout.');
  }

  if (analysis.collisionCount > 0) {
    suggestions.push(`You have ${analysis.collisionCount} date(s) with multiple deadlines - try to reschedule if possible.`);
  }

  if (analysis.taskDensity > 6) {
    suggestions.push('You have many tasks this week. Prioritize and focus on high-importance items.');
  }

  if (riskScore >= 71) {
    suggestions.push('🚨 High burnout risk detected! Seek support from instructors or advisors.');
    suggestions.push('Consider requesting deadline extensions for non-critical assignments.');
  } else if (riskScore >= 41) {
    suggestions.push('⚠️ Moderate stress level. Stay organized and maintain a healthy sleep schedule.');
    suggestions.push('Use time management techniques like Pomodoro to improve productivity.');
  } else {
    suggestions.push('✅ Your workload is manageable. Keep maintaining your current pace!');
  }

  return suggestions;
};

// Main burnout analysis function
exports.analyzeBurnout = async (req, res) => {
  try {
    const userId = req.userId;

    // Check if Task model exists (for backward compatibility)
    let tasks = [];
    try {
      tasks = await Task.find({
        userId,
        status: { $in: ['Pending', 'Overdue'] }
      }).sort({ deadline: 1 });
    } catch (err) {
      console.log('Task model not available, using empty tasks array');
    }

    if (!tasks || tasks.length === 0) {
      return res.status(200).json({
        success: true,
        riskScore: 0,
        riskLevel: 'Low',
        weeklyLoad: 0,
        collisionCount: 0,
        heavyDays: [],
        consecutiveHeavyDays: 0,
        taskDensity: 0,
        suggestions: ['✅ No active tasks. Relax and enjoy your free time!'],
        analysis: {
          averageDailyLoad: 0,
          peakWorkloadDay: null,
          healthScore: 100
        }
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

    // Calculate current week load
    const currentWeek = getWeekNumber(new Date());
    const currentWeekTasks = tasksByWeek[currentWeek] || [];
    const weeklyLoad = currentWeekTasks.reduce((sum, task) => sum + task.workloadHours, 0);

    // Detect heavy days (>10 hours)
    const heavyDays = [];
    let consecutiveHeavyCount = 0;
    let maxConsecutiveHeavy = 0;
    let lastWasHeavy = false;

    Object.keys(tasksByDate).sort().forEach(date => {
      const dayTasks = tasksByDate[date];
      const dailyHours = dayTasks.reduce((sum, task) => sum + task.workloadHours, 0);

      if (dailyHours > 10) {
        heavyDays.push({ date, hours: dailyHours, taskCount: dayTasks.length });
        
        if (lastWasHeavy) {
          consecutiveHeavyCount++;
        } else {
          consecutiveHeavyCount = 1;
          lastWasHeavy = true;
        }
        maxConsecutiveHeavy = Math.max(maxConsecutiveHeavy, consecutiveHeavyCount);
      } else {
        lastWasHeavy = false;
        consecutiveHeavyCount = 0;
      }
    });

    // Count collisions (3+ tasks on same day)
    let collisionCount = 0;
    Object.keys(tasksByDate).forEach(date => {
      if (tasksByDate[date].length >= 3) {
        collisionCount++;
      }
    });

    // Calculate average daily load
    const totalDays = Object.keys(tasksByDate).length;
    const totalWeeklyLoad = currentWeekTasks.reduce((sum, task) => sum + task.workloadHours, 0);
    const averageDailyLoad = totalDays > 0 ? Math.round(totalWeeklyLoad / totalDays) : 0;

    // Find peak workload day
    const peakDay = Object.keys(tasksByDate).reduce((max, date) => {
      const dayHours = tasksByDate[date].reduce((sum, task) => sum + task.workloadHours, 0);
      const maxHours = tasksByDate[max]?.reduce((sum, task) => sum + task.workloadHours, 0) || 0;
      return dayHours > maxHours ? date : max;
    }, Object.keys(tasksByDate)[0]);

    // Prepare analysis data
    const analysisData = {
      weeklyLoad,
      taskCount: currentWeekTasks.length,
      collisionCount,
      consecutiveHeavyDays: maxConsecutiveHeavy,
      taskDensity: currentWeekTasks.length,
      heavyDaysCount: heavyDays.length
    };

    // Calculate burnout score
    const riskScore = calculateBurnoutScore(analysisData);
    const riskLevel = getRiskLevel(riskScore);
    const suggestions = generateSuggestions(analysisData, riskScore);

    // Calculate health score (inverse of risk)
    const healthScore = Math.max(0, 100 - riskScore);

    // Save analysis to database
    try {
      const newAnalysis = new Analysis({
        userId,
        weeklyLoad,
        riskScore,
        riskLevel,
        collisionCount,
        heavyDaysCount: heavyDays.length,
        averageDailyLoad,
        peakWorkloadDay: peakDay,
        consecutiveHeavyDays: maxConsecutiveHeavy,
        taskDensity: currentWeekTasks.length,
        suggestions
      });

      await newAnalysis.save();
    } catch (err) {
      console.log('Note: Analysis recording failed (Analysis model may not be available)');
    }

    // Response
    res.status(200).json({
      success: true,
      riskScore,
      riskLevel,
      weeklyLoad,
      collisionCount,
      heavyDays,
      consecutiveHeavyDays: maxConsecutiveHeavy,
      taskDensity: currentWeekTasks.length,
      suggestions,
      analysis: {
        averageDailyLoad,
        peakWorkloadDay: peakDay,
        healthScore,
        totalTasks: tasks.length,
        currentWeekTasks: currentWeekTasks.length
      }
    });

  } catch (error) {
    console.error('Burnout analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing burnout risk',
      error: error.message
    });
  }
};

// Get previous analysis history
exports.getAnalysisHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const limit = req.query.limit || 10;

    const history = await Analysis.find({ userId })
      .sort({ generatedAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });

  } catch (error) {
    console.error('Analysis history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analysis history',
      error: error.message
    });
  }
};

// Get latest analysis
exports.getLatestAnalysis = async (req, res) => {
  try {
    const userId = req.userId;

    const latest = await Analysis.findOne({ userId })
      .sort({ generatedAt: -1 });

    if (!latest) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No analysis found'
      });
    }

    res.status(200).json({
      success: true,
      data: latest
    });

  } catch (error) {
    console.error('Latest analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching latest analysis',
      error: error.message
    });
  }
};
