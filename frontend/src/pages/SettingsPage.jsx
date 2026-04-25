import { useContext, useEffect, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  BookOpen,
  CheckCircle2,
  RotateCcw,
  Save,
  Settings as SettingsIcon,
  SlidersHorizontal,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import AppHeader from '../components/AppHeader';
import { AuthContext } from '../context/AuthContext';
import { userAPI } from '../services/api';

const defaultSettings = {
  dailyWorkloadLimit: 10,
  weeklyWorkloadLimit: 25,
  dueSoonWindow: 3,
  notificationRefreshMinutes: 1,
  showUnreadFirst: true,
  browserAlerts: true,
  reminderHighlights: true,
  dashboardFocus: 'Balanced overview',
};

const SettingsPage = () => {
  const { user } = useContext(AuthContext);
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await userAPI.getSettings();
        setSettings({ ...defaultSettings, ...(response.data.settings || {}) });
      } catch (loadError) {
        setError(loadError.response?.data?.message || 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setSuccess('');
    setError('');
    setSettings((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError('');
      const response = await userAPI.updateSettings(settings);
      setSettings({ ...defaultSettings, ...(response.data.settings || {}) });
      setSuccess('Settings saved successfully.');
      window.setTimeout(() => setSuccess(''), 2500);
    } catch (saveError) {
      setError(saveError.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      setSaving(true);
      setError('');
      const response = await userAPI.updateSettings(defaultSettings);
      setSettings({ ...defaultSettings, ...(response.data.settings || {}) });
      setSuccess('Settings were reset to defaults.');
      window.setTimeout(() => setSuccess(''), 2500);
    } catch (resetError) {
      setError(resetError.response?.data?.message || 'Failed to reset settings');
    } finally {
      setSaving(false);
    }
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
                  <SettingsIcon className="h-8 w-8 text-slate-700" />
                  Settings
                </h1>
                <p className="section-subtitle mt-2">
                  Customize how your planner highlights workload, notifications, and study priorities.
                </p>
              </div>
            </div>

            {success && (
              <div className="alert-success flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 className="h-5 w-5" />
                {success}
              </div>
            )}

            {error && (
              <div className="alert-danger flex items-center gap-2 text-sm font-medium">
                <AlertTriangle className="h-5 w-5" />
                {error}
              </div>
            )}

            {loading ? (
              <div className="surface-card p-12 text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-700"></div>
                <p className="text-slate-500">Loading your settings...</p>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                  <div className="surface-card p-6 xl:col-span-2">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                        <SlidersHorizontal className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900">Planner Thresholds</h2>
                        <p className="text-sm text-slate-500">Control the limits used to think about your study load.</p>
                      </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Daily workload limit</label>
                        <input
                          type="number"
                          min="1"
                          max="24"
                          name="dailyWorkloadLimit"
                          value={settings.dailyWorkloadLimit}
                          onChange={handleChange}
                          className="input-field"
                        />
                        <p className="mt-2 text-xs text-slate-500">Recommended warning limit for one day of study hours.</p>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Weekly workload limit</label>
                        <input
                          type="number"
                          min="5"
                          max="80"
                          name="weeklyWorkloadLimit"
                          value={settings.weeklyWorkloadLimit}
                          onChange={handleChange}
                          className="input-field"
                        />
                        <p className="mt-2 text-xs text-slate-500">Healthy weekly planning range for analytics and reviews.</p>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Due soon window</label>
                        <input
                          type="number"
                          min="1"
                          max="14"
                          name="dueSoonWindow"
                          value={settings.dueSoonWindow}
                          onChange={handleChange}
                          className="input-field"
                        />
                        <p className="mt-2 text-xs text-slate-500">How many days ahead should count as an urgent deadline.</p>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Dashboard focus</label>
                        <select
                          name="dashboardFocus"
                          value={settings.dashboardFocus}
                          onChange={handleChange}
                          className="select-field"
                        >
                          <option value="Balanced overview">Balanced overview</option>
                          <option value="Deadline first">Deadline first</option>
                          <option value="Health first">Health first</option>
                          <option value="Progress first">Progress first</option>
                        </select>
                        <p className="mt-2 text-xs text-slate-500">Choose the planning perspective you prefer most.</p>
                      </div>
                    </div>
                  </div>

                  <div className="surface-card p-6">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900">Account Snapshot</h2>
                        <p className="text-sm text-slate-500">Current student profile summary.</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="soft-card p-4">
                        <p className="text-xs text-slate-500">Name</p>
                        <p className="mt-1 font-semibold text-slate-900">{user?.name || 'Student'}</p>
                      </div>
                      <div className="soft-card p-4">
                        <p className="text-xs text-slate-500">Email</p>
                        <p className="mt-1 font-semibold text-slate-900">{user?.email || 'Not available'}</p>
                      </div>
                      <div className="soft-card p-4">
                        <p className="text-xs text-slate-500">Faculty</p>
                        <p className="mt-1 font-semibold text-slate-900">{user?.faculty || 'Not set'}</p>
                      </div>
                      <div className="soft-card p-4">
                        <p className="text-xs text-slate-500">Degree</p>
                        <p className="mt-1 font-semibold text-slate-900">{user?.degree || 'Not set'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                  <div className="surface-card p-6">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                        <Bell className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900">Notification Preferences</h2>
                        <p className="text-sm text-slate-500">Tune how alerts and reminders are shown to you.</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Refresh notifications every</label>
                        <select
                          name="notificationRefreshMinutes"
                          value={settings.notificationRefreshMinutes}
                          onChange={handleChange}
                          className="select-field"
                        >
                          <option value="1">1 minute</option>
                          <option value="5">5 minutes</option>
                          <option value="10">10 minutes</option>
                          <option value="15">15 minutes</option>
                        </select>
                      </div>

                      {[
                        {
                          name: 'showUnreadFirst',
                          label: 'Show unread messages first',
                          text: 'Keep unread notifications at the top of your review flow.',
                        },
                        {
                          name: 'browserAlerts',
                          label: 'Enable browser-style alerts',
                          text: 'Use stronger alert emphasis for urgent scheduling warnings.',
                        },
                        {
                          name: 'reminderHighlights',
                          label: 'Highlight reminder-based tasks',
                          text: 'Make reminder tasks easier to notice in notification lists.',
                        },
                      ].map((item) => (
                        <label key={item.name} className="soft-card flex cursor-pointer items-start gap-3 p-4">
                          <input
                            type="checkbox"
                            name={item.name}
                            checked={settings[item.name]}
                            onChange={handleChange}
                            className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-700 focus:ring-slate-300"
                          />
                          <div>
                            <p className="font-semibold text-slate-900">{item.label}</p>
                            <p className="mt-1 text-sm text-slate-500">{item.text}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="surface-card p-6">
                    <h2 className="text-lg font-semibold text-slate-900">How These Settings Help</h2>
                    <div className="mt-5 space-y-3">
                      <div className="alert-info">
                        <p className="font-semibold">Better planning control</p>
                        <p className="mt-1 text-sm">You can define how strict the planner should be about workload and urgency.</p>
                      </div>
                      <div className="alert-warning">
                        <p className="font-semibold">Smarter notification review</p>
                        <p className="mt-1 text-sm">Unread-first and stronger alert emphasis help you focus on what matters first.</p>
                      </div>
                      <div className="alert-success">
                        <p className="font-semibold">Account-based preferences</p>
                        <p className="mt-1 text-sm">Your settings are now saved in MongoDB and follow your user account, not just one browser.</p>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <button type="submit" className="primary-btn flex-1" disabled={saving}>
                        <Save className="h-4 w-4" />
                        {saving ? 'Saving...' : 'Save Settings'}
                      </button>
                      <button type="button" onClick={handleReset} className="secondary-btn flex-1" disabled={saving}>
                        <RotateCcw className="h-4 w-4" />
                        Reset Defaults
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
