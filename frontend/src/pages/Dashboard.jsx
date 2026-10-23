import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, Sparkles, CheckCircle2, 
  Clock, Database, Search, ArrowRight 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/layout/Sidebar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatCard from '../components/ui/StatCard';

const Dashboard = () => {
  const { user, authenticatedFetch } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [statsData, setStatsData] = useState({
    total_queries: 0,
    queries_today: 0,
    successful_queries: 0,
    success_rate: '100%',
    avg_latency: '1.2s'
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await authenticatedFetch('/history/stats');
        if (res.ok) {
          const data = await res.json();
          setStatsData(data);
        }
      } catch (err) {
        // Retain defaults
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { 
      title: 'Total Queries Executed', 
      value: String(statsData.total_queries || '0'), 
      change: '+100%', 
      icon: MessageSquare, 
      note: 'Lifetime executions' 
    },
    { 
      title: 'Successful Queries', 
      value: String(statsData.successful_queries || '0'), 
      change: statsData.success_rate, 
      icon: CheckCircle2, 
      note: 'Execution success rate' 
    },
    { 
      title: 'Avg. Execution Latency', 
      value: statsData.avg_latency || '18ms', 
      change: 'Real-time', 
      icon: Clock, 
      note: 'Query performance' 
    },
    { 
      title: 'Active Data Engine', 
      value: 'SQLite / PG', 
      change: 'Connected', 
      icon: Database, 
      note: 'Enterprise analytical engine' 
    }
  ];

  const suggestedQuestions = [
    'Show me the top 5 customers by revenue.',
    'Compare total sales by region.',
    'What is the monthly revenue trend?',
    'Show sales only for Gujarat region.',
    'Which products are selling the most?'
  ];

  const handleAsk = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate('/chat', { state: { initialQuery: query } });
    }
  };

  const handleSuggestedClick = (q) => {
    navigate('/chat', { state: { initialQuery: q } });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="flex h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors duration-200 overflow-hidden">
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8 lg:p-10 space-y-8">
        {/* Header Greeting */}
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold tracking-tight">
              {getGreeting()}, {user?.name || 'Analyst'}
            </h1>
            <p className="text-sm text-light-muted dark:text-dark-muted">
              What business data insights would you like to explore today?
            </p>
          </div>
          
          {/* Active AI Analyst badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-accent-secondary/15 border border-accent-secondary/20 text-accent-secondary rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles size={12} className="animate-pulse" />
            <span>ASKDB AI ACTIVE</span>
          </div>
        </div>

        {/* Large Natural Language Query Input */}
        <Card variant="glass" className="p-6 md:p-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-accent-primary/5 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32"></div>

          <form onSubmit={handleAsk} className="relative flex flex-col gap-4">
            <h3 className="text-sm font-bold text-light-text dark:text-dark-text tracking-wide uppercase">
              AI Query Box
            </h3>
            
            <div className="relative flex items-center">
              <div className="absolute left-4 text-light-muted dark:text-dark-muted">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Ask anything about your database... e.g. 'Show top 5 customers by revenue'"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-12 pr-32 py-4 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl text-sm md:text-base text-light-text dark:text-dark-text placeholder-light-muted dark:placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary dark:focus:border-accent-primary transition-all shadow-sm"
              />
              <div className="absolute right-3.5">
                <Button type="submit" variant="primary" size="md" className="gap-2">
                  <span>Ask AskDB</span>
                  <ArrowRight size={14} />
                </Button>
              </div>
            </div>
          </form>

          {/* Quick recommendations grid */}
          <div className="mt-6 space-y-2.5 relative">
            <span className="text-[10px] font-bold text-light-muted dark:text-dark-muted uppercase tracking-wider block">
              Recommended Analytical Questions
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestedClick(q)}
                  className="flex items-center justify-between text-left p-3.5 bg-light-hover/40 dark:bg-dark-hover/20 hover:bg-light-hover dark:hover:bg-dark-hover border border-light-border dark:border-dark-border rounded-xl transition-all group duration-200 outline-none"
                >
                  <span className="text-xs font-medium text-light-text dark:text-dark-text leading-tight group-hover:text-accent-primary transition-colors">
                    {q}
                  </span>
                  <ArrowRight size={12} className="text-light-muted dark:text-dark-muted opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-200 flex-shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Live stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <StatCard key={idx} {...stat} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
