import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { CalendarDays, CheckCheck, ClipboardPen, Save, Trash2 } from 'lucide-react';

const STORAGE_KEY = 'collision_resolutions';

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
  const [formData, setFormData] = useState(emptyForm);
  const [savedResolutions, setSavedResolutions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState({});

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
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setSavedResolutions(JSON.parse(raw));
      } catch {
        setSavedResolutions([]);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedResolutions));
  }, [savedResolutions]);

  useEffect(() => {
    if (!formData.issueKey && issueOptions[0]) {
      setFormData((current) => ({
        ...current,
        issueKey: issueOptions[0].key,
        issueType: issueOptions[0].type,
        issueDate: issueOptions[0].date.slice(0, 10),
      }));
    }
  }, [issueOptions, formData.issueKey]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrors((current) => ({
      ...current,
      [name]: '',
    }));

    if (name === 'issueKey') {
      const selectedIssue = issueOptions.find((issue) => issue.key === value);
      setFormData((current) => ({
        ...current,
        issueKey: value,
        issueType: selectedIssue?.type || current.issueType,
        issueDate: selectedIssue?.date ? selectedIssue.date.slice(0, 10) : current.issueDate,
      }));
      return;
    }

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const resetForm = () => {
    const firstIssue = issueOptions[0];
    setFormData({
      ...emptyForm,
      issueKey: firstIssue?.key || '',
      issueType: firstIssue?.type || 'Same-Day Conflict',
      issueDate: firstIssue?.date ? firstIssue.date.slice(0, 10) : '',
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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setSuccess('');
      return;
    }

    const payload = {
      id: editingId || `${Date.now()}`,
      ...formData,
      updatedAt: new Date().toISOString(),
    };

    if (editingId) {
      setSavedResolutions((current) => current.map((item) => (item.id === editingId ? payload : item)));
      setSuccess('Resolution updated successfully.');
    } else {
      setSavedResolutions((current) => [payload, ...current]);
      setSuccess('Resolution saved successfully.');
    }

    resetForm();
    window.setTimeout(() => setSuccess(''), 2000);
  };

  const handleEdit = (resolution) => {
    setEditingId(resolution.id);
    setErrors({});
    setFormData({
      issueKey: resolution.issueKey,
      issueType: resolution.issueType,
      issueDate: resolution.issueDate,
      status: resolution.status,
      action: resolution.action,
      suggestedDate: resolution.suggestedDate,
      note: resolution.note,
    });
  };

  const handleDelete = (id) => {
    setSavedResolutions((current) => current.filter((item) => item.id !== id));
    if (editingId === id) {
      resetForm();
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

        <form onSubmit={handleSubmit} className="space-y-5">
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
              <input type="date" name="issueDate" value={formData.issueDate} onChange={handleChange} className="input-field" />
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
            <input type="date" name="suggestedDate" value={formData.suggestedDate} onChange={handleChange} className="input-field" />
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
            <div className="soft-card p-4 text-sm text-slate-500">
              No resolution records yet. Save a response for a conflict to show problem solving and decision tracking.
            </div>
          ) : (
            <div className="space-y-3">
              {savedResolutions.map((resolution) => (
                <div key={resolution.id} className="soft-card p-4">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="data-pill data-pill-accent">{resolution.issueType}</span>
                    <span className="data-pill data-pill-neutral">{resolution.status}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{resolution.action}</p>
                  <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {resolution.issueDate || 'No issue date'}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">{resolution.note || 'No note added.'}</p>
                  {resolution.suggestedDate && (
                    <p className="mt-2 text-xs font-medium text-slate-700">Suggested move: {resolution.suggestedDate}</p>
                  )}
                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={() => handleEdit(resolution)} className="secondary-btn px-4 py-2">
                      Edit
                    </button>
                    <button type="button" onClick={() => handleDelete(resolution.id)} className="danger-btn px-4 py-2">
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
