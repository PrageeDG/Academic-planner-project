import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  AlertCircle,
  Bell,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Edit2,
  ExternalLink,
  FileText,
  Flag,
  Trash2,
} from 'lucide-react';

const PRIORITY_STYLES = {
  High: { pill: 'data-pill data-pill-danger', icon: 'text-rose-700' },
  Medium: { pill: 'data-pill data-pill-warning', icon: 'text-amber-700' },
  Low: { pill: 'data-pill data-pill-success', icon: 'text-emerald-700' },
};

const STATUS_STYLES = {
  Pending: 'data-pill data-pill-neutral',
  'In Progress': 'data-pill data-pill-accent',
  Completed: 'data-pill data-pill-success',
  Overdue: 'data-pill data-pill-danger',
};

const TaskCard = ({ task, onEdit, onDelete, onToggleComplete, initiallyExpanded = false }) => {
  const [expanded, setExpanded] = useState(initiallyExpanded);

  const countdown = useMemo(() => {
    const now = new Date();
    const deadline = new Date(task.deadline);
    const diff = deadline - now;

    if (task.status === 'Completed') {
      return { label: 'Completed', tone: 'text-emerald-700' };
    }

    if (diff < 0) {
      const overdueDays = Math.max(1, Math.ceil(Math.abs(diff) / (1000 * 60 * 60 * 24)));
      return {
        label: `Overdue by ${overdueDays} day${overdueDays > 1 ? 's' : ''}`,
        tone: 'text-rose-700',
      };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return {
        label: `${days} day${days > 1 ? 's' : ''} ${hours}h left`,
        tone: days <= 2 ? 'text-amber-700' : 'text-slate-700',
      };
    }

    return {
      label: `${Math.max(1, hours)} hour${hours !== 1 ? 's' : ''} left`,
      tone: 'text-amber-700',
    };
  }, [task.deadline, task.status]);

  const formattedDate = new Date(task.deadline).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const isUrgent = task.status !== 'Completed' && new Date(task.deadline) - new Date() <= 1000 * 60 * 60 * 24 * 2;
  const priorityStyle = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.Medium;

  return (
    <div className="surface-card p-5 md:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className={priorityStyle.pill}>
              <Flag className={`mr-1 h-3.5 w-3.5 ${priorityStyle.icon}`} />
              {task.priority}
            </span>
            <span className={STATUS_STYLES[task.status] || STATUS_STYLES.Pending}>
              {task.status}
            </span>
            <span className="data-pill data-pill-neutral">
              <BookOpen className="mr-1 h-3.5 w-3.5" />
              {task.type}
            </span>
            {task.reminderSet && (
              <span className="data-pill data-pill-accent">
                <Bell className="mr-1 h-3.5 w-3.5" />
                Reminder set
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-xl font-semibold text-slate-900">{task.title}</h3>
              <p className="mt-1 text-sm text-slate-600">
                {task.module}
                {task.moduleCode ? ` • ${task.moduleCode}` : ''}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right">
              <p className={`text-sm font-semibold ${countdown.tone}`}>{countdown.label}</p>
              <p className={`mt-1 text-xs ${isUrgent ? 'text-rose-600' : 'text-slate-500'}`}>{formattedDate}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={() => onToggleComplete(task)} className="secondary-btn px-4 py-2.5">
            <CheckCircle2 className="h-4 w-4" />
            {task.status === 'Completed' ? 'Completed' : 'Mark Complete'}
          </button>
          <button onClick={() => onEdit(task)} className="secondary-btn px-4 py-2.5">
            <Edit2 className="h-4 w-4" />
            Edit
          </button>
          <button onClick={() => onDelete(task._id)} className="danger-btn px-4 py-2.5">
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="soft-card p-4">
          <p className="text-xs text-slate-500">Estimated Workload</p>
          <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Clock3 className="h-4 w-4 text-slate-600" />
            {task.workloadHours} hour{task.workloadHours !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="soft-card p-4">
          <p className="text-xs text-slate-500">Category</p>
          <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <FileText className="h-4 w-4 text-slate-600" />
            {task.type}
          </p>
        </div>
        <div className={`soft-card p-4 ${isUrgent ? 'border-rose-200 bg-rose-50/70' : ''}`}>
          <p className="text-xs text-slate-500">Due Date</p>
          <p className={`mt-1 flex items-center gap-2 text-sm font-semibold ${isUrgent ? 'text-rose-700' : 'text-slate-900'}`}>
            <Calendar className="h-4 w-4" />
            {formattedDate}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-slate-600">Progress</span>
          <span className="font-semibold text-slate-900">{task.progress ?? 0}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full rounded-full transition-all ${
              (task.progress ?? 0) >= 100
                ? 'bg-emerald-600'
                : (task.progress ?? 0) >= 60
                ? 'bg-sky-700'
                : 'bg-amber-500'
            }`}
            style={{ width: `${task.progress ?? 0}%` }}
          ></div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-slate-900"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {expanded ? 'Hide details' : 'Show details'}
        </button>

        {task.resourceLink && (
          <a
            href={task.resourceLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700 transition hover:text-sky-800"
          >
            <ExternalLink className="h-4 w-4" />
            Open resource
          </a>
        )}
      </div>

      {expanded && (
        <div className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-200 pt-5 lg:grid-cols-2">
          <div className="soft-card p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Notes</p>
            <p className="text-sm leading-6 text-slate-700">
              {task.notes?.trim() || 'No notes added yet. Add notes to capture instructions, references, or checklist details.'}
            </p>
          </div>

          <div className="soft-card p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Task Details</p>
            <div className="space-y-2 text-sm text-slate-700">
              <p><span className="font-semibold text-slate-900">Status:</span> {task.status}</p>
              <p><span className="font-semibold text-slate-900">Priority:</span> {task.priority}</p>
              <p><span className="font-semibold text-slate-900">Module:</span> {task.moduleCode ? `${task.module} (${task.moduleCode})` : task.module}</p>
              <p><span className="font-semibold text-slate-900">Reminder:</span> {task.reminderSet ? 'Reminder set' : 'No reminder set'}</p>
              {task.resourceLink ? (
                <p className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-slate-500" />
                  Resource attached
                </p>
              ) : (
                <p>No resource link attached</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

TaskCard.propTypes = {
  task: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onToggleComplete: PropTypes.func.isRequired,
  initiallyExpanded: PropTypes.bool,
};

export default TaskCard;
