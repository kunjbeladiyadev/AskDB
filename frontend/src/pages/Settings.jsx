import React, { useState } from 'react';
import { Settings, User as UserIcon, Palette, Cpu, ShieldCheck, Database as DbIcon, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Sidebar from '../components/layout/Sidebar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Active sub-section tab
  const [activeTab, setActiveTab] = useState('profile');

  // Profile Settings States
  const [name, setName] = useState(user?.name || 'Administrator');
  const [email, setEmail] = useState(user?.email || 'admin@company.com');

  // AI Preferences States
  const [aiModel, setAiModel] = useState('llama3-8b-8192');
  const [temperature, setTemperature] = useState(0.0);
  const [maxTokens, setMaxTokens] = useState(300);

  // Security Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Database settings
  const [defaultDb, setDefaultDb] = useState('askdb_production');

  const handleProfileSave = (e) => {
    e.preventDefault();
    toast.success('Profile details updated successfully! (Simulation Mode)');
  };

  const handleAISave = (e) => {
    e.preventDefault();
    toast.success('AI Inference Preferences saved! (Simulation Mode)');
  };

  const handlePasswordSave = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All password fields are required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    toast.success('Security password updated! (Simulation Mode)');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const tabs = [
    { id: 'profile', label: 'User Profile', icon: UserIcon },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'ai', label: 'AI Preferences', icon: Cpu },
    { id: 'security', label: 'Security & Access', icon: ShieldCheck },
    { id: 'database', label: 'Default Source', icon: DbIcon }
  ];

  return (
    <div className="flex h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors duration-200 overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-8 lg:p-10 space-y-8 flex flex-col">
        {/* Header */}
        <div className="space-y-1 pb-6 border-b border-light-border dark:border-dark-border">
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Settings size={22} className="text-light-muted dark:text-dark-muted" />
            <span>Settings</span>
          </h1>
          <p className="text-sm text-light-muted dark:text-dark-muted">
            Configure application profiles, appearance configurations, and AI preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-1">
          {/* Settings Tabs Sidebar */}
          <Card variant="default" className="lg:col-span-3 p-3 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-150 outline-none text-left whitespace-nowrap lg:w-full ${
                  activeTab === tab.id
                    ? 'bg-accent-primary text-white shadow-sm'
                    : 'text-light-muted dark:text-dark-muted hover:bg-light-hover dark:hover:bg-dark-hover hover:text-light-text dark:hover:text-dark-text'
                }`}
              >
                <tab.icon size={14} />
                <span>{tab.label}</span>
              </button>
            ))}
          </Card>

          {/* Settings Tab Content */}
          <Card variant="default" className="lg:col-span-9 p-6 md:p-8">
            {/* User Profile */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSave} className="space-y-6 max-w-lg">
                <h3 className="text-sm font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted mb-4">
                  User Account Profile
                </h3>
                <Input
                  label="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={true}
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required={true}
                  disabled={true}
                  helperText="User registration emails cannot be changed directly in local database setups."
                />
                <Button type="submit" variant="primary" size="sm">
                  Save Profile Details
                </Button>
              </form>
            )}

            {/* Appearance */}
            {activeTab === 'appearance' && (
              <div className="space-y-6 max-w-lg">
                <h3 className="text-sm font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted mb-4">
                  Theme Appearance Settings
                </h3>
                
                <div className="flex flex-col gap-2.5">
                  <span className="text-xs font-bold text-light-muted dark:text-dark-muted uppercase tracking-wider">
                    Application Mode
                  </span>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => theme !== 'light' && toggleTheme()}
                      className={`flex flex-col items-center justify-center p-6 border rounded-xl gap-2 transition-all outline-none ${
                        theme === 'light'
                          ? 'border-accent-primary bg-accent-primary/5 text-accent-primary font-bold'
                          : 'border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:bg-light-hover dark:hover:bg-dark-hover'
                      }`}
                    >
                      <Palette size={20} />
                      <span className="text-xs">Light Mode</span>
                    </button>
                    
                    <button
                      onClick={() => theme !== 'dark' && toggleTheme()}
                      className={`flex flex-col items-center justify-center p-6 border rounded-xl gap-2 transition-all outline-none ${
                        theme === 'dark'
                          ? 'border-accent-primary bg-accent-primary/5 text-accent-primary font-bold'
                          : 'border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:bg-light-hover dark:hover:bg-dark-hover'
                      }`}
                    >
                      <Palette size={20} />
                      <span className="text-xs">Dark Mode</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-light-hover/30 dark:bg-dark-hover/10 rounded-xl border border-light-border dark:border-dark-border text-xs text-light-muted dark:text-dark-muted">
                  The visual mode will apply system-wide, caching your selections inside your browser's persistent localStorage container.
                </div>
              </div>
            )}

            {/* AI Preferences */}
            {activeTab === 'ai' && (
              <form onSubmit={handleAISave} className="space-y-6 max-w-lg">
                <h3 className="text-sm font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted mb-4 flex items-center gap-1.5">
                  <Cpu size={16} className="text-accent-primary" />
                  <span>AI Model Configurations</span>
                </h3>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-light-muted dark:text-dark-muted tracking-wider uppercase">
                    Inference Model
                  </label>
                  <select
                    value={aiModel}
                    onChange={(e) => setAiModel(e.target.value)}
                    className="w-full pl-3.5 pr-3.5 py-2.5 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg text-xs text-light-text dark:text-dark-text outline-none focus:ring-2 focus:ring-accent-primary/20"
                  >
                    <option value="llama3-8b-8192">Llama 3 8B (Sub-second inference)</option>
                    <option value="llama3-70b-8192">Llama 3 70B (High reasoning accuracy)</option>
                    <option value="mixtral-8x7b-32768">Mixtral 8x7B (SQL expert model)</option>
                  </select>
                </div>

                {/* Temperature */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-light-muted dark:text-dark-muted tracking-wider uppercase">Temperature</span>
                    <span className="font-bold text-accent-primary">{temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full accent-accent-primary cursor-pointer"
                  />
                  <span className="text-[10px] text-light-muted dark:text-dark-muted block">
                    Lower values (e.g. 0.0) are highly deterministic and recommended for query code generations.
                  </span>
                </div>

                {/* Max Tokens */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-light-muted dark:text-dark-muted tracking-wider uppercase">Maximum Tokens</span>
                    <span className="font-bold text-accent-primary">{maxTokens}</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="1000"
                    step="50"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                    className="w-full accent-accent-primary cursor-pointer"
                  />
                </div>

                <Button type="submit" variant="primary" size="sm">
                  Save AI Preferences
                </Button>
              </form>
            )}

            {/* Security */}
            {activeTab === 'security' && (
              <form onSubmit={handlePasswordSave} className="space-y-5 max-w-lg">
                <h3 className="text-sm font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted mb-4">
                  Change Password Credentials
                </h3>
                
                <Input
                  label="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required={true}
                />
                
                <Input
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required={true}
                />
                
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required={true}
                />

                <Button type="submit" variant="primary" size="sm" className="mt-2">
                  Change Password
                </Button>
              </form>
            )}

            {/* Database default settings */}
            {activeTab === 'database' && (
              <div className="space-y-6 max-w-lg">
                <h3 className="text-sm font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted mb-4">
                  Default Database Configuration
                </h3>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-light-muted dark:text-dark-muted tracking-wider uppercase">
                    Primary Data Connection
                  </label>
                  <select
                    value={defaultDb}
                    onChange={(e) => {
                      setDefaultDb(e.target.value);
                      toast.success(`Default workspace database updated: ${e.target.value}`);
                    }}
                    className="w-full pl-3.5 pr-3.5 py-2.5 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg text-xs text-light-text dark:text-dark-text outline-none focus:ring-2 focus:ring-accent-primary/20"
                  >
                    <option value="askdb_production">askdb_production (PostgreSQL)</option>
                    <option value="local_cache.db">local_cache.db (SQLite - Disabled)</option>
                  </select>
                  <span className="text-[10px] text-light-muted dark:text-dark-muted mt-1 leading-relaxed">
                    AI natural language queries will run automatically against schemas within the chosen primary database setting.
                  </span>
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
