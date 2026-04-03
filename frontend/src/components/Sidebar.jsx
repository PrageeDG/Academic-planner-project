import { useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  LogOut, Menu, X, Home, BarChart3,
  Settings, AlertTriangle, CheckSquare, ChevronRight
} from 'lucide-react';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: AlertTriangle, label: 'Burnout Analysis', path: '/burnout-analysis' },
    { icon: AlertTriangle, label: 'Collision Analysis', path: '/collision-analysis' },
    { icon: CheckSquare, label: 'My Tasks', path: '/tasks' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-5 z-50 rounded-2xl border border-[#27404d] bg-[linear-gradient(135deg,_rgba(29,49,60,0.98)_0%,_rgba(39,63,75,0.96)_100%)] p-2.5 shadow-[0_18px_40px_rgba(18,31,38,0.28)] backdrop-blur md:hidden"
      >
        {isOpen ? <X size={22} className="text-white" /> : <Menu size={22} className="text-white" />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-[#102129]/48 backdrop-blur-sm md:hidden animate-fade-in"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 flex h-screen w-72 transform flex-col overflow-hidden rounded-none border-r border-[#203845] bg-[linear-gradient(180deg,_#1a2f39_0%,_#223943_22%,_#294550_48%,_#2d4c57_100%)] px-5 py-6 shadow-[0_24px_60px_rgba(18,31,38,0.32)] transition-all duration-300 ease-out md:sticky md:top-[88px] md:h-[calc(100vh-88px)] md:flex-none md:self-start md:border-r md:border-[#203845] ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,_rgba(122,169,184,0.22),_transparent_72%)]"></div>

        {/* Navigation */}
        <div className="relative mb-3 mt-12 flex items-center justify-between px-1 md:mt-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-300">Navigation</p>
          <span className="rounded-full border border-white/10 bg-white/8 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-200">
            Main
          </span>
        </div>

        <nav className="relative flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`group w-full rounded-2xl px-4 py-3 text-left font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[linear-gradient(135deg,_#6d96a5_0%,_#87aebb_100%)] text-white shadow-[0_16px_30px_rgba(8,16,20,0.24)]'
                    : 'border border-transparent bg-white/6 text-slate-200 hover:border-white/10 hover:bg-white/12 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl transition ${
                      isActive
                        ? 'bg-white/18 text-white'
                        : 'bg-white/10 text-slate-200 group-hover:bg-white/16 group-hover:text-white'
                    }`}
                  >
                    <item.icon size={19} />
                  </div>
                  <div className="flex-1">
                    <span className="block text-sm font-semibold">{item.label}</span>
                  </div>
                  <ChevronRight
                    size={16}
                    className={`transition ${
                      isActive ? 'translate-x-0 text-white/80' : 'text-slate-400 group-hover:translate-x-0.5 group-hover:text-slate-200'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="relative mt-4 border-t border-white/10 pt-4">
          <button
            onClick={handleLogout}
            className="group flex w-full items-center gap-3 rounded-2xl border border-[#6b4a4a] bg-[#4b3131]/78 px-4 py-3 font-medium text-[#f2d7d7] transition-all duration-200 hover:bg-[#5a3a3a]/88"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
