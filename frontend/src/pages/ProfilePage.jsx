import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { userAPI, authAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import AppHeader from '../components/AppHeader';
import { Mail, Lock, Settings, Eye, EyeOff, CheckCircle2, Save } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    faculty: user?.faculty || '',
    degree: user?.degree || '',
    year: user?.year || 1,
    studentId: user?.studentId || '',
  });

  
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
  });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userAPI.updateProfile(profileData);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.changePassword(passwordData);
      setSuccess('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
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
            <h1 className="flex items-center gap-3 text-3xl font-semibold text-slate-900">
              <Settings className="h-8 w-8 text-slate-700" />
              Profile Settings
            </h1>
            <p className="section-subtitle mt-2">Manage your account details in the same calm style as the rest of the project.</p>
          </div>

          {error && <div className="alert-danger text-sm font-medium">{error}</div>}
          {success && (
            <div className="alert-success flex items-center gap-2 text-sm font-medium">
              <CheckCircle2 className="h-5 w-5" />
              {success}
            </div>
          )}

          <div className="surface-card p-8">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-5">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-800 text-3xl font-semibold text-white">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">{user?.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">{user?.email}</p>
                </div>
              </div>
              <button onClick={() => setIsEditing(!isEditing)} className="secondary-btn self-start">
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {!isEditing ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[
                  ['Full Name', user?.name],
                  ['Student ID', user?.studentId || 'Not set'],
                  ['Faculty', user?.faculty],
                  ['Degree', user?.degree],
                  ['Year', `Year ${user?.year}`],
                ].map(([label, value]) => (
                  <div key={label} className="soft-card p-4">
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="mt-1 font-semibold text-slate-900">{value}</p>
                  </div>
                ))}
                <div className="alert-info">
                  <p className="text-xs font-medium">Semester</p>
                  <p className="mt-1 font-semibold text-slate-900">Semester 1 • 2026</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Full Name</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Student ID</label>
                    <input
                      type="text"
                      value={profileData.studentId}
                      onChange={(e) => setProfileData({ ...profileData, studentId: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Faculty</label>
                    <select
                      value={profileData.faculty}
                      onChange={(e) => setProfileData({ ...profileData, faculty: e.target.value })}
                      className="select-field"
                    >
                      {['Faculty of Engineering', 'Faculty of Computing', 'Faculty of Business', 'Faculty of Humanities', 'Faculty of Science'].map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Year</label>
                    <select
                      value={profileData.year}
                      onChange={(e) => setProfileData({ ...profileData, year: e.target.value })}
                      className="select-field"
                    >
                      {[1, 2, 3, 4].map((y) => (
                        <option key={y} value={y}>Year {y}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Degree</label>
                    <select
                      value={profileData.degree}
                      onChange={(e) => setProfileData({ ...profileData, degree: e.target.value })}
                      className="select-field"
                    >
                      {['Bachelor of Software Engineering', 'Bachelor of Information Technology', 'Bachelor of Engineering', 'Bachelor of Data Science', 'Master of Information Technology'].map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="primary-btn w-full">
                  <Save className="h-5 w-5" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            )}
          </div>

          <div className="surface-card p-8">
            <h2 className="mb-6 flex items-center gap-3 text-2xl font-semibold text-slate-900">
              <Lock className="h-6 w-6 text-slate-700" />
              Security And Password
            </h2>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPwd ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="••••••••"
                    required
                    className="input-field pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                    className="absolute right-4 top-3 text-slate-400 hover:text-slate-700"
                  >
                    {showCurrentPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPwd ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="••••••••"
                    required
                    className="input-field pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPwd(!showNewPwd)}
                    className="absolute right-4 top-3 text-slate-400 hover:text-slate-700"
                  >
                    {showNewPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="primary-btn w-full">
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          <div className="surface-card p-8">
            <h2 className="mb-6 flex items-center gap-3 text-2xl font-semibold text-slate-900">
              <Mail className="h-6 w-6 text-slate-700" />
              Account Information
            </h2>
            <div className="space-y-3">
              <div className="soft-card p-4">
                <p className="text-xs text-slate-500">Email Address</p>
                <p className="mt-1 font-semibold text-slate-900">{user?.email}</p>
                <p className="mt-1 text-xs text-emerald-700">Verified</p>
              </div>
              <div className="soft-card p-4">
                <p className="text-xs text-slate-500">Account Role</p>
                <p className="mt-1 font-semibold capitalize text-slate-900">{user?.role || 'Student'}</p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
