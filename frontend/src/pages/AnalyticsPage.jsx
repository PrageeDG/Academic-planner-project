import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock3,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import AppHeader from '../components/AppHeader';
import AcademicHeatmap from '../components/AcademicHeatmap';
import StressAnalyticsDashboard from '../components/StressAnalyticsDashboard';
import WeeklyWorkloadCard from '../components/WeeklyWorkloadCard';
import { burnoutAPI, collisionAPI, taskAPI } from '../services/api';
import { formatShortDate, getDaysUntil } from '../utils/dashboardHelpers';

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tasks, setTasks] = useState([]);
  const [burnoutAnalysis, setBurnoutAnalysis] = useState(null);
  const [collisionAnalysis, setCollisionAnalysis] = useState(null);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError('');

      const [tasksResult, burnoutResult, collisionResult] = await Promise.all([
        taskAPI.getTasks(),
        burnoutAPI.analyzeBurnout(),
        collisionAPI.analyzeCollisions(),
      ]);

      setTasks(tasksResult.data.tasks || []);
      setBurnoutAnalysis(burnoutResult.data);
      setCollisionAnalysis(collisionResult.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const taskStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.status === 'Completed').length;
    const overdue = tasks.filter((task) => task.status === 'Overdue').length;
    const active = tasks.filter((task) => task.status !== 'Completed');
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const averageProgress =
      tasks.length > 0
        ? Math.round(tasks.reduce((sum, task) => sum + (task.progress || 0), 0) / tasks.length)
        : 0;

    return {
      total,
      completed,
      overdue,
      active,
      completionRate,
      averageProgress,
    };
  }, [tasks]);

  const moduleBreakdown = useMemo(() => {
    const moduleMap = new Map();

    tasks.forEach((task) => {
      const existing = moduleMap.get(task.module) || {
        module: task.module,
        count: 0,
        workloadHours: 0,
        completed: 0,
      };

      existing.count += 1;
      existing.workloadHours += task.workloadHours || 0;
      if (task.status === 'Completed') {
        existing.completed += 1;
      }

      moduleMap.set(task.module, existing);
    });

    return Array.from(moduleMap.values())
      .sort((a, b) => b.workloadHours - a.workloadHours)
      .slice(0, 6);
  }, [tasks]);

  const timelineTasks = useMemo(() => {
    return [...tasks]
      .filter((task) => task.status !== 'Completed')
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 6);
  }, [tasks]);

  const planItems = useMemo(() => {
    const items = [];

    if ((collisionAnalysis?.collisions?.length || 0) > 0) {
      items.push({
        title: 'Resolve same-day deadline conflicts',
        description: `You have ${collisionAnalysis.collisions.length} day(s) with 3 or more deadlines. Move or split at least one task from the busiest day.`,
        tone: 'warning',
      });
    }

    if ((burnoutAnalysis?.weeklyLoad || 0) > 25) {
      items.push({
        title: 'Reduce this week’s workload',
        description: `Current weekly load is ${burnoutAnalysis.weeklyLoad}h. Aim to bring it closer to the 25h healthy range.`,
        tone: 'danger',
      });
    }

    if (taskStats.overdue > 0) {
      items.push({
        title: 'Clear overdue tasks first',
        description: `${taskStats.overdue} overdue task${taskStats.overdue === 1 ? '' : 's'} need immediate attention before starting new work.`,
        tone: 'danger',
      });
    }

    if (taskStats.averageProgress < 50 && taskStats.active.length > 0) {
      items.push({
        title: 'Increase progress on active tasks',
        description: `Average progress is ${taskStats.averageProgress}%. Focus on finishing high-priority tasks already in progress.`,
        tone: 'info',
      });
    }

    if (items.length === 0) {
      items.push({
        title: 'Keep your current study rhythm',
        description: 'Your analytics look balanced. Maintain your current pacing and refresh this page when deadlines change.',
        tone: 'info',
      });
    }

    return items.slice(0, 4);
  }, [burnoutAnalysis, collisionAnalysis, taskStats]);

  const planToneClasses = {
    danger: 'alert-danger',
    warning: 'alert-warning',
    info: 'alert-info',
  };

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="app-main">
        <AppHeader />
        <div className="page-body">
          <div className="page-shell space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="flex items-center gap-3 text-3xl font-semibold text-slate-900">
                  <BarChart3 className="h-8 w-8 text-slate-700" />
                  Analytics
                </h1>
                <p className="section-subtitle mt-2">
                  Real academic insights from your tasks, workload, progress, burnout risk, and collision data.
                </p>
              </div>

              <button onClick={loadAnalytics} disabled={loading} className="secondary-btn self-start">
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                Refresh Analytics
              </button>
            </div>

            {loading && (
              <div className="flex justify-center py-20">
                <div className="surface-card p-8 text-center">
                  <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-700"></div>
                  <p className="text-slate-500">Building your analytics view...</p>
                </div>
              </div>
            )}

            {error && !loading && (
              <div className="alert-danger text-center">
                <AlertTriangle className="mx-auto mb-3 h-12 w-12" />
                <p className="font-medium">{error}</p>
                <button onClick={loadAnalytics} className="secondary-btn mt-4">Try Again</button>
              </div>
            )}

            {!loading && !error && (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {[
                    {
                      label: 'Completion Rate',
                      value: `${taskStats.completionRate}%`,
                      subtext: `${taskStats.completed} of ${taskStats.total} tasks completed`,
                      icon: CheckCircle2,
                    },
                    {
                      label: 'Average Progress',
                      value: `${taskStats.averageProgress}%`,
                      subtext: 'Across all created tasks',
                      icon: TrendingUp,
                    },
                    {
                      label: 'Weekly Load',
                      value: `${burnoutAnalysis?.weeklyLoad || 0}h`,
                      subtext: 'Current week workload',
                      icon: Clock3,
                    },
                    {
                      label: 'Collision Warnings',
                      value: collisionAnalysis?.warnings?.length || 0,
                      subtext: 'Live scheduling alerts',
                      icon: AlertTriangle,
                    },
                  ].map((item) => (
                    <div key={item.label} className="surface-card p-6">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                        <item.icon className="h-6 w-6" />
                      </div>
                      <p className="text-sm text-slate-500">{item.label}</p>
                      <p className="mt-1 text-3xl font-semibold text-slate-900">{item.value}</p>
                      <p className="mt-2 text-xs text-slate-500">{item.subtext}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                  <div className="xl:col-span-2">
                    <StressAnalyticsDashboard analysis={burnoutAnalysis} />
                  </div>
                  <div>
                    <WeeklyWorkloadCard analysis={collisionAnalysis} />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                  <div className="surface-card p-6">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">Top Modules By Workload</h3>
                        <p className="text-sm text-slate-500">See where most of your time is going right now.</p>
                      </div>
                    </div>

                    {moduleBreakdown.length === 0 ? (
                      <div className="soft-card p-4 text-sm text-slate-500">No module data yet. Add tasks to populate analytics.</div>
                    ) : (
                      <div className="space-y-4">
                        {moduleBreakdown.map((item) => {
                          const maxHours = moduleBreakdown[0]?.workloadHours || 1;
                          const completion = item.count > 0 ? Math.round((item.completed / item.count) * 100) : 0;

                          return (
                            <div key={item.module} className="soft-card p-4">
                              <div className="mb-2 flex items-center justify-between gap-3">
                                <p className="font-semibold text-slate-900">{item.module}</p>
                                <span className="data-pill data-pill-accent">{item.workloadHours}h</span>
                              </div>
                              <div className="mb-2 h-2 overflow-hidden rounded-full bg-slate-200">
                                <div
                                  className="h-full rounded-full bg-slate-700"
                                  style={{ width: `${Math.max(12, (item.workloadHours / maxHours) * 100)}%` }}
                                ></div>
                              </div>
                              <div className="flex items-center justify-between text-xs text-slate-500">
                                <span>{item.count} task{item.count === 1 ? '' : 's'}</span>
                                <span>{completion}% completed</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="surface-card p-6">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                        <Clock3 className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">Upcoming Priority Timeline</h3>
                        <p className="text-sm text-slate-500">The next active tasks that deserve your attention.</p>
                      </div>
                    </div>

                    {timelineTasks.length === 0 ? (
                      <div className="soft-card p-4 text-sm text-slate-500">No active tasks right now. Your timeline is clear.</div>
                    ) : (
                      <div className="space-y-3">
                        {timelineTasks.map((task) => {
                          const days = getDaysUntil(task.deadline);
                          const toneClass =
                            days < 0 || task.status === 'Overdue'
                              ? 'data-pill data-pill-danger'
                              : days <= 3
                              ? 'data-pill data-pill-warning'
                              : 'data-pill data-pill-neutral';

                          return (
                            <div key={task._id} className="soft-card p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-semibold text-slate-900">{task.title}</p>
                                  <p className="mt-1 text-sm text-slate-500">{task.module}</p>
                                </div>
                                <span className={toneClass}>
                                  {days < 0 ? `Overdue ${Math.abs(days)}d` : days === 0 ? 'Today' : `${days}d left`}
                                </span>
                              </div>
                              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                <span>Due {formatShortDate(task.deadline)}</span>
                                <span className="rounded-full bg-slate-200 px-2 py-1 text-slate-600">{task.type}</span>
                                <span className="rounded-full bg-slate-200 px-2 py-1 text-slate-600">{task.priority}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <AcademicHeatmap
                  heavyDays={
                    burnoutAnalysis?.heavyDays?.map((day) => ({
                      date: day.date,
                      hours: day.hours,
                    })) || []
                  }
                />

                <div className="surface-card p-6">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">Best Plan Right Now</h3>
                      <p className="text-sm text-slate-500">A focused action plan generated from your live analytics.</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {planItems.map((item) => (
                      <div key={item.title} className={planToneClasses[item.tone] || 'alert-info'}>
                        <p className="font-semibold">{item.title}</p>
                        <p className="mt-1 text-sm">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AnalyticsPage;
