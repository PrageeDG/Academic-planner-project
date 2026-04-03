import { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  ArrowRight,
  BookOpenCheck,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
  Sparkles,
} from 'lucide-react';

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(formData.email, formData.password);
    if (result.success) {
      navigate('/dashboard');
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
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <p className="text-lg font-semibold">ClashGuard</p>
                <p className="text-xs uppercase tracking-[0.24em] text-white/70">Academic Planner</p>
              </div>
            </div>

            <div className="mt-10">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                <Sparkles className="h-3.5 w-3.5" />
                Focused Student Workspace
              </p>
              <h1 className="max-w-md text-4xl font-semibold leading-tight text-white">
                Plan deadlines with less stress and a clearer daily rhythm.
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-7 text-white/78">
                Track upcoming submissions, workload pressure, and smart reminders in one balanced system made for long student study sessions.
              </p>
            </div>
          </div>

          <div className="relative mt-10 grid gap-4 sm:grid-cols-2">
            <div className="auth-stat-chip">
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">Student View</p>
              <p className="mt-2 text-2xl font-semibold text-white">Calm</p>
              <p className="mt-1 text-sm text-white/72">Softer colors and lower eye strain for everyday planning.</p>
            </div>
            <div className="auth-stat-chip">
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">Smart Alerts</p>
              <p className="mt-2 text-2xl font-semibold text-white">Live</p>
              <p className="mt-1 text-sm text-white/72">See deadlines, reminders, and collision warnings quickly.</p>
            </div>
          </div>

          <div className="relative mt-auto pt-8">
            <div className="auth-showcase-card">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12">
                  <BookOpenCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Built for academic flow</p>
                  <p className="mt-1 text-sm leading-6 text-white/72">
                    Keep your study week organized with one dashboard, one theme, and one reliable place for important decisions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="auth-form-wrap">
          <div className="mb-6">
            <div className="auth-hero-badge">
              <div className="icon-chip">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-semibold text-slate-900">Welcome Back</h1>
                <p className="text-xs tracking-[0.24em] text-slate-500">SIGN IN TO CONTINUE</p>
              </div>
            </div>
          </div>

          <div className="auth-card">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Sign In</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900">Access your planner</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Log in to review your schedule, notifications, workload balance, and upcoming deadlines.
              </p>
            </div>

            {error && (
              <div className="alert-danger mb-6">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                  {error}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Email Address</label>
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

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-semibold text-slate-700">Password</label>
                  <span className="text-xs font-medium text-slate-400">Private and secure</span>
                </div>
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

              <button type="submit" disabled={loading} className="primary-btn mt-2 w-full">
                {loading ? 'Signing in...' : 'Sign In'}
                {!loading && <ArrowRight className="h-5 w-5" />}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200"></div>
              <span className="text-xs uppercase tracking-[0.16em] text-slate-400">New here</span>
              <div className="h-px flex-1 bg-slate-200"></div>
            </div>

            <p className="text-center text-sm text-slate-500">
              Create an account{' '}
              <Link to="/register" className="font-semibold text-slate-800 transition hover:text-[#2f5668]">
                here
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LoginPage;
