import { X, AlertTriangle, Clock, AlertCircle } from 'lucide-react';
import PropTypes from 'prop-types';

const ConflictWarningModal = ({ isOpen, onClose, conflicts, onProceed }) => {
  if (!isOpen) return null;

  const warnings = conflicts?.warnings || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.12)] animate-scale-in">
        <button onClick={onClose} className="absolute right-4 top-4 rounded-lg p-2 transition hover:bg-slate-100">
          <X className="h-5 w-5 text-slate-500" />
        </button>

        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Deadline Collision Detected</h3>
            <p className="text-sm text-slate-500">Review before proceeding</p>
          </div>
        </div>

        <div className="mb-6 space-y-3">
          {warnings.map((warning, index) => (
            <div key={index} className="alert-danger flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-medium">{warning.message}</p>
                <p className="mt-1 text-sm text-rose-600">
                  {warning.type === 'collision' && 'Consider rescheduling or reducing workload.'}
                  {warning.type === 'overload' && 'This may lead to burnout and stress.'}
                </p>
              </div>
            </div>
          ))}

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="soft-card p-3">
              <div className="mb-1 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-slate-600" />
                <p className="text-xs text-slate-500">Same Day Tasks</p>
              </div>
              <p className="text-2xl font-semibold text-slate-900">{conflicts?.sameDayTasks || 0}</p>
            </div>

            <div className="soft-card p-3">
              <div className="mb-1 flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-600" />
                <p className="text-xs text-slate-500">Total Hours</p>
              </div>
              <p className="text-2xl font-semibold text-slate-900">{conflicts?.totalHours || 0}h</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="secondary-btn flex-1">
            Cancel
          </button>
          <button
            onClick={() => {
              onProceed();
              onClose();
            }}
            className="primary-btn flex-1"
          >
            Proceed Anyway
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">Tip: spread work across multiple days to make the schedule easier on your eyes and energy.</p>
      </div>
    </div>
  );
};

ConflictWarningModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  conflicts: PropTypes.shape({
    sameDayTasks: PropTypes.number,
    totalHours: PropTypes.number,
    hasDailyOverload: PropTypes.bool,
    warnings: PropTypes.arrayOf(
      PropTypes.shape({
        type: PropTypes.string,
        message: PropTypes.string,
      })
    ),
  }),
  onProceed: PropTypes.func.isRequired,
};

export default ConflictWarningModal;
