import { useState } from "react";
import { Menu, Bell, ChevronDown, User, Sun, Moon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { userProfile, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const [isDark, setIsDark] = useState(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      return true;
    }
    return false;
  });

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.theme = 'light';
    }
  }

  async function handleLogout() {
    await logout();
    navigate("/login");
    toast.success("Logged out successfully");
  }

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-6 shrink-0 z-40">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-900 dark:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white dark:bg-slate-800 transition-colors"
        >
          <Menu size={20} />
        </button>
        <div>
          <div className="text-base font-bold text-slate-900 dark:text-slate-100 hidden sm:block">Hotel Sai Mahlar</div>
          <div className="text-xs text-slate-500 hidden sm:block">Hotel Management System</div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <button onClick={toggleTheme} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-900 dark:text-slate-200 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white dark:bg-slate-800 transition-colors">
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <button className="relative text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-900 dark:text-slate-200 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white dark:bg-slate-800 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white dark:bg-slate-800 transition-colors"
          >
            <div className="w-7 h-7 bg-emerald-500/20 rounded-full flex items-center justify-center">
              <User size={14} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-200 max-w-[120px] truncate">
                {userProfile?.name}
              </div>
              <div className="text-xs text-slate-500 capitalize">{userProfile?.role}</div>
            </div>
            <ChevronDown size={14} className="text-slate-500" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 py-1">
              <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-700">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-200 truncate">{userProfile?.name}</div>
                <div className="text-xs text-slate-500 truncate">{userProfile?.email}</div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
