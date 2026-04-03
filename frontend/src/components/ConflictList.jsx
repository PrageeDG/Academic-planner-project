import { AlertTriangle, Clock, Calendar, BookOpen, AlertCircle } from 'lucide-react';
import PropTypes from 'prop-types';

const ConflictList = ({ collisions, heavyDays }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getPriorityStyle = (priority) => {
    if (priority === 'High') return 'data-pill data-pill-danger';
    if (priority === 'Medium') return 'data-pill data-pill-warning';
    return 'data-pill data-pill-success';
  };

  const hasConflicts = collisions?.length > 0 || heavyDays?.length > 0;

  if (!hasConflicts) {
    return (
      <div className="surface-card p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-700">
          <Calendar className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900">No Conflicts Detected</h3>
        <p className="mt-2 text-slate-500">Your schedule looks healthy and balanced.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Deadline Conflicts</h2>
          <p className="text-sm text-slate-500">Review and rebalance your workload before it piles up.</p>
        </div>
      </div>

      {collisions?.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-rose-700" />
            <h3 className="text-lg font-semibold text-slate-900">Same-Day Conflicts</h3>
            <span className="data-pill data-pill-danger">{collisions.length}</span>
          </div>

          {collisions.map((collision, index) => (
            <div key={index} className="surface-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-slate-700" />
                  <div>
                    <p className="font-semibold text-slate-900">{formatDate(collision.date)}</p>
                    <p className="text-sm text-slate-500">{collision.taskCount} deadlines on the same day</p>
                  </div>
                </div>
                <AlertTriangle className="h-5 w-5 text-rose-700" />
              </div>

              <div className="space-y-2">
                {collision.tasks.map((task, taskIndex) => (
                  <div key={taskIndex} className="soft-card flex items-start justify-between gap-3 p-3">
                    <div className="flex flex-1 items-start gap-3">
                      <BookOpen className="mt-1 h-4 w-4 shrink-0 text-slate-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{task.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{task.module}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={getPriorityStyle(task.priority)}>{task.priority}</span>
                      <div className="flex items-center gap-1 text-slate-500">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs">{task.workloadHours}h</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {heavyDays?.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-700" />
            <h3 className="text-lg font-semibold text-slate-900">Daily Overload</h3>
            <span className="data-pill data-pill-warning">{heavyDays.length}</span>
          </div>

          {heavyDays.map((day, index) => (
            <div key={index} className="surface-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-slate-700" />
                  <div>
                    <p className="font-semibold text-slate-900">{formatDate(day.date)}</p>
                    <p className="text-sm text-slate-500">{day.totalHours} hours workload ({day.overloadPercentage}% of limit)</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-slate-900">{day.totalHours}h</p>
                  <p className="text-xs text-slate-500">{day.taskCount} tasks</p>
                </div>
              </div>

              <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-slate-700 transition-all duration-500" style={{ width: `${Math.min(100, day.overloadPercentage)}%` }}></div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {day.tasks.slice(0, 4).map((task, taskIndex) => (
                  <div key={taskIndex} className="soft-card p-2">
                    <p className="truncate text-xs font-medium text-slate-900">{task.title}</p>
                    <div className="mt-1 flex items-center justify-between">
                      <span className={getPriorityStyle(task.priority)}>{task.priority}</span>
                      <span className="text-xs text-slate-500">{task.workloadHours}h</span>
                    </div>
                  </div>
                ))}
              </div>
              {day.tasks.length > 4 && <p className="mt-2 text-center text-xs text-slate-500">+{day.tasks.length - 4} more task(s)</p>}
            </div>
          ))}
        </div>
      )}

      <div className="alert-info">
        <p className="text-sm">
          <span className="font-semibold">Recommendation:</span> Spread work across multiple days where possible to keep the schedule comfortable.
        </p>
      </div>
    </div>
  );
};

ConflictList.propTypes = {
  collisions: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string,
      taskCount: PropTypes.number,
      tasks: PropTypes.array,
    })
  ),
  heavyDays: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string,
      totalHours: PropTypes.number,
      taskCount: PropTypes.number,
      overloadPercentage: PropTypes.number,
      tasks: PropTypes.array,
    })
  ),
};

export default ConflictList;
