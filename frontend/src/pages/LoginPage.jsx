import { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield } from 'lucide-react';

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
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-slate-300/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-sky-100/40 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="brand-badge">
            <div className="icon-chip">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-semibold text-slate-900">ClashGuard</h1>
              <p className="text-xs tracking-[0.24em] text-slate-500">ACADEMIC PLANNER</p>
            </div>
          </div>
        </div>

        <div className="auth-card">
          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-slate-900">Sign In</h2>
            <p className="mt-2 text-sm text-slate-500">Access your planner with the same calm view used across the app.</p>
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
              <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
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
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="primary-btn mt-8 w-full">
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <ArrowRight className="h-5 w-5" />}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setFormData({ email: 'john@university.edu', password: 'password123' })}
            className="secondary-btn mt-3 w-full"
          >
            Try Demo Credentials
          </button>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200"></div>
            <span className="text-xs text-slate-400">New user?</span>
            <div className="h-px flex-1 bg-slate-200"></div>
          </div>

          <p className="text-center text-sm text-slate-500">
            Create an account{' '}
            <Link to="/register" className="font-semibold text-slate-800 transition hover:text-slate-600">
              here
            </Link>
          </p>
        </div>

        <p className="mt-5 text-center text-xs text-slate-500">
          Secure access with a softer, low-strain interface for daily study use.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
