export const getStartOfDay = (value = new Date()) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

export const getEndOfWeek = (value = new Date()) => {
  const date = new Date(value);
  const day = date.getDay();
  const diff = day === 0 ? 0 : 7 - day;
  date.setHours(23, 59, 59, 999);
  date.setDate(date.getDate() + diff);
  return date;
};

export const formatShortDate = (value) =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

export const formatLongDateTime = (value) =>
  new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export const getDaysUntil = (value) => {
  const today = getStartOfDay();
  const target = getStartOfDay(value);
  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
};

export const getDeadlineMessage = (value, status) => {
  if (!value) return 'No deadline';

  const days = getDaysUntil(value);

  if (status === 'Completed') return 'Completed';
  if (days < 0) return `Overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'}`;
  if (days === 0) return 'Due today';
  if (days === 1) return '1 day remaining';
  return `${days} days remaining`;
};

export const getPriorityKey = (priority = 'Medium') => priority.toLowerCase();

export const getPriorityPillClass = (priority = 'Medium') => {
  const key = getPriorityKey(priority);
  if (key === 'high') return 'data-pill data-pill-danger';
  if (key === 'medium') return 'data-pill data-pill-warning';
  return 'data-pill data-pill-success';
};

export const buildNotifications = (tasks = [], collisionData = null) => {
  const activeTasks = tasks.filter((task) => task.status !== 'Completed');
  const overdueTasks = activeTasks.filter((task) => task.status === 'Overdue');
  const dueSoonTasks = activeTasks
    .filter((task) => {
      const days = getDaysUntil(task.deadline);
      return days >= 0 && days <= 3;
    })
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  const reminderTasks = activeTasks
    .filter((task) => task.reminderSet)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  const items = [];

  overdueTasks.slice(0, 2).forEach((task) => {
    items.push({
      id: `overdue-${task._id}`,
      type: 'Overdue',
      category: 'alert',
      title: task.title,
      description: `${task.module} is overdue. ${getDeadlineMessage(task.deadline, task.status)}`,
      timestamp: formatLongDateTime(task.deadline),
      tone: 'danger',
    });
  });

  dueSoonTasks.slice(0, 3).forEach((task) => {
    items.push({
      id: `due-soon-${task._id}`,
      type: 'Upcoming',
      category: 'alert',
      title: task.title,
      description: `${task.module} is due soon. ${getDeadlineMessage(task.deadline, task.status)}`,
      timestamp: formatLongDateTime(task.deadline),
      tone: 'warning',
    });
  });

  reminderTasks.slice(0, 2).forEach((task) => {
    items.push({
      id: `reminder-${task._id}`,
      type: 'Reminder',
      category: 'reminder',
      title: task.title,
      description: `Reminder enabled for ${task.module}. Due ${formatLongDateTime(task.deadline)}.`,
      timestamp: formatLongDateTime(task.deadline),
      tone: 'info',
    });
  });

  (collisionData?.warnings || []).slice(0, 3).forEach((warning, index) => {
    items.push({
      id: `warning-${index}`,
      type: 'Collision',
      category: 'alert',
      title: 'Schedule warning',
      description: warning.message,
      timestamp: 'Analysis update',
      tone: warning.severity === 'critical' || warning.severity === 'high' ? 'danger' : 'warning',
    });
  });

  return items.slice(0, 6);
};
