import { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Lock, User, Eye, EyeOff, ArrowRight, CheckCircle2, GraduationCap } from 'lucide-react';

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
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-8 right-12 h-72 w-72 rounded-full bg-slate-300/25 blur-3xl" />
        <div className="absolute bottom-0 left-8 h-64 w-64 rounded-full bg-sky-100/45 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-semibold text-slate-900">Create Your Account</h1>
          <p className="mt-2 text-slate-500">One balanced theme, one clean workflow, and a consistent study-friendly experience.</p>
          <div className="mt-6 flex justify-center gap-2">
            <div className={`h-2 w-10 rounded-full ${step === 1 ? 'bg-slate-700' : 'bg-slate-300'}`}></div>
            <div className={`h-2 w-10 rounded-full ${step === 2 ? 'bg-slate-700' : 'bg-slate-300'}`}></div>
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
                <h2 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
                  <User className="h-6 w-6 text-slate-700" />
                  Personal Information
                </h2>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="input-field"
                    />
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
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="student@university.edu"
                    required
                    className="input-field"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!formData.name || !formData.email}
                  className="primary-btn mt-6 w-full"
                >
                  Next Step
                  <ArrowRight className="h-5 w-5" />
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
                  <GraduationCap className="h-6 w-6 text-slate-700" />
                  Academic And Security
                </h2>

                <div className="soft-card space-y-4 p-5">
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
                  <label className="block text-sm font-semibold text-slate-700">Password *</label>
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
                    >
                      {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                  <button type="button" onClick={() => setStep(1)} className="secondary-btn flex-1">
                    Back
                  </button>
                  <button type="submit" disabled={loading} className="primary-btn flex-1">
                    {loading ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </>
            )}
          </form>

          <div className="mt-6 border-t border-slate-200 pt-6">
            <p className="text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-slate-800 transition hover:text-slate-600">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
