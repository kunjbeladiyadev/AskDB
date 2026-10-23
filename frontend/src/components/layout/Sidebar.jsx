import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Database, LayoutDashboard, MessageSquare, History, 
  Settings, LogOut, Sun, Moon, Sparkles, HardDrive 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Button from '../ui/Button';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Ask Data', path: '/chat', icon: MessageSquare },
    { name: 'Databases', path: '/databases', icon: HardDrive },
    { name: 'Schema Explorer', path: '/schema', icon: Database },
    { name: 'Query History', path: '/history', icon: History },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 border-r border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card flex flex-col justify-between h-screen sticky top-0 flex-shrink-0 transition-colors duration-200">
      {/* Top Section - Brand */}
      <div>
        <div className="px-6 py-5 border-b border-light-border dark:border-dark-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-accent-primary to-accent-secondary flex items-center justify-center text-white font-bold text-sm shadow-md shadow-accent-primary/20">
            A
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base text-light-text dark:text-dark-text tracking-tight">AskDB</span>
              <span className="text-[9px] font-bold text-accent-secondary bg-accent-secondary/10 px-1.5 py-0.5 rounded border border-accent-secondary/20">
                AI
              </span>
            </div>
            <span className="text-[10px] font-medium text-light-muted dark:text-dark-muted block -mt-0.5">
              AI Data Analyst
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 py-4 space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-accent-primary text-white shadow-sm'
                    : 'text-light-muted dark:text-dark-muted hover:bg-light-hover dark:hover:bg-dark-hover hover:text-light-text dark:hover:text-dark-text'
                }`
              }
            >
              <item.icon size={16} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom Section - User Session */}
      <div className="border-t border-light-border dark:border-dark-border p-4 flex flex-col gap-3">
        {/* Theme Toggle Widget */}
        <div className="flex items-center justify-between px-3 py-2 bg-light-hover dark:bg-dark-hover rounded-xl border border-light-border dark:border-dark-border">
          <span className="text-xs font-semibold text-light-muted dark:text-dark-muted uppercase tracking-wider">
            {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="!p-1.5 rounded-lg hover:bg-light-border dark:hover:bg-dark-border focus:ring-0 focus:ring-offset-0 !text-light-muted dark:!text-dark-muted"
          >
            {theme === 'dark' ? <Moon size={15} /> : <Sun size={15} />}
          </Button>
        </div>

        {/* Profile Card & Logout */}
        <div className="flex items-center justify-between gap-3 px-2">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-accent-primary/10 border border-accent-primary/20 text-accent-primary flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="overflow-hidden">
              <span className="block text-xs font-bold text-light-text dark:text-dark-text truncate">
                {user?.name || 'User Profile'}
              </span>
              <span className="block text-[10px] text-light-muted dark:text-dark-muted truncate">
                {user?.email || 'user@example.com'}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="!p-1.5 rounded-lg text-accent-error hover:bg-accent-error/10 hover:!text-accent-error focus:ring-0 focus:ring-offset-0"
            title="Log Out"
          >
            <LogOut size={16} />
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
