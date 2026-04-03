import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, Clock, Filter, AlertCircle, ClipboardList, CheckCircle2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import AppHeader from '../components/AppHeader';
import EditTaskModal from '../components/EditTaskModal';
import TaskCard from '../components/TaskCard';
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
    if (filterStatus === 'All') {
      setFilteredTasks(tasks);
    } else {
      setFilteredTasks(tasks.filter((task) => task.status === filterStatus));
    }
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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await taskAPI.deleteTask(id);
      setTasks((current) => current.filter((task) => task._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowEditModal(true);
  };

  const handleUpdateTask = (updatedTask) => {
    setTasks((current) => current.map((task) => (task._id === updatedTask._id ? updatedTask : task)));
    setShowEditModal(false);
    setEditingTask(null);
  };

  const handleToggleComplete = async (task) => {
    try {
      const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
      const nextProgress = nextStatus === 'Completed' ? 100 : task.progress === 100 ? 0 : task.progress ?? 0;
      const response = await taskAPI.updateTask(task._id, {
        status: nextStatus,
        progress: nextProgress,
      });
      setTasks((current) => current.map((item) => (item._id === task._id ? response.data.task : item)));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update task status');
    }
  };

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'Pending').length,
    inProgress: tasks.filter((t) => t.status === 'In Progress').length,
    completed: tasks.filter((t) => t.status === 'Completed').length,
    overdue: tasks.filter((t) => t.status === 'Overdue').length,
  };

  const filterOptions = ['All', 'Pending', 'In Progress', 'Completed', 'Overdue'];

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
                <p className="section-subtitle mt-2">Track deadlines, workload, notes, reminders, and progress in one student-friendly view.</p>
              </div>
              <button onClick={() => navigate('/tasks/add')} className="primary-btn w-full md:w-auto">
                <Plus className="h-5 w-5" />
                Add New Task
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {[
                { label: 'Total Tasks', value: stats.total, icon: ClipboardList },
                { label: 'Pending', value: stats.pending, icon: Clock },
                { label: 'In Progress', value: stats.inProgress, icon: Calendar },
                { label: 'Completed', value: stats.completed, icon: CheckCircle2 },
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

            <div className="surface-card p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2 text-slate-600">
                  <Filter className="h-5 w-5" />
                  <span className="text-sm font-medium">Filter by status</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.map((status) => (
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
                <ClipboardList className="mx-auto mb-4 h-16 w-16 text-slate-300" />
                <h3 className="text-xl font-semibold text-slate-700">No tasks found</h3>
                <p className="mt-2 text-slate-500">Try adding a task with notes, a reminder, and a progress target to build a stronger student dashboard.</p>
                <button onClick={() => navigate('/tasks/add')} className="primary-btn mt-6">
                  <Plus className="h-5 w-5" />
                  Create Your First Task
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTasks.map((task, index) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleComplete={handleToggleComplete}
                    initiallyExpanded={index === 0}
                  />
                ))}
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
