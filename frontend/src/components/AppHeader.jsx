import { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, CalendarDays, Search, UserCircle2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';

const AppHeader = () => {
  const { user } = useContext(AuthContext);
  const { unreadCount } = useContext(NotificationContext);
  const navigate = useNavigate();
  const location = useLocation();
  const todayLabel = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return (
    <header className="app-header">
      <div className="flex min-w-0 items-center gap-3 pl-12 md:pl-0">
        <div className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[linear-gradient(135deg,_#6c94a3_0%,_#8bb0bc_100%)] text-white shadow-[0_14px_30px_rgba(12,20,24,0.2)] sm:flex">
          <CalendarDays className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">Student Workspace</p>
          <p className="truncate text-xs text-slate-300">{todayLabel}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/8 px-4 py-2.5 text-sm font-medium text-slate-100 transition hover:bg-white/14 sm:inline-flex">
          <Search className="h-4 w-4" />
          Search
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
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/8 px-3 py-2 shadow-sm">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-white">{user?.name || 'Student'}</p>
            <p className="text-xs text-slate-300">{user?.role || 'Academic account'}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-[linear-gradient(135deg,_#6b95a4_0%,_#8db4c0_100%)] text-white">
            {user?.name ? (
              <span className="text-sm font-bold">{user.name.charAt(0).toUpperCase()}</span>
            ) : (
              <UserCircle2 className="h-5 w-5" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
