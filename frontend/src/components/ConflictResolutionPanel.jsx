import { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { CalendarDays, CheckCheck, ClipboardPen, Clock3, Save, Trash2 } from 'lucide-react';
import { collisionAPI } from '../services/api';

const toDateTimeLocal = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
};

const getDatePart = (value) => {
  if (!value) return '';
  return value.slice(0, 10);
};

const getTimePart = (value) => {
  if (!value || value.length < 16) return '';
  return value.slice(11, 16);
};

const mergeDateAndTime = (datePart, timePart) => {
  if (!datePart) return '';
  return `${datePart}T${timePart || '00:00'}`;
};

const formatPreviewDateTime = (value) => {
  if (!value) return 'No date and time selected yet';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Invalid date selection';

  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const emptyForm = {
  issueKey: '',
  issueType: 'Same-Day Conflict',
  issueDate: '',
  status: 'Reviewed',
  action: 'Reschedule',
  suggestedDate: '',
  note: '',
};

const ConflictResolutionPanel = ({ analysis }) => {
  const suggestedDateRef = useRef(null);
  const suggestedTimeRef = useRef(null);
  const [formData, setFormData] = useState(emptyForm);
  const [savedResolutions, setSavedResolutions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [listLoading, setListLoading] = useState(true);

  const issueOptions = useMemo(() => {
    const conflictOptions = (analysis?.collisions || []).map((collision, index) => ({
      key: `collision-${index}`,
      label: `Same-Day Conflict • ${new Date(collision.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      type: 'Same-Day Conflict',
      date: collision.date,
      detail: `${collision.taskCount} deadlines on the same day`,
    }));

    const overloadOptions = (analysis?.heavyDays || []).map((day, index) => ({
      key: `overload-${index}`,
      label: `Daily Overload • ${new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      type: 'Daily Overload',
      date: day.date,
      detail: `${day.totalHours} workload hours`,
    }));

    return [...conflictOptions, ...overloadOptions];
  }, [analysis]);

  useEffect(() => {
    const loadResolutions = async () => {
      try {
        setListLoading(true);
        const response = await collisionAPI.getResolutions();
        setSavedResolutions(response.data.resolutions || []);
      } catch (error) {
        setSubmitError(error.response?.data?.message || 'Failed to load saved resolutions.');
      } finally {
        setListLoading(false);
      }
    };

    loadResolutions();
  }, []);

  useEffect(() => {
    if (!formData.issueKey && issueOptions[0]) {
      setFormData((current) => ({
        ...current,
        issueKey: issueOptions[0].key,
        issueType: issueOptions[0].type,
        issueDate: toDateTimeLocal(issueOptions[0].date),
      }));
    }
  }, [issueOptions, formData.issueKey]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrors((current) => ({
      ...current,
      [name]: '',
    }));
    setSubmitError('');

    if (name === 'issueKey') {
      const selectedIssue = issueOptions.find((issue) => issue.key === value);
      setFormData((current) => ({
        ...current,
        issueKey: value,
        issueType: selectedIssue?.type || current.issueType,
        issueDate: selectedIssue?.date ? toDateTimeLocal(selectedIssue.date) : current.issueDate,
      }));
      return;
    }

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleDateTimePartChange = (fieldName, part, value) => {
    setErrors((current) => ({
      ...current,
      [fieldName]: '',
    }));
    setSubmitError('');

    setFormData((current) => {
      const existingValue = current[fieldName];
      const nextDate = part === 'date' ? value : getDatePart(existingValue);
      const nextTime = part === 'time' ? value : getTimePart(existingValue);

      return {
        ...current,
        [fieldName]: nextDate ? mergeDateAndTime(nextDate, nextTime) : '',
      };
    });
  };

  const openNativePicker = (inputRef) => {
    const input = inputRef.current;
    if (!input) return;

    if (typeof input.showPicker === 'function') {
      input.showPicker();
      return;
    }

    input.focus();
    input.click();
  };

  const resetForm = () => {
    const firstIssue = issueOptions[0];
    setFormData({
      ...emptyForm,
      issueKey: firstIssue?.key || '',
      issueType: firstIssue?.type || 'Same-Day Conflict',
      issueDate: firstIssue?.date ? toDateTimeLocal(firstIssue.date) : '',
    });
    setErrors({});
    setEditingId(null);
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.issueKey) {
      nextErrors.issueKey = 'Select a conflict or overload item to resolve.';
    }

    if (!formData.issueDate) {
      nextErrors.issueDate = 'Issue date is required.';
    }

    if (!formData.status) {
      nextErrors.status = 'Choose a resolution status.';
    }

    if (!formData.action) {
      nextErrors.action = 'Choose a resolution action.';
    }

    if (!formData.note.trim()) {
      nextErrors.note = 'Add a short note explaining your decision.';
    } else if (formData.note.trim().length < 12) {
      nextErrors.note = 'Resolution note should be at least 12 characters.';
    }

    if ((formData.action === 'Reschedule' || formData.action === 'Ask for extension') && !formData.suggestedDate) {
      nextErrors.suggestedDate = 'Suggested date is required for this action.';
    }

    if (formData.suggestedDate && formData.issueDate && formData.suggestedDate < formData.issueDate) {
      nextErrors.suggestedDate = 'Suggested date should be on or after the issue date.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const saveResolution = async () => {
    const selectedIssue = issueOptions.find((issue) => issue.key === formData.issueKey);

    const payload = {
      issueKey: formData.issueKey,
      issueLabel: selectedIssue?.label || formData.issueType,
      issueType: formData.issueType,
      issueDate: formData.issueDate,
      status: formData.status,
      action: formData.action,
      suggestedDate: formData.suggestedDate,
      note: formData.note,
    };

    if (editingId) {
      const response = await collisionAPI.updateResolution(editingId, payload);
      setSavedResolutions((current) =>
        current.map((item) => (item._id === editingId ? response.data.resolution : item))
      );
      setSuccess('Resolution updated successfully.');
    } else {
      const response = await collisionAPI.createResolution(payload);
      setSavedResolutions((current) => [response.data.resolution, ...current]);
      setSuccess('Resolution saved successfully.');
    }
  };

  const handleValidatedSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setSuccess('');
      return;
    }

    try {
      setSubmitError('');
      await saveResolution();
      resetForm();
      window.setTimeout(() => setSuccess(''), 2000);
    } catch (error) {
      setSubmitError(error.response?.data?.message || 'Failed to save resolution.');
    }
  };

  const handleEdit = (resolution) => {
    setEditingId(resolution._id);
    setErrors({});
    setSubmitError('');
    setFormData({
      issueKey: resolution.issueKey,
      issueType: resolution.issueType,
      issueDate: toDateTimeLocal(resolution.issueDate),
      status: resolution.status,
      action: resolution.action,
      suggestedDate: toDateTimeLocal(resolution.suggestedDate),
      note: resolution.note,
    });
  };

  const handleDelete = async (id) => {
    try {
      setSubmitError('');
      await collisionAPI.deleteResolution(id);
      setSavedResolutions((current) => current.filter((item) => item._id !== id));
      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      setSubmitError(error.response?.data?.message || 'Failed to delete resolution.');
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="surface-card p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            <ClipboardPen className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Conflict Resolution Form</h3>
            <p className="text-sm text-slate-500">Review a collision, choose an action, and keep a record of how you plan to solve it.</p>
          </div>
        </div>

        {success && <div className="alert-success mb-5">{success}</div>}
        {submitError && <div className="alert-danger mb-5">{submitError}</div>}

        <form onSubmit={handleValidatedSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Select conflict</label>
            <select name="issueKey" value={formData.issueKey} onChange={handleChange} className="select-field">
              {issueOptions.length > 0 ? (
                issueOptions.map((issue) => (
                  <option key={issue.key} value={issue.key}>
                    {issue.label}
                  </option>
                ))
              ) : (
                <option value="">No detected conflicts yet</option>
              )}
            </select>
            {errors.issueKey && <p className="mt-2 text-sm text-rose-700">{errors.issueKey}</p>}
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Issue type</label>
              <select name="issueType" value={formData.issueType} onChange={handleChange} className="select-field">
                <option value="Same-Day Conflict">Same-Day Conflict</option>
                <option value="Daily Overload">Daily Overload</option>
                <option value="Schedule Warning">Schedule Warning</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Issue date</label>
              <div className="relative">
                <input
                  type="text"
                  value={formatPreviewDateTime(formData.issueDate)}
                  readOnly
                  className="input-field cursor-not-allowed bg-slate-100 pr-14 text-slate-600"
                  aria-label="Issue date"
                />
                <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200 text-slate-600">
                  <CalendarDays className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-500">This date is filled automatically from the selected conflict and stays fixed for accuracy.</p>
              {errors.issueDate && <p className="mt-2 text-sm text-rose-700">{errors.issueDate}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Resolution status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="select-field">
                <option value="Reviewed">Reviewed</option>
                <option value="Resolved">Resolved</option>
                <option value="Ignored">Ignored</option>
                <option value="Needs Follow-Up">Needs Follow-Up</option>
              </select>
              {errors.status && <p className="mt-2 text-sm text-rose-700">{errors.status}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Resolution action</label>
              <select name="action" value={formData.action} onChange={handleChange} className="select-field">
                <option value="Reschedule">Reschedule</option>
                <option value="Reduce workload">Reduce workload</option>
                <option value="Split into smaller tasks">Split into smaller tasks</option>
                <option value="Keep as planned">Keep as planned</option>
                <option value="Ask for extension">Ask for extension</option>
              </select>
              {errors.action && <p className="mt-2 text-sm text-rose-700">{errors.action}</p>}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Suggested new date</label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="relative">
                <input
                  ref={suggestedDateRef}
                  type="date"
                  value={getDatePart(formData.suggestedDate)}
                  onChange={(e) => handleDateTimePartChange('suggestedDate', 'date', e.target.value)}
                  className="input-field pr-14"
                  aria-label="Suggested new date"
                />
                <button
                  type="button"
                  onClick={() => openNativePicker(suggestedDateRef)}
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                  aria-label="Open suggested date picker"
                >
                  <CalendarDays className="h-4 w-4" />
                </button>
              </div>
              <div className="relative">
                <input
                  ref={suggestedTimeRef}
                  type="time"
                  value={getTimePart(formData.suggestedDate)}
                  onChange={(e) => handleDateTimePartChange('suggestedDate', 'time', e.target.value)}
                  className="input-field pr-14"
                  aria-label="Suggested new time"
                />
                <button
                  type="button"
                  onClick={() => openNativePicker(suggestedTimeRef)}
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                  aria-label="Open suggested time picker"
                >
                  <Clock3 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-500">Pick a realistic replacement slot if you plan to move the work to another date.</p>
            {errors.suggestedDate && <p className="mt-2 text-sm text-rose-700">{errors.suggestedDate}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Resolution note</label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleChange}
              rows="4"
              className="input-field"
              placeholder="Explain how you plan to handle this collision or why you accepted the risk."
            />
            {errors.note && <p className="mt-2 text-sm text-rose-700">{errors.note}</p>}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="submit" className="primary-btn">
              <Save className="h-4 w-4" />
              {editingId ? 'Update Resolution' : 'Save Resolution'}
            </button>
            <button type="button" onClick={resetForm} className="secondary-btn">
              Reset Form
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-6">
        <div className="surface-card p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <CheckCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Saved Resolutions</h3>
              <p className="text-sm text-slate-500">A simple record of your decisions for current conflicts.</p>
            </div>
          </div>

          {savedResolutions.length === 0 ? (
            listLoading ? (
              <div className="soft-card p-4 text-sm text-slate-500">Loading saved resolutions...</div>
            ) : (
            <div className="soft-card p-4 text-sm text-slate-500">
              No resolution records yet. Save a response for a conflict to show problem solving and decision tracking.
            </div>
            )
          ) : (
            <div className="space-y-3">
              {savedResolutions.map((resolution) => (
                <div key={resolution._id} className="soft-card p-4">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="data-pill data-pill-accent">{resolution.issueType}</span>
                    <span className="data-pill data-pill-neutral">{resolution.status}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{resolution.action}</p>
                  <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {resolution.issueDate
                      ? new Date(resolution.issueDate).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'No issue date'}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">{resolution.note || 'No note added.'}</p>
                  {resolution.suggestedDate && (
                    <p className="mt-2 text-xs font-medium text-slate-700">
                      Suggested move:{' '}
                      {new Date(resolution.suggestedDate).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={() => handleEdit(resolution)} className="secondary-btn px-4 py-2">
                      Edit
                    </button>
                    <button type="button" onClick={() => handleDelete(resolution._id)} className="danger-btn px-4 py-2">
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="alert-info">
          <p className="text-sm">
            <span className="font-semibold">Why this helps:</span> this form turns the analysis page into an action page, which makes the feature closer to real CRUD and stronger for demonstrations or marking.
          </p>
        </div>
      </div>
    </div>
  );
};

ConflictResolutionPanel.propTypes = {
  analysis: PropTypes.shape({
    collisions: PropTypes.array,
    heavyDays: PropTypes.array,
  }),
};

export default ConflictResolutionPanel;
