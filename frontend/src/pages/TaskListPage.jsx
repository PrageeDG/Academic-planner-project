import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, Clock, Trash2, Edit2, Filter, AlertCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import AppHeader from '../components/AppHeader';
import EditTaskModal from '../components/EditTaskModal';
import { taskAPI } from '../services/api';

const TaskListPage = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [editingTask, setEditingTask] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    filterTasksByStatus();
  }, [tasks, filterStatus]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await taskAPI.getTasks();
      setTasks(response.data.tasks);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const filterTasksByStatus = () => {
    if (filterStatus === 'All') {
      setFilteredTasks(tasks);
    } else {
      setFilteredTasks(tasks.filter((task) => task.status === filterStatus));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await taskAPI.deleteTask(id);
      setTasks(tasks.filter((task) => task._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowEditModal(true);
  };

  const handleUpdateTask = (updatedTask) => {
    setTasks(tasks.map((task) => (task._id === updatedTask._id ? updatedTask : task)));
    setShowEditModal(false);
    setEditingTask(null);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'data-pill data-pill-danger';
      case 'Medium':
        return 'data-pill data-pill-warning';
      case 'Low':
        return 'data-pill data-pill-success';
      default:
        return 'data-pill data-pill-neutral';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'data-pill data-pill-success';
      case 'Overdue':
        return 'data-pill data-pill-danger';
      case 'Pending':
        return 'data-pill data-pill-accent';
      default:
        return 'data-pill data-pill-neutral';
    }
  };

  const getTimeRemaining = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate - now;

    if (diff < 0) return 'Overdue';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'Pending').length,
    completed: tasks.filter((t) => t.status === 'Completed').length,
    overdue: tasks.filter((t) => t.status === 'Overdue').length,
  };

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="app-main">
        <AppHeader />
        <div className="page-body">
        <div className="page-shell">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="section-title">My Tasks</h1>
              <p className="section-subtitle mt-2">Manage academic deadlines using one clear, low-distraction layout.</p>
            </div>
            <button onClick={() => navigate('/tasks/add')} className="primary-btn w-full md:w-auto">
              <Plus className="h-5 w-5" />
              Add New Task
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Total Tasks', value: stats.total, icon: Calendar },
              { label: 'Pending', value: stats.pending, icon: Clock },
              { label: 'Completed', value: stats.completed, icon: Calendar },
              { label: 'Overdue', value: stats.overdue, icon: AlertCircle },
            ].map((stat) => (
              <div key={stat.label} className="surface-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{stat.label}</p>
                    <p className="mt-1 text-3xl font-semibold text-slate-900">{stat.value}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Filter className="h-5 w-5 text-slate-500" />
            <div className="flex flex-wrap gap-2">
              {['All', 'Pending', 'Completed', 'Overdue'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`filter-btn ${filterStatus === status ? 'filter-btn-active' : ''}`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="alert-danger flex items-center gap-3">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}

          {loading ? (
            <div className="surface-card p-12 text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-700"></div>
              <p className="text-lg text-slate-500">Loading tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="surface-card p-12 text-center">
              <Calendar className="mx-auto mb-4 h-16 w-16 text-slate-300" />
              <h3 className="text-xl font-semibold text-slate-700">No tasks found</h3>
              <p className="mt-2 text-slate-500">Start by adding your first task.</p>
            </div>
          ) : (
            <div className="surface-card overflow-hidden">
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full">
                  <thead className="border-b border-slate-200 bg-slate-50/80">
                    <tr>
                      {['Title', 'Module', 'Type', 'Deadline', 'Time Left', 'Workload', 'Priority', 'Status', 'Actions'].map((heading) => (
                        <th key={heading} className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.map((task) => (
                      <tr key={task._id} className="border-b border-slate-100 hover:bg-slate-50/80">
                        <td className="px-6 py-4 font-medium text-slate-900">{task.title}</td>
                        <td className="px-6 py-4 text-slate-600">{task.module}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{task.type}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{formatDate(task.deadline)}</td>
                        <td className={`px-6 py-4 text-sm font-medium ${task.status === 'Overdue' ? 'text-rose-700' : 'text-slate-700'}`}>
                          {getTimeRemaining(task.deadline)}
                        </td>
                        <td className="px-6 py-4 text-slate-600">{task.workloadHours}h</td>
                        <td className="px-6 py-4">
                          <span className={getPriorityColor(task.priority)}>{task.priority}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={getStatusColor(task.status)}>{task.status}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(task)}
                              className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-700 transition hover:bg-slate-100"
                              title="Edit"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(task._id)}
                              className="rounded-lg border border-rose-200 bg-rose-50 p-2 text-rose-700 transition hover:bg-rose-100"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-100 lg:hidden">
                {filteredTasks.map((task) => (
                  <div key={task._id} className="p-4">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">{task.title}</h3>
                        <p className="text-sm text-slate-500">{task.module}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(task)}
                          className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-700 transition hover:bg-slate-100"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(task._id)}
                          className="rounded-lg border border-rose-200 bg-rose-50 p-2 text-rose-700 transition hover:bg-rose-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-slate-500">Type:</span>
                        <span className="ml-2 text-slate-700">{task.type}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Workload:</span>
                        <span className="ml-2 text-slate-700">{task.workloadHours}h</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Deadline:</span>
                        <span className="ml-2 text-slate-700">{formatDate(task.deadline)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Time Left:</span>
                        <span className={`ml-2 font-medium ${task.status === 'Overdue' ? 'text-rose-700' : 'text-slate-700'}`}>
                          {getTimeRemaining(task.deadline)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <span className={getPriorityColor(task.priority)}>{task.priority}</span>
                      <span className={getStatusColor(task.status)}>{task.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        </div>
      </main>

      {showEditModal && editingTask && (
        <EditTaskModal
          task={editingTask}
          onClose={() => {
            setShowEditModal(false);
            setEditingTask(null);
          }}
          onUpdate={handleUpdateTask}
        />
      )}
    </div>
  );
};

export default TaskListPage;
