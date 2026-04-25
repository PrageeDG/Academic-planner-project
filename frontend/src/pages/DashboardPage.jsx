import { useContext } from 'react';
import { Calendar, AlertTriangle, TrendingUp, CheckCircle2, Clock, Search, BookOpen, Target } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import AppHeader from '../components/AppHeader';
import { AuthContext } from '../context/AuthContext';

const DashboardPage = () => {
  const { user } = useContext(AuthContext);

  const stats = [
    { icon: Calendar, label: 'Active Deadlines', value: '8' },
    { icon: AlertTriangle, label: 'Due This Week', value: '3' },
    { icon: CheckCircle2, label: 'Completed', value: '12' },
    { icon: TrendingUp, label: 'Performance', value: '92%' },
  ];

  const deadlines = [
    { id: 1, course: 'Software Engineering', task: 'Project Phase 2 Submission', due: 'Mar 8', days: 7, progress: 45, priority: 'high' },
    { id: 2, course: 'Data Structures', task: 'AVL Tree Implementation', due: 'Mar 12', days: 11, progress: 70, priority: 'high' },
    { id: 3, course: 'Web Development', task: 'Full Stack Application', due: 'Mar 15', days: 14, progress: 30, priority: 'medium' },
    { id: 4, course: 'Database Design', task: 'Normalization Exercise', due: 'Mar 18', days: 17, progress: 85, priority: 'low' },
  ];

  const upcomingEvents = [
    { icon: BookOpen, text: 'Completed ML Assignment', time: '2h ago' },
    { icon: AlertTriangle, text: '3 deadlines next week', time: '5h ago' },
    { icon: TrendingUp, text: 'Strong project progress this week', time: '1d ago' },
  ];

  const getPriorityStyle = (priority) => {
    if (priority === 'high') return 'data-pill data-pill-danger';
    if (priority === 'medium') return 'data-pill data-pill-warning';
    return 'data-pill data-pill-success';
  };

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
              <p className="section-subtitle mt-2">Your deadlines, workload, and study rhythm are all in one calm dashboard.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat, i) => (
              <div key={i} className="surface-card p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  <stat.icon className="h-6 w-6" />
                </div>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="mt-1 text-3xl font-semibold text-slate-900">{stat.value}</p>
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
                    placeholder="Search deadlines, courses..."
                    className="input-with-icon"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="flex items-center gap-3 text-2xl font-semibold text-slate-900">
                  <Calendar className="h-6 w-6 text-slate-700" />
                  Upcoming Deadlines
                </h2>

                {deadlines.map((d) => (
                  <div key={d.id} className="surface-card p-6">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900">{d.course}</h3>
                        <p className="mt-1 text-sm text-slate-500">{d.task}</p>
                      </div>
                      <span className={getPriorityStyle(d.priority)}>{d.priority}</span>
                    </div>

                    <div className="mb-4 flex items-center justify-between text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" /> {d.days} days remaining
                      </span>
                      <span className="font-medium text-slate-700">Due {d.due}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-500">Progress</span>
                        <span className="text-slate-700">{d.progress}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-slate-700 transition-all duration-500"
                          style={{ width: `${d.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
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
                    <p className="mt-1 text-sm font-semibold text-slate-900">{user?.faculty || 'Computing'}</p>
                  </div>
                  <div className="soft-card p-3">
                    <p className="text-xs text-slate-500">Degree</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{user?.degree || 'BS Computer Science'}</p>
                  </div>
                  <div className="soft-card p-3">
                    <p className="text-xs text-slate-500">Year</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">Year {user?.year || '3'}</p>
                  </div>
                  <div className="alert-info">
                    <p className="text-xs font-medium">Current Semester</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">Semester 1 • 2026</p>
                  </div>
                </div>
              </div>

              <div className="surface-card p-6">
                <h3 className="mb-4 text-lg font-semibold text-slate-900">Recent Activity</h3>
                <div className="space-y-3">
                  {upcomingEvents.map((event, i) => (
                    <div key={i} className="soft-card flex gap-3 p-3">
                      <event.icon className="mt-0.5 h-5 w-5 shrink-0 text-slate-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800">{event.text}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{event.time}</p>
                      </div>
                    </div>
                  ))}
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
