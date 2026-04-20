import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, CalendarDays, Clock3, Search, Shield, UserCircle2, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { taskAPI } from '../services/api';

const AppHeader = () => {
  const { user } = useContext(AuthContext);
  const { unreadCount } = useContext(NotificationContext);
  const navigate = useNavigate();
  const location = useLocation();
  const searchPanelRef = useRef(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tasks, setTasks] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const todayLabel = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setSearchLoading(true);
        const response = await taskAPI.getTasks();
        setTasks(response.data.tasks || []);
      } catch (error) {
        setTasks([]);
      } finally {
        setSearchLoading(false);
      }
    };

    loadTasks();
  }, []);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (searchPanelRef.current && !searchPanelRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const pageLinks = [
    { label: 'Dashboard', path: '/dashboard', keywords: 'home overview dashboard' },
    { label: 'My Tasks', path: '/tasks', keywords: 'tasks assignments list work' },
    { label: 'Analytics', path: '/analytics', keywords: 'analytics reports insights charts' },
    { label: 'Collision Analysis', path: '/collision-analysis', keywords: 'collision deadlines conflict warning' },
    { label: 'Burnout Analysis', path: '/burnout-analysis', keywords: 'burnout stress health workload' },
    { label: 'Notifications', path: '/notifications', keywords: 'notifications alerts reminders messages' },
    { label: 'Settings', path: '/settings', keywords: 'settings preferences config' },
    { label: 'Profile', path: '/profile', keywords: 'profile account user' },
  ];

  const filteredPages = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return pageLinks.slice(0, 4);
    }

    return pageLinks.filter((item) =>
      `${item.label} ${item.keywords}`.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const filteredTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return tasks
        .filter((task) => task.status !== 'Completed')
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        .slice(0, 4);
    }

    return tasks
      .filter((task) =>
        [task.title, task.module, task.moduleCode, task.type]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query))
      )
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 5);
  }, [searchQuery, tasks]);

  const handleOpenSearch = () => {
    setSearchOpen(true);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setSearchOpen(false);
    setSearchQuery('');
  };

  const formatDeadline = (value) =>
    new Date(value).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

  return (
    <header className="app-header">
      <button
        type="button"
        onClick={() => navigate('/dashboard')}
        className="flex min-w-0 items-center gap-3 pl-12 text-left md:w-72 md:flex-none md:pl-0"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#6c94a3_0%,#8bb0bc_100%)] text-white shadow-[0_14px_30px_rgba(12,20,24,0.2)]">
          <Shield className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-white">ClashGuard</p>
          <p className="truncate text-xs uppercase tracking-[0.24em] text-slate-300">Student Planner</p>
        </div>
      </button>

      <div className="hidden min-w-0 flex-1 px-4 lg:block">
        <div className="relative mx-auto max-w-2xl">
          <button
            type="button"
            onClick={handleOpenSearch}
            className="flex w-full items-center gap-3 rounded-3xl border border-white/10 bg-white/8 px-4 py-3 text-left text-slate-100 transition hover:bg-white/12"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-white">
              <Search className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">Search tasks, pages, modules</p>
              <p className="truncate text-xs text-slate-300">Today is {todayLabel}</p>
            </div>
            <span className="rounded-xl border border-white/10 bg-white/8 px-3 py-1 text-xs font-semibold text-slate-200">
              Quick Find
            </span>
          </button>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:w-72 sm:flex-none sm:justify-end sm:gap-3">
        <button
          type="button"
          onClick={handleOpenSearch}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-slate-100 transition hover:bg-white/14 lg:hidden"
          aria-label="Open search"
        >
          <Search className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => navigate('/notifications')}
          className={`relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 text-slate-100 transition ${
            location.pathname === '/notifications' ? 'bg-white/18' : 'bg-white/8 hover:bg-white/14'
          }`}
          aria-label="Open notifications page"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className={`flex items-center gap-3 rounded-2xl border border-white/10 bg-white/8 px-3 py-2 shadow-sm transition hover:bg-white/14 ${
            location.pathname === '/profile' ? 'bg-white/18' : ''
          }`}
          aria-label="Open profile page"
        >
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-white">{user?.name || 'Student'}</p>
            <p className="text-xs text-slate-300">{user?.role || 'Academic account'}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#6b95a4_0%,#8db4c0_100%)] text-white">
            {user?.profileImage ? (
              <img src={user.profileImage} alt="Profile" className="h-full w-full object-cover" />
            ) : user?.name ? (
              <span className="text-sm font-bold">{user.name.charAt(0).toUpperCase()}</span>
            ) : (
              <UserCircle2 className="h-5 w-5" />
            )}
          </div>
        </button>
      </div>

      {searchOpen && (
        <div className="fixed inset-x-0 top-22 z-70 px-4 sm:px-6 lg:px-8" ref={searchPanelRef}>
          <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_28px_70px_rgba(15,23,42,0.2)]">
            <div className="border-b border-slate-200 p-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tasks, modules, pages..."
                  className="input-with-icon pr-12"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-4 top-3.5 text-slate-400 transition hover:text-slate-700"
                  aria-label="Close search"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-0 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="border-b border-slate-200 p-4 lg:border-b-0 lg:border-r">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Quick Navigation</p>
                <div className="space-y-2">
                  {filteredPages.map((item) => (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => handleNavigate(item.path)}
                      className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:border-slate-300 hover:bg-slate-100"
                    >
                      <span className="font-semibold text-slate-800">{item.label}</span>
                      <span className="text-xs text-slate-400">Open</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Matching Tasks</p>
                {searchLoading ? (
                  <div className="soft-card p-4 text-sm text-slate-500">Loading tasks...</div>
                ) : filteredTasks.length === 0 ? (
                  <div className="soft-card p-4 text-sm text-slate-500">No matching tasks found.</div>
                ) : (
                  <div className="space-y-2">
                    {filteredTasks.map((task) => (
                      <button
                        key={task._id}
                        type="button"
                        onClick={() => handleNavigate('/tasks')}
                        className="flex w-full items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-slate-300 hover:bg-slate-50"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">{task.title}</p>
                          <p className="mt-1 truncate text-sm text-slate-500">{task.module}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="flex items-center justify-end gap-1 text-xs text-slate-500">
                            <Clock3 className="h-3.5 w-3.5" />
                            {formatDeadline(task.deadline)}
                          </div>
                          <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                            {task.status}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default AppHeader;
