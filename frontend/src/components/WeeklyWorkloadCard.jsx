import { Clock, TrendingUp, AlertTriangle, CheckCircle2, Calendar } from 'lucide-react';
import PropTypes from 'prop-types';

const WeeklyWorkloadCard = ({ analysis }) => {
  const weeklyLoad = analysis?.weeklyLoad || 0;
  const healthScore = analysis?.analysis?.healthScore || 100;
  const heavyDays = analysis?.heavyDays || [];
  const warnings = analysis?.warnings || [];
  const workloadPercentage = Math.min(100, Math.round((weeklyLoad / 25) * 100));

  const getHealthStatus = () => {
    if (healthScore >= 80) return { label: 'Excellent', color: 'text-emerald-700', icon: CheckCircle2 };
    if (healthScore >= 60) return { label: 'Good', color: 'text-slate-700', icon: TrendingUp };
    if (healthScore >= 40) return { label: 'Warning', color: 'text-amber-700', icon: AlertTriangle };
    return { label: 'Critical', color: 'text-rose-700', icon: AlertTriangle };
  };

  const workloadBadge = weeklyLoad <= 15 ? 'data-pill data-pill-success' : weeklyLoad <= 25 ? 'data-pill data-pill-warning' : 'data-pill data-pill-danger';
  const healthStatus = getHealthStatus();
  const HealthIcon = healthStatus.icon;

  return (
    <div className="surface-card p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Weekly Workload</h3>
            <p className="text-xs text-slate-500">Current week overview</p>
          </div>
        </div>
        <span className={workloadBadge}>{weeklyLoad <= 15 ? 'Light' : weeklyLoad <= 25 ? 'Moderate' : 'Heavy'}</span>
      </div>

      <div className="mb-6">
        <div className="mb-2 flex items-end gap-2">
          <p className="text-4xl font-semibold text-slate-900">{weeklyLoad}</p>
          <p className="mb-1 text-lg text-slate-500">/ 25 hours</p>
        </div>

        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-slate-700 transition-all duration-500" style={{ width: `${workloadPercentage}%` }}></div>
        </div>
        <p className="mt-2 text-xs text-slate-500">{workloadPercentage}% of recommended limit</p>
      </div>

      <div className="soft-card mb-4 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HealthIcon className={`h-5 w-5 ${healthStatus.color}`} />
            <div>
              <p className="text-xs text-slate-500">Health Score</p>
              <p className={`text-lg font-semibold ${healthStatus.color}`}>{healthStatus.label}</p>
            </div>
          </div>
          <p className="text-3xl font-semibold text-slate-900">{healthScore}</p>
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="mb-4 space-y-2">
          {warnings.slice(0, 2).map((warning, index) => (
            <div key={index} className={warning.severity === 'critical' ? 'alert-danger' : 'alert-warning'}>
              <p className="text-sm">{warning.message}</p>
            </div>
          ))}
        </div>
      )}

      {heavyDays.length > 0 && (
        <div className="alert-warning">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <p className="text-sm">
              <span className="font-semibold">{heavyDays.length}</span> day(s) exceed the 10-hour limit
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

WeeklyWorkloadCard.propTypes = {
  analysis: PropTypes.shape({
    weeklyLoad: PropTypes.number,
    heavyDays: PropTypes.array,
    warnings: PropTypes.array,
    analysis: PropTypes.shape({
      healthScore: PropTypes.number,
    }),
  }),
};

export default WeeklyWorkloadCard;
