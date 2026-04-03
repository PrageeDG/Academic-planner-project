import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, BookOpen, AlertCircle, Plus } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import AppHeader from '../components/AppHeader';
import { taskAPI } from '../services/api';

const AddTaskPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    module: '',
    type: 'Assignment',
    priority: 'Medium',
    deadline: '',
    workloadHours: '',
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
    setSuccess('');
    setLoading(true);

    try {
      const deadline = new Date(formData.deadline);
      if (deadline < new Date()) {
        setError('Deadline must be a future date');
        setLoading(false);
        return;
      }

      const hours = parseInt(formData.workloadHours);
      if (hours < 1 || hours > 48) {
        setError('Workload hours must be between 1 and 48');
        setLoading(false);
        return;
      }

      await taskAPI.createTask(formData);
      setSuccess('Task created successfully!');
      setTimeout(() => {
        navigate('/tasks');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="app-main">
        <AppHeader />
        <div className="page-body">
        <div className="mx-auto max-w-4xl space-y-6">
          <div>
            <h1 className="section-title">Add New Task</h1>
            <p className="section-subtitle mt-2">Create academic tasks in the same soft and readable layout used throughout the project.</p>
          </div>

          <div className="surface-card p-6 md:p-8">
            {error && (
              <div className="alert-danger mb-6 flex items-center gap-3">
                <AlertCircle className="h-5 w-5" />
                {error}
              </div>
            )}

            {success && <div className="alert-success mb-6">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Task Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="e.g., Data Structures Assignment 3"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <BookOpen className="h-4 w-4" />
                  Module Name *
                </label>
                <input
                  type="text"
                  name="module"
                  value={formData.module}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="e.g., CS201 - Data Structures"
                />
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
                  <label className="mb-2 block text-sm font-medium text-slate-700">Priority Level *</label>
                  <select name="priority" value={formData.priority} onChange={handleChange} required className="select-field">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Calendar className="h-4 w-4" />
                    Deadline Date *
                  </label>
                  <input
                    type="datetime-local"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    required
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Clock className="h-4 w-4" />
                    Workload (Hours) *
                  </label>
                  <input
                    type="number"
                    name="workloadHours"
                    value={formData.workloadHours}
                    onChange={handleChange}
                    required
                    min="1"
                    max="48"
                    className="input-field"
                    placeholder="1-48"
                  />
                </div>
              </div>

              <div className="alert-info">
                <p className="text-sm">
                  <strong>Note:</strong> Deadline must be a future date and workload should be between 1-48 hours.
                </p>
              </div>

              <div className="flex flex-col gap-4 pt-4 sm:flex-row">
                <button type="submit" disabled={loading} className="primary-btn flex-1">
                  <Plus className="h-5 w-5" />
                  {loading ? 'Creating...' : 'Create Task'}
                </button>

                <button type="button" onClick={() => navigate('/tasks')} className="secondary-btn">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
        </div>
      </main>
    </div>
  );
};

export default AddTaskPage;
