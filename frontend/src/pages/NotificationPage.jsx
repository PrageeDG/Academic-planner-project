import { useContext, useMemo, useState } from 'react';
import { AlertTriangle, Bell, CheckCheck, MailOpen, RotateCw } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import AppHeader from '../components/AppHeader';
import { NotificationContext } from '../context/NotificationContext';

const NotificationPage = () => {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAllAsRead,
    markAsRead,
    markAsUnread,
    refreshNotifications,
  } = useContext(NotificationContext);
  const [activeFilter, setActiveFilter] = useState('Unread');

  const toneClasses = useMemo(
    () => ({
      danger: 'border-rose-200 bg-rose-50 text-rose-700',
      warning: 'border-amber-200 bg-amber-50 text-amber-700',
      info: 'border-sky-200 bg-sky-50 text-sky-700',
    }),
    []
  );

  const alertNotifications = useMemo(
    () => notifications.filter((item) => item.category === 'alert'),
    [notifications]
  );

  const unreadAlertCount = useMemo(
    () => alertNotifications.filter((item) => !item.read).length,
    [alertNotifications]
  );

  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'Unread') {
      return notifications.filter((item) => !item.read);
    }

    if (activeFilter === 'Read') {
      return notifications.filter((item) => item.read);
    }

    if (activeFilter === 'Alerts') {
      return notifications.filter((item) => item.category === 'alert');
    }

    return notifications;
  }, [activeFilter, notifications]);

  const filterOptions = [
    { label: 'Unread', value: 'Unread', count: unreadCount },
    { label: 'Alerts', value: 'Alerts', count: alertNotifications.length },
    { label: 'All', value: 'All', count: notifications.length },
    { label: 'Read', value: 'Read', count: notifications.length - unreadCount },
  ];

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="app-main">
        <AppHeader />
        <div className="page-body">
          <div className="page-shell space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="section-title">Notifications</h1>
                <p className="section-subtitle mt-2">
                  Review task reminders, deadline alerts, and collision warnings in one place.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={refreshNotifications} className="secondary-btn">
                  <RotateCw className="h-4 w-4" />
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="primary-btn"
                  disabled={notifications.length === 0 || unreadCount === 0}
                >
                  <CheckCheck className="h-4 w-4" />
                  Mark All Read
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="surface-card p-6">
                <p className="text-sm text-slate-500">Total Notifications</p>
                <p className="mt-1 text-3xl font-semibold text-slate-900">{notifications.length}</p>
              </div>
              <div className="surface-card p-6">
                <p className="text-sm text-slate-500">Unread</p>
                <p className="mt-1 text-3xl font-semibold text-slate-900">{unreadCount}</p>
              </div>
              <div className="surface-card p-6">
                <p className="text-sm text-slate-500">Read</p>
                <p className="mt-1 text-3xl font-semibold text-slate-900">{notifications.length - unreadCount}</p>
              </div>
            </div>

            {alertNotifications.length > 0 && (
              <div className={unreadAlertCount > 0 ? 'alert-warning' : 'alert-info'}>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">
                      {unreadAlertCount > 0
                        ? `${unreadAlertCount} unread alert message${unreadAlertCount === 1 ? '' : 's'} need attention`
                        : 'All alert messages have been reviewed'}
                    </p>
                    <p className="mt-1 text-sm">
                      Urgent deadline warnings and collision alerts are shown here so you can act on them quickly.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && <div className="alert-danger">{error}</div>}

            <div className="surface-card p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Filter Messages</p>
                  <p className="text-xs text-slate-500">Unread messages are shown first by default.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setActiveFilter(option.value)}
                      className={`filter-btn ${activeFilter === option.value ? 'filter-btn-active' : ''}`}
                    >
                      {option.label} ({option.count})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="surface-card p-12 text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-700"></div>
                <p className="text-slate-500">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="surface-card p-12 text-center">
                <Bell className="mx-auto mb-4 h-16 w-16 text-slate-300" />
                <h3 className="text-xl font-semibold text-slate-700">No notifications right now</h3>
                <p className="mt-2 text-slate-500">
                  New reminders and schedule warnings will appear here when your tasks need attention.
                </p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="surface-card p-12 text-center">
                <MailOpen className="mx-auto mb-4 h-16 w-16 text-slate-300" />
                <h3 className="text-xl font-semibold text-slate-700">No {activeFilter.toLowerCase()} messages</h3>
                <p className="mt-2 text-slate-500">
                  Try another filter to review the rest of your notification history.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotifications.map((item) => (
                  <div
                    key={item.id}
                    className={`surface-card p-6 transition ${
                      item.read ? 'border-slate-200/80 opacity-90' : 'border-sky-200 shadow-[0_18px_45px_rgba(14,165,233,0.08)]'
                    }`}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span className={`data-pill ${toneClasses[item.tone] || toneClasses.info}`}>{item.type}</span>
                          {item.category === 'alert' && <span className="data-pill data-pill-warning">Alert Message</span>}
                          <span className={`data-pill ${item.read ? 'data-pill-neutral' : 'data-pill-accent'}`}>
                            {item.read ? 'Read' : 'Unread'}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                        <p className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                          {item.timestamp}
                        </p>
                      </div>

                      <div className="flex shrink-0 gap-3">
                        {item.read ? (
                          <button
                            type="button"
                            onClick={() => markAsUnread(item.id)}
                            className="secondary-btn px-4 py-2"
                          >
                            <MailOpen className="h-4 w-4" />
                            Mark Unread
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => markAsRead(item.id)}
                            className="primary-btn px-4 py-2"
                          >
                            <CheckCheck className="h-4 w-4" />
                            Mark Read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotificationPage;
