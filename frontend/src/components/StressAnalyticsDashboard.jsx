import { Clock, AlertTriangle, TrendingUp, Calendar, Activity } from 'lucide-react';
import PropTypes from 'prop-types';

const StressAnalyticsDashboard = ({ analysis }) => {
  const weeklyLoad = analysis?.weeklyLoad || 0;
  const heavyDaysCount = analysis?.heavyDaysCount || 0;
  const collisionCount = analysis?.collisionCount || 0;
  const taskDensity = analysis?.taskDensity || 0;
  const consecutiveHeavyDays = analysis?.consecutiveHeavyDays || 0;

  const statCards = [
    { icon: Clock, label: 'Weekly Workload', value: `${weeklyLoad}h`, subtext: 'of 25h recommended' },
    { icon: AlertTriangle, label: 'Collision Days', value: collisionCount, subtext: 'days with 3+ deadlines' },
    { icon: Activity, label: 'Task Density', value: taskDensity, subtext: 'tasks this week' },
    { icon: TrendingUp, label: 'Consecutive Heavy Days', value: consecutiveHeavyDays, subtext: 'days in a row' },
  ];

  const workloadLabel = weeklyLoad <= 15 ? 'Light' : weeklyLoad <= 25 ? 'Moderate' : 'Heavy';
  const workloadBadge = weeklyLoad <= 15 ? 'data-pill data-pill-success' : weeklyLoad <= 25 ? 'data-pill data-pill-warning' : 'data-pill data-pill-danger';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="surface-card p-6">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="text-3xl font-semibold text-slate-900">{stat.value}</p>
              <p className="mt-1 text-xs text-slate-500">{stat.subtext}</p>
            </div>
          );
        })}
      </div>

      <div className="surface-card p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Calendar className="h-5 w-5 text-slate-700" />
            Weekly Workload Distribution
          </h3>
          <span className={workloadBadge}>{workloadLabel}</span>
        </div>

        <div className="mb-3">
          <div className="mb-2 flex items-end justify-between">
            <p className="text-2xl font-semibold text-slate-900">{weeklyLoad}h</p>
            <p className="text-sm text-slate-500">/ 25h healthy range</p>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-slate-700 transition-all duration-500"
              style={{ width: `${Math.min(100, (weeklyLoad / 25) * 100)}%` }}
            ></div>
          </div>
          <p className="mt-1 text-xs text-slate-500">{Math.round((weeklyLoad / 25) * 100)}% of recommended limit</p>
        </div>

        <div className="grid grid-cols-3 gap-3 border-t border-slate-200 pt-4">
          <div>
            <p className="mb-1 text-xs text-slate-500">Avg Daily</p>
            <p className="text-xl font-semibold text-slate-900">{analysis?.analysis?.averageDailyLoad || 0}h</p>
          </div>
          <div>
            <p className="mb-1 text-xs text-slate-500">Peak Day</p>
            <p className="text-xl font-semibold text-slate-900">
              {analysis?.analysis?.peakWorkloadDay
                ? new Date(analysis.analysis.peakWorkloadDay).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : 'N/A'}
            </p>
          </div>
          <div>
            <p className="mb-1 text-xs text-slate-500">Health Score</p>
            <p className="text-xl font-semibold text-slate-900">{analysis?.analysis?.healthScore || 0}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-900">Alerts</h3>

        {weeklyLoad > 25 && (
          <div className="alert-danger">
            <p className="font-semibold">Heavy Workload</p>
            <p className="text-sm">Your weekly load ({weeklyLoad}h) exceeds the 25 hour recommendation.</p>
          </div>
        )}

        {collisionCount > 0 && (
          <div className="alert-warning">
            <p className="font-semibold">Deadline Collisions</p>
            <p className="text-sm">You have {collisionCount} day(s) with multiple deadlines.</p>
          </div>
        )}

        {consecutiveHeavyDays > 2 && (
          <div className="alert-danger">
            <p className="font-semibold">Consecutive Heavy Days</p>
            <p className="text-sm">{consecutiveHeavyDays} heavy days in a row detected.</p>
          </div>
        )}

        {heavyDaysCount > 2 && (
          <div className="alert-warning">
            <p className="font-semibold">Multiple Heavy Days</p>
            <p className="text-sm">{heavyDaysCount} day(s) this week exceed 10 hours.</p>
          </div>
        )}
      </div>
    </div>
  );
};

StressAnalyticsDashboard.propTypes = {
  analysis: PropTypes.shape({
    weeklyLoad: PropTypes.number,
    heavyDaysCount: PropTypes.number,
    collisionCount: PropTypes.number,
    taskDensity: PropTypes.number,
    consecutiveHeavyDays: PropTypes.number,
    analysis: PropTypes.shape({
      averageDailyLoad: PropTypes.number,
      peakWorkloadDay: PropTypes.string,
      healthScore: PropTypes.number,
    }),
  }),
};

export default StressAnalyticsDashboard;
