import { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { authAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import AppHeader from '../components/AppHeader';
import { Mail, Lock, Settings, Eye, EyeOff, CheckCircle2, Save, Camera, Trash2 } from 'lucide-react';

const ProfilePage = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const imageInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [removeProfileImage, setRemoveProfileImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(user?.profileImage || '');

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    faculty: user?.faculty || '',
    degree: user?.degree || '',
    year: user?.year || 1,
    studentId: user?.studentId || '',
    profileImage: user?.profileImage || '',
  });

  useEffect(() => {
    setProfileData({
      name: user?.name || '',
      faculty: user?.faculty || '',
      degree: user?.degree || '',
      year: user?.year || 1,
      studentId: user?.studentId || '',
      profileImage: user?.profileImage || '',
    });
    setImagePreview(user?.profileImage || '');
    setProfileImageFile(null);
    setRemoveProfileImage(false);
  }, [user]);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
  });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('name', profileData.name);
      formData.append('faculty', profileData.faculty);
      formData.append('degree', profileData.degree);
      formData.append('year', String(profileData.year));
      formData.append('studentId', profileData.studentId);

      if (profileImageFile) {
        formData.append('profileImage', profileImageFile);
      } else if (removeProfileImage) {
        formData.append('removeProfileImage', 'true');
      }

      const result = await updateProfile(formData);
      if (!result.success) {
        throw new Error(result.message || 'Failed to update profile');
      }
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || err.response?.data?.message || 'Failed to update profile');
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

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Profile image must be smaller than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const imageData = typeof reader.result === 'string' ? reader.result : '';
      setProfileData((current) => ({ ...current, profileImage: imageData }));
      setImagePreview(imageData);
      setProfileImageFile(file);
      setRemoveProfileImage(false);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setProfileData((current) => ({ ...current, profileImage: '' }));
    setImagePreview('');
    setProfileImageFile(null);
    setRemoveProfileImage(true);

    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleToggleEditing = () => {
    if (isEditing) {
      setProfileData({
        name: user?.name || '',
        faculty: user?.faculty || '',
        degree: user?.degree || '',
        year: user?.year || 1,
        studentId: user?.studentId || '',
        profileImage: user?.profileImage || '',
      });
      setImagePreview(user?.profileImage || '');
      setProfileImageFile(null);
      setRemoveProfileImage(false);

      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    }

    setIsEditing(!isEditing);
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
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl bg-slate-800 text-3xl font-semibold text-white">
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={`${user?.name || 'User'} profile`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    user?.name?.charAt(0)?.toUpperCase()
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">{user?.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">{user?.email}</p>
                </div>
              </div>
              <button onClick={handleToggleEditing} className="secondary-btn self-start">
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
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl bg-slate-800 text-white">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Profile preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Camera className="h-8 w-8 text-white/80" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900">Profile Photo</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Upload a JPG, PNG, or WebP image up to 2MB.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-3">
                        <button type="button" onClick={() => imageInputRef.current?.click()} className="secondary-btn">
                          <Camera className="h-4 w-4" />
                          Choose Image
                        </button>
                        <button type="button" onClick={handleRemoveImage} className="secondary-btn">
                          <Trash2 className="h-4 w-4" />
                          Remove Image
                        </button>
                      </div>
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

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
                      onChange={(e) => setProfileData({ ...profileData, year: Number(e.target.value) })}
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
