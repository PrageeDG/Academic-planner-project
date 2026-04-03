import { useContext, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Search,
  Target,
  TrendingUp,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import AppHeader from '../components/AppHeader';
import { AuthContext } from '../context/AuthContext';
import { burnoutAPI, collisionAPI, taskAPI } from '../services/api';
import {
  formatShortDate,
  getDeadlineMessage,
  getEndOfWeek,
  getPriorityPillClass,
  getStartOfDay,
} from '../utils/dashboardHelpers';

const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [collisionData, setCollisionData] = useState(null);
  const [burnoutData, setBurnoutData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const [tasksResult, collisionResult, burnoutResult] = await Promise.allSettled([
          taskAPI.getTasks(),
          collisionAPI.analyzeCollisions(),
          burnoutAPI.analyzeBurnout(),
        ]);

        if (tasksResult.status === 'fulfilled') {
          setTasks(tasksResult.value.data.tasks || []);
        }

        if (collisionResult.status === 'fulfilled') {
          setCollisionData(collisionResult.value.data);
        }

        if (burnoutResult.status === 'fulfilled') {
          setBurnoutData(burnoutResult.value.data);
        }

        if (
          tasksResult.status === 'rejected' &&
          collisionResult.status === 'rejected' &&
          burnoutResult.status === 'rejected'
        ) {
          setError('Failed to load dashboard data.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const activeTasks = useMemo(() => tasks.filter((task) => task.status !== 'Completed'), [tasks]);
  const completedTasks = useMemo(() => tasks.filter((task) => task.status === 'Completed'), [tasks]);
  const overdueTasks = useMemo(() => tasks.filter((task) => task.status === 'Overdue'), [tasks]);

  const dueThisWeek = useMemo(() => {
    const today = getStartOfDay();
    const endOfWeek = getEndOfWeek();

    return activeTasks.filter((task) => {
      const deadline = new Date(task.deadline);
      return deadline >= today && deadline <= endOfWeek;
    }).length;
  }, [activeTasks]);

  const healthScore = collisionData?.analysis?.healthScore ?? Math.max(0, 100 - (burnoutData?.riskScore || 0));

  const stats = [
    { icon: Calendar, label: 'Active Deadlines', value: activeTasks.length },
    { icon: AlertTriangle, label: 'Due This Week', value: dueThisWeek },
    { icon: CheckCircle2, label: 'Completed', value: completedTasks.length },
    { icon: TrendingUp, label: 'Health Score', value: `${healthScore}%` },
  ];

  const filteredDeadlines = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return activeTasks
      .filter((task) => {
        if (!query) return true;
        return [task.title, task.module, task.moduleCode, task.type]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query));
      })
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 6);
  }, [activeTasks, searchTerm]);

  const activityItems = useMemo(() => {
    const items = [];

    if (overdueTasks.length > 0) {
      items.push({
        icon: AlertTriangle,
        text: `${overdueTasks.length} overdue task${overdueTasks.length === 1 ? '' : 's'} need attention`,
        detail: 'Review urgent items first',
      });
    }

    if ((collisionData?.warnings || []).length > 0) {
      items.push({
        icon: AlertTriangle,
        text: collisionData.warnings[0].message,
        detail: 'Collision analysis update',
      });
    }

    if ((burnoutData?.weeklyLoad || 0) > 0) {
      items.push({
        icon: TrendingUp,
        text: `${burnoutData.weeklyLoad} workload hour${burnoutData.weeklyLoad === 1 ? '' : 's'} planned this week`,
        detail: `${burnoutData.riskLevel || 'Low'} burnout risk`,
      });
    }

    const reminderCount = activeTasks.filter((task) => task.reminderSet).length;
    if (reminderCount > 0) {
      items.push({
        icon: BookOpen,
        text: `${reminderCount} active reminder${reminderCount === 1 ? '' : 's'} enabled`,
        detail: 'Stay ahead of key submissions',
      });
    }

    if (items.length === 0 && activeTasks[0]) {
      items.push({
        icon: Clock,
        text: `${activeTasks[0].title} is your next active task`,
        detail: `Due ${formatShortDate(activeTasks[0].deadline)}`,
      });
    }

    return items.slice(0, 4);
  }, [activeTasks, burnoutData, collisionData, overdueTasks]);

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="app-main">
        <AppHeader />
        <div className="page-body">
          <div className="page-shell">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h1 className="section-title">Welcome back, {user?.name?.split(' ')[0] || 'Student'}</h1>
                <p className="section-subtitle mt-2">Your dashboard now reflects live tasks, workload pressure, and collision warnings from your account.</p>
              </div>
            </div>

            {error && <div className="alert-danger">{error}</div>}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="surface-card p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="mt-1 text-3xl font-semibold text-slate-900">
                    {loading ? '...' : stat.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="space-y-6 xl:col-span-2">
                <div className="surface-card p-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search deadlines, modules, task types..."
                      className="input-with-icon"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="flex items-center gap-3 text-2xl font-semibold text-slate-900">
                    <Calendar className="h-6 w-6 text-slate-700" />
                    Upcoming Deadlines
                  </h2>

                  {loading ? (
                    <div className="surface-card p-8 text-center text-slate-500">Loading upcoming deadlines...</div>
                  ) : filteredDeadlines.length === 0 ? (
                    <div className="surface-card p-8 text-center text-slate-500">
                      No matching active deadlines found. Try a different search or add a new task.
                    </div>
                  ) : (
                    filteredDeadlines.map((task) => (
                      <div key={task._id} className="surface-card p-6">
                        <div className="mb-4 flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-slate-900">{task.module}</h3>
                            <p className="mt-1 text-sm text-slate-500">{task.title}</p>
                          </div>
                          <span className={getPriorityPillClass(task.priority)}>{task.priority}</span>
                        </div>

                        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {getDeadlineMessage(task.deadline, task.status)}
                          </span>
                          <span className={`font-medium ${task.status === 'Overdue' ? 'text-rose-600' : 'text-slate-700'}`}>
                            Due {formatShortDate(task.deadline)}
                          </span>
                        </div>

                        <div className="mb-4 flex flex-wrap gap-2">
                          <span className="data-pill data-pill-neutral">{task.type}</span>
                          {task.moduleCode && <span className="data-pill data-pill-accent">{task.moduleCode}</span>}
                          <span className="data-pill data-pill-neutral">{task.status}</span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="text-slate-500">Progress</span>
                            <span className="text-slate-700">{task.progress ?? 0}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-full rounded-full bg-slate-700 transition-all duration-500"
                              style={{ width: `${task.progress ?? 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="surface-card p-6">
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                    <Target className="h-5 w-5 text-slate-700" />
                    Academic Profile
                  </h3>
                  <div className="space-y-3">
                    <div className="soft-card p-3">
                      <p className="text-xs text-slate-500">Faculty</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{user?.faculty || 'Not added yet'}</p>
                    </div>
                    <div className="soft-card p-3">
                      <p className="text-xs text-slate-500">Degree</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{user?.degree || 'Not added yet'}</p>
                    </div>
                    <div className="soft-card p-3">
                      <p className="text-xs text-slate-500">Year</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{user?.year ? `Year ${user.year}` : 'Not added yet'}</p>
                    </div>
                    <div className="alert-info">
                      <p className="text-xs font-medium">Live Study Snapshot</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {loading ? 'Loading...' : `${burnoutData?.weeklyLoad || 0}h this week • ${collisionData?.totalTasks || 0} active tasks`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="surface-card p-6">
                  <h3 className="mb-4 text-lg font-semibold text-slate-900">Recent Activity</h3>
                  <div className="space-y-3">
                    {loading ? (
                      <div className="soft-card p-4 text-sm text-slate-500">Loading recent activity...</div>
                    ) : activityItems.length === 0 ? (
                      <div className="soft-card p-4 text-sm text-slate-500">No activity yet. Add tasks to start building a live dashboard.</div>
                    ) : (
                      activityItems.map((item, index) => (
                        <div key={`${item.text}-${index}`} className="soft-card flex gap-3 p-3">
                          <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-slate-600" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-800">{item.text}</p>
                            <p className="mt-0.5 text-xs text-slate-500">{item.detail}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
