import { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  Shield,
  Sparkles,
  User,
} from 'lucide-react';

const RegisterPage = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    studentId: '',
    faculty: 'Faculty of Computing',
    degree: 'Bachelor of Software Engineering',
    year: '1',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleNext = () => {
    if (step === 1 && formData.name && formData.email) {
      setStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.passwordConfirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    const result = await register(formData);
    if (result.success) {
      setSuccess('Account created successfully!');
      setTimeout(() => navigate('/dashboard'), 1500);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-shell">
      <div className="auth-spotlight">
        <div className="auth-orb-a" />
        <div className="auth-orb-b" />
        <div className="auth-orb-c" />
      </div>

      <div className="auth-layout">
        <section className="auth-showcase">
          <div className="relative">
            <div className="auth-hero-badge bg-white/10 text-white shadow-none">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/14 text-white">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <p className="text-lg font-semibold">ClashGuard</p>
                <p className="text-xs uppercase tracking-[0.24em] text-white/70">Student Setup</p>
              </div>
            </div>

            <div className="mt-10">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                <Sparkles className="h-3.5 w-3.5" />
                Modern Study Onboarding
              </p>
              <h1 className="max-w-md text-4xl font-semibold leading-tight text-white">
                Build your student workspace in a few simple steps.
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-7 text-white/78">
                Set up your profile, academic details, and secure access once. After that, your planner, dashboard, and notifications work together in one consistent flow.
              </p>
            </div>
          </div>

          <div className="relative mt-10 space-y-4">
            <div className="auth-showcase-card">
              <p className="text-xs uppercase tracking-[0.18em] text-white/65">What you get</p>
              <div className="mt-4 space-y-3 text-sm text-white/78">
                <p>Live dashboard cards from your real tasks</p>
                <p>Deadline collision warnings and burnout analysis</p>
                <p>Read and unread notifications from one header action</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="auth-stat-chip">
                <p className="text-xs uppercase tracking-[0.2em] text-white/60">Flow</p>
                <p className="mt-2 text-2xl font-semibold text-white">2 Steps</p>
                <p className="mt-1 text-sm text-white/72">Fast sign-up with a cleaner academic profile form.</p>
              </div>
              <div className="auth-stat-chip">
                <p className="text-xs uppercase tracking-[0.2em] text-white/60">Design</p>
                <p className="mt-2 text-2xl font-semibold text-white">Modern</p>
                <p className="mt-1 text-sm text-white/72">Soft gradients with warmer accent colors for a fresher look.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="auth-form-wrap">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="auth-hero-badge">
              <div className="icon-chip">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-semibold text-slate-900">Create Account</h1>
                <p className="text-xs tracking-[0.24em] text-slate-500">SET UP YOUR PLANNER</p>
              </div>
            </div>

            <div className="flex gap-2">
              <div className={`auth-step-dot ${step === 1 ? 'auth-step-dot-active' : ''}`}></div>
              <div className={`auth-step-dot ${step === 2 ? 'auth-step-dot-active' : ''}`}></div>
            </div>
          </div>

          <div className="auth-card">
            {error && <div className="alert-danger mb-6 text-sm font-medium">{error}</div>}

            {success && (
              <div className="alert-success mb-6 flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 className="h-5 w-5" />
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {step === 1 && (
                <>
                  <div className="mb-2">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Step 1</p>
                    <h2 className="mt-2 flex items-center gap-2 text-2xl font-semibold text-slate-900">
                      <User className="h-6 w-6 text-slate-700" />
                      Personal Details
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Add your identity details first so your dashboard can feel personalized from the start.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">Full Name *</label>
                      <div className="group relative">
                        <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 transition group-focus-within:text-slate-700" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="John Doe"
                          className="input-with-icon"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">Student ID</label>
                      <input
                        type="text"
                        name="studentId"
                        value={formData.studentId}
                        onChange={handleChange}
                        placeholder="ENG/2024/001"
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Email Address *</label>
                    <div className="group relative">
                      <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 transition group-focus-within:text-slate-700" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="student@university.edu"
                        required
                        className="input-with-icon"
                      />
                    </div>
                  </div>

                  <div className="auth-accent-panel">
                    <p className="text-sm font-semibold text-slate-800">Why this helps</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      These details are used across your profile, navigation, and personalized dashboard views.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!formData.name || !formData.email}
                    className="primary-btn mt-4 w-full"
                  >
                    Continue to Academic Details
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="mb-2">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Step 2</p>
                    <h2 className="mt-2 flex items-center gap-2 text-2xl font-semibold text-slate-900">
                      <GraduationCap className="h-6 w-6 text-slate-700" />
                      Academic And Security
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Complete your academic profile and choose a secure password for your planner account.
                    </p>
                  </div>

                  <div className="auth-accent-panel space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Faculty</label>
                        <select name="faculty" value={formData.faculty} onChange={handleChange} className="select-field">
                          {['Faculty of Engineering', 'Faculty of Computing', 'Faculty of Business', 'Faculty of Humanities', 'Faculty of Science'].map((f) => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">Year</label>
                        <select name="year" value={formData.year} onChange={handleChange} className="select-field">
                          {[1, 2, 3, 4].map((y) => (
                            <option key={y} value={y}>Year {y}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">Degree Program</label>
                      <select name="degree" value={formData.degree} onChange={handleChange} className="select-field">
                        {['Bachelor of Software Engineering', 'Bachelor of Information Technology', 'Bachelor of Engineering', 'Bachelor of Data Science', 'Master of Information Technology'].map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">Password *</label>
                      <div className="group relative">
                        <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 transition group-focus-within:text-slate-700" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="••••••••"
                          required
                          className="input-with-icon pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-3.5 text-slate-400 transition hover:text-slate-700"
                          aria-label="Toggle password visibility"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">Confirm Password *</label>
                      <div className="group relative">
                        <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 transition group-focus-within:text-slate-700" />
                        <input
                          type={showConfirm ? 'text' : 'password'}
                          name="passwordConfirm"
                          value={formData.passwordConfirm}
                          onChange={handleChange}
                          placeholder="••••••••"
                          required
                          className="input-with-icon pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                          className="absolute right-4 top-3.5 text-slate-400 transition hover:text-slate-700"
                          aria-label="Toggle confirm password visibility"
                        >
                          {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                    <button type="button" onClick={() => setStep(1)} className="secondary-btn flex-1">
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </button>
                    <button type="submit" disabled={loading} className="primary-btn flex-1">
                      {loading ? 'Creating...' : 'Create Account'}
                      {!loading && <ArrowRight className="h-5 w-5" />}
                    </button>
                  </div>
                </>
              )}
            </form>

            <div className="mt-6 border-t border-slate-200 pt-6">
              <p className="text-center text-sm text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-slate-800 transition hover:text-[#2f5668]">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default RegisterPage;
