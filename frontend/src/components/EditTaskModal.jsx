import { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { taskAPI } from '../services/api';

const EditTaskModal = ({ task, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: task.title,
    module: task.module,
    type: task.type,
    priority: task.priority,
    deadline: new Date(task.deadline).toISOString().slice(0, 16),
    workloadHours: task.workloadHours,
    status: task.status,
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (formData.status !== 'Completed') {
        const deadline = new Date(formData.deadline);
        if (deadline < new Date()) {
          setError('Deadline must be a future date for pending tasks');
          setLoading(false);
          return;
        }
      }

      const hours = parseInt(formData.workloadHours);
      if (hours < 1 || hours > 48) {
        setError('Workload hours must be between 1 and 48');
        setLoading(false);
        return;
      }

      const response = await taskAPI.updateTask(task._id, formData);
      onUpdate(response.data.task);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-sm">
      <div className="surface-card max-h-[90vh] w-full max-w-2xl overflow-y-auto p-8 animate-scale-in">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">Edit Task</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="alert-danger mb-6 flex items-center gap-3">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Task Title *</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required className="input-field" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Module Name *</label>
            <input type="text" name="module" value={formData.module} onChange={handleChange} required className="input-field" />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Task Type *</label>
              <select name="type" value={formData.type} onChange={handleChange} required className="select-field">
                <option value="Assignment">Assignment</option>
                <option value="Exam">Exam</option>
                <option value="Quiz">Quiz</option>
                <option value="Presentation">Presentation</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Priority *</label>
              <select name="priority" value={formData.priority} onChange={handleChange} required className="select-field">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Deadline *</label>
              <input type="datetime-local" name="deadline" value={formData.deadline} onChange={handleChange} required className="input-field" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Workload (Hours) *</label>
              <input type="number" name="workloadHours" value={formData.workloadHours} onChange={handleChange} required min="1" max="48" className="input-field" />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Status *</label>
            <select name="status" value={formData.status} onChange={handleChange} required className="select-field">
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>

          <div className="flex flex-col gap-4 pt-4 sm:flex-row">
            <button type="submit" disabled={loading} className="primary-btn flex-1">
              <Save className="h-5 w-5" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>

            <button type="button" onClick={onClose} disabled={loading} className="secondary-btn">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;
