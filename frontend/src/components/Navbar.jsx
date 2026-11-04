import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Award, BarChart3, LogOut, Terminal, History as HistoryIcon } from 'lucide-react';

const links = [
  { to: '/dashboard', label: 'Overview', icon: BarChart3 },
  { to: '/interview', label: 'Practice', icon: Terminal },
  { to: '/history', label: 'History', icon: HistoryIcon },
];

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#101714]/85 px-4 backdrop-blur-xl sm:px-6">
      <nav aria-label="Main navigation" className="mx-auto flex min-h-[4.5rem] w-full max-w-[76rem] items-center justify-between gap-4">
        <Link to="/dashboard" className="group flex shrink-0 items-center gap-2.5 text-white no-underline">
          <span className="grid h-9 w-9 place-items-center rounded-xl border border-emerald-100/15 bg-emerald-100/[0.08] transition group-hover:bg-emerald-100/[0.14]">
            <Award className="h-[1.1rem] w-[1.1rem] text-[#a7e2c6]" />
          </span>
          <span className="text-[0.98rem] font-bold tracking-[-0.04em]">Judge<span className="text-[#a7e2c6]">AI</span></span>
        </Link>

        <div className="flex items-center gap-1 rounded-xl border border-white/[0.06] bg-white/[0.025] p-1 max-sm:fixed max-sm:inset-x-3 max-sm:bottom-3 max-sm:z-50 max-sm:justify-around max-sm:bg-[#17211d]/95 max-sm:p-1.5 max-sm:shadow-[0_12px_42px_rgba(0,0,0,.4)]">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `relative flex items-center gap-2 rounded-lg px-3 py-2 text-[0.78rem] font-semibold no-underline transition-colors ${
                isActive
                  ? 'bg-[#a7e2c6]/10 text-[#a7e2c6]'
                  : 'text-[#9aa9a0] hover:bg-white/[0.04] hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden items-center gap-2.5 border-r border-white/[0.09] pr-4 sm:flex">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#26372e] text-xs font-bold uppercase text-[#b8ebd0]">
              {user?.name?.trim()?.[0] || 'U'}
            </span>
            <span className="max-w-32 truncate text-xs font-medium text-[#c2cec5]">{user?.name}</span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Log out"
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.025] text-[#96a49b] transition hover:border-rose-300/20 hover:bg-rose-300/[0.06] hover:text-[#f0a48f]"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </nav>
    </header>
  );
}
