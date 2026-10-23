import React, { useState, useEffect } from 'react';
import { Database, Plus, RefreshCw, HardDrive, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/layout/Sidebar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import DatabaseCard from '../components/ui/DatabaseCard';
import toast from 'react-hot-toast';

const DatabasePage = () => {
  const { authenticatedFetch } = useAuth();
  
  const [sources, setSources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [activatingId, setActivatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [seeding, setSeeding] = useState(false);

  // Form states
  const [dbNameLabel, setDbNameLabel] = useState('');
  const [dbType, setDbType] = useState('SQLite');
  const [host, setHost] = useState('localhost');
  const [port, setPort] = useState(5432);
  const [dbName, setDbName] = useState('my_business_database.db');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');

  const fetchSources = async () => {
    setIsLoading(true);
    try {
      const response = await authenticatedFetch('/database/sources');
      const data = await response.json();
      if (response.ok) {
        setSources(data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not load database sources.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const handleDbTypeChange = (type) => {
    setDbType(type);
    if (type === 'SQLite') {
      setHost('localhost');
      setPort(0);
      setDbName('sqlite.db');
      setUsername('');
      setPassword('');
    } else if (type === 'PostgreSQL') {
      setHost('localhost');
      setPort(5432);
      setDbName('askdb');
      setUsername('postgres');
    } else if (type === 'MySQL') {
      setHost('localhost');
      setPort(3306);
      setDbName('askdb');
      setUsername('root');
    }
  };

  const handleTestConnection = async (e) => {
    e.preventDefault();
    if (!dbName) {
      toast.error('Please specify a database name or file path.');
      return;
    }
    setTesting(true);
    try {
      const response = await authenticatedFetch('/database/test', {
        method: 'POST',
        body: JSON.stringify({
          db_type: dbType,
          host,
          port: parseInt(port) || 0,
          database_name: dbName,
          username,
          password
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success(data.message || 'Connection test successful!');
      } else {
        toast.error(data.detail || 'Connection test failed.');
      }
    } catch (err) {
      toast.error('Connection test failed. Verify database parameters.');
    } finally {
      setTesting(false);
    }
  };

  const handleConnectDatabase = async (e) => {
    e.preventDefault();
    if (!dbName) {
      toast.error('Please provide database name or file path.');
      return;
    }
    setConnecting(true);
    try {
      const response = await authenticatedFetch('/database/connect', {
        method: 'POST',
        body: JSON.stringify({
          name: dbNameLabel || `${dbName} (${dbType})`,
          db_type: dbType,
          host,
          port: parseInt(port) || 0,
          database_name: dbName,
          username,
          password
        })
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(`Successfully connected: ${data.name || data.database_name}`);
        setIsModalOpen(false);
        fetchSources();
        setDbNameLabel('');
      } else {
        toast.error(data.detail || 'Connection failed.');
      }
    } catch (err) {
      toast.error('Failed to register database datasource.');
    } finally {
      setConnecting(false);
    }
  };

  const handleSetActive = async (sourceId) => {
    setActivatingId(sourceId);
    try {
      const res = await authenticatedFetch('/database/active', {
        method: 'POST',
        body: JSON.stringify({ source_id: sourceId })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Active database updated!');
        fetchSources();
      } else {
        toast.error(data.detail || 'Failed to switch database.');
      }
    } catch (err) {
      toast.error('Failed to change active database.');
    } finally {
      setActivatingId(null);
    }
  };

  const handleSeedSampleDB = async () => {
    setSeeding(true);
    try {
      const res = await authenticatedFetch('/database/seed-sample', {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Sample database initialized with 100+ business records!');
        fetchSources();
      } else {
        toast.error(data.detail || 'Failed to initialize sample database.');
      }
    } catch (err) {
      toast.error('Failed to seed sample database.');
    } finally {
      setSeeding(false);
    }
  };

  const handleDeleteSource = async (sourceId, sourceName) => {
    if (!window.confirm(`Are you sure you want to remove the database connection "${sourceName}"?`)) {
      return;
    }
    setDeletingId(sourceId);
    try {
      const res = await authenticatedFetch(`/database/${sourceId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Database connection removed.');
        fetchSources();
      } else {
        toast.error(data.detail || 'Failed to remove database connection.');
      }
    } catch (err) {
      toast.error('Failed to remove database connection.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors duration-200 overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-8 lg:p-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold tracking-tight">
              Database Sources & Connections
            </h1>
            <p className="text-sm text-light-muted dark:text-dark-muted">
              Configure, test, and switch target databases for natural language SQL analytics
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button 
              variant="outline" 
              size="md" 
              onClick={handleSeedSampleDB} 
              disabled={seeding}
              className="gap-2 shadow-sm text-xs font-semibold"
            >
              <Sparkles size={15} className="text-accent-secondary" />
              <span>{seeding ? 'Initializing...' : 'Reset Sample DB Data'}</span>
            </Button>

            <Button 
              variant="primary" 
              size="md" 
              onClick={() => setIsModalOpen(true)} 
              className="gap-2 shadow-sm text-xs font-semibold"
            >
              <Plus size={16} />
              <span>Connect Database</span>
            </Button>
          </div>
        </div>

        {/* Database List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sources.map((source) => (
              <DatabaseCard 
                key={source.id} 
                database={source} 
                onSetActive={handleSetActive}
                activatingId={activatingId}
                onDelete={handleDeleteSource}
                deletingId={deletingId}
              />
            ))}
          </div>
        )}

        {/* Setup Database Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Connect a New Database"
          size="md"
        >
          <form className="space-y-4">
            {/* Database Engine Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted mb-2">
                Database Engine
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['SQLite', 'PostgreSQL', 'MySQL'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleDbTypeChange(type)}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                      dbType === type
                        ? 'bg-accent-primary text-white border-accent-primary shadow-sm'
                        : 'bg-light-hover dark:bg-dark-hover border-light-border dark:border-dark-border text-light-text dark:text-dark-text hover:border-accent-primary/50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted mb-1.5">
                Display Label
              </label>
              <Input
                type="text"
                placeholder="e.g. Production Sales DB"
                value={dbNameLabel}
                onChange={(e) => setDbNameLabel(e.target.value)}
              />
            </div>

            {dbType !== 'SQLite' ? (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted mb-1.5">
                      Host Address
                    </label>
                    <Input
                      type="text"
                      placeholder="localhost or ip"
                      value={host}
                      onChange={(e) => setHost(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted mb-1.5">
                      Port
                    </label>
                    <Input
                      type="number"
                      value={port}
                      onChange={(e) => setPort(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted mb-1.5">
                    Database Name
                  </label>
                  <Input
                    type="text"
                    placeholder="askdb"
                    value={dbName}
                    onChange={(e) => setDbName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted mb-1.5">
                      Username
                    </label>
                    <Input
                      type="text"
                      placeholder="postgres / root"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted mb-1.5">
                      Password
                    </label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted mb-1.5">
                  SQLite Database Path
                </label>
                <Input
                  type="text"
                  placeholder="sqlite.db or relative/absolute path"
                  value={dbName}
                  onChange={(e) => setDbName(e.target.value)}
                />
                <span className="text-[11px] text-light-muted dark:text-dark-muted mt-1 block">
                  Tip: Use <code className="bg-light-hover dark:bg-dark-hover px-1 rounded">sqlite.db</code> to connect the local seeded SQLite database.
                </span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-light-border dark:border-dark-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTestConnection}
                disabled={testing || connecting}
                className="text-xs"
              >
                {testing ? 'Testing...' : 'Test Connection'}
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleConnectDatabase}
                  disabled={testing || connecting}
                >
                  {connecting ? 'Saving...' : 'Connect & Save'}
                </Button>
              </div>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
};

export default DatabasePage;
