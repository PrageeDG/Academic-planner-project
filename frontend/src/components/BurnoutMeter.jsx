import { AlertTriangle, Activity } from 'lucide-react';
import PropTypes from 'prop-types';

const BurnoutMeter = ({ riskScore, riskLevel }) => {
  const getColors = () => {
    if (riskLevel === 'Low') {
      return { stroke: '#047857', text: 'text-emerald-700', label: 'text-emerald-700', badge: 'data-pill data-pill-success' };
    }
    if (riskLevel === 'Moderate') {
      return { stroke: '#b45309', text: 'text-amber-700', label: 'text-amber-700', badge: 'data-pill data-pill-warning' };
    }
    return { stroke: '#be123c', text: 'text-rose-700', label: 'text-rose-700', badge: 'data-pill data-pill-danger' };
  };

  const colors = getColors();
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (riskScore / 100) * circumference;

  return (
    <div className="surface-card p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold text-slate-900">Burnout Risk</h3>
          <p className="text-sm text-slate-500">Stress level indicator</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
          {riskLevel === 'Low' ? <Activity className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
        </div>
      </div>

      <div className="mb-8 flex justify-center">
        <div className="relative h-48 w-48">
          <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="45" fill="none" stroke="rgba(148, 163, 184, 0.35)" strokeWidth="8" />
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke={colors.stroke}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className={`text-4xl font-semibold ${colors.text}`}>{riskScore}</p>
            <p className={`text-xs font-bold uppercase ${colors.label}`}>{riskLevel}</p>
          </div>
        </div>
      </div>

      <div className="soft-card p-4 text-center">
        <p className={`mb-1 font-semibold ${colors.text}`}>
          {riskLevel === 'Low' && 'Healthy workload'}
          {riskLevel === 'Moderate' && 'Manageable but stressful'}
          {riskLevel === 'High' && 'High burnout risk'}
        </p>
        <p className="text-xs text-slate-500">
          {riskLevel === 'Low' && 'Your academic workload is well-balanced.'}
          {riskLevel === 'Moderate' && 'Consider organizing your tasks better.'}
          {riskLevel === 'High' && 'Seek support from advisors or peers.'}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="mb-1 text-xs text-slate-500">Low</p>
          <p className="text-sm font-semibold text-emerald-700">0-40</p>
        </div>
        <div>
          <p className="mb-1 text-xs text-slate-500">Moderate</p>
          <p className="text-sm font-semibold text-amber-700">41-70</p>
        </div>
        <div>
          <p className="mb-1 text-xs text-slate-500">High</p>
          <p className="text-sm font-semibold text-rose-700">71-100</p>
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <span className={colors.badge}>{riskLevel} risk</span>
      </div>
    </div>
  );
};

BurnoutMeter.propTypes = {
  riskScore: PropTypes.number.isRequired,
  riskLevel: PropTypes.oneOf(['Low', 'Moderate', 'High']).isRequired,
};

export default BurnoutMeter;
