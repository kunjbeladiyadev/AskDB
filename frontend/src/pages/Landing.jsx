import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, MessageSquare, Database, Cpu, 
  ShieldAlert, BarChart3, HelpCircle, Sparkles, CheckCircle2 
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const Landing = () => {
  const navigate = useNavigate();
  const [mockupState, setMockupState] = useState('idle'); // idle, typing, generating, result

  useEffect(() => {
    const interval = setInterval(() => {
      setMockupState(prev => {
        if (prev === 'idle') return 'typing';
        if (prev === 'typing') return 'generating';
        if (prev === 'generating') return 'result';
        return 'idle';
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const steps = [
    { id: 1, title: 'Ask a Question', desc: 'Ask business questions in plain English.', status: 'active' },
    { id: 2, title: 'Retrieve Schema', desc: 'Retrieve table schema mapping context.', status: 'active' },
    { id: 3, title: 'Generate SQL', desc: 'LLM translates your question to exact SQL.', status: 'active' },
    { id: 4, title: 'Validate & Execute', desc: 'SQL sandbox executes safe read-only queries.', status: 'coming' },
    { id: 5, title: 'Explain & Visualize', desc: 'Extract results, chart coordinates and descriptions.', status: 'coming' },
    { id: 6, title: 'Answer in Chat', desc: 'Deliver graphs and written breakdowns to the user.', status: 'coming' }
  ];

  const features = [
    { 
      title: 'Natural Language Queries', 
      desc: 'Ask questions using plain English and conversational text.', 
      status: 'active' 
    },
    { 
      title: 'AI SQL Generation', 
      desc: 'Instantly convert complex requirements into precise SQL statements.', 
      status: 'active' 
    },
    { 
      title: 'Schema-Aware AI', 
      desc: 'AI references real table properties, preventing table name hallucinations.', 
      status: 'active' 
    },
    { 
      title: 'Safe Query Execution', 
      desc: 'Strict SELECT-only filtering blocks destructive script modifications.', 
      status: 'coming' 
    },
    { 
      title: 'AI Insights', 
      desc: 'Explains query outputs in clean, accessible summaries.', 
      status: 'coming' 
    },
    { 
      title: 'Smart Visualization', 
      desc: 'Auto-detects data trends and builds interactive Recharts widgets.', 
      status: 'coming' 
    }
  ];

  const techStack = [
    { name: 'React', desc: 'Frontend Layout Framework' },
    { name: 'Tailwind CSS', desc: 'Premium Glassmorphic Styling' },
    { name: 'FastAPI', desc: 'High-Performance Python Web Engine' },
    { name: 'PostgreSQL', desc: 'Primary Relational Database Store' },
    { name: 'ChromaDB', desc: 'Vector Semantics Metadata Registry' },
    { name: 'Groq API', desc: 'Sub-second LLM Inference Engine' },
    { name: 'JWT Auth', desc: 'Stateless JWT Session Verification' },
    { name: 'Bcrypt', desc: 'Safe Salted Password Cryptography' },
    { name: 'Recharts', desc: 'Interactive Canvas SVG Data Rendering' }
  ];

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors duration-200">
      <Navbar />

      {/* Hero Section */}
      <section id="hero" className="max-w-7xl mx-auto px-6 pt-16 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-primary/10 border border-accent-primary/20 text-accent-primary rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} className="animate-spin" style={{ animationDuration: '4s' }} />
            <span>AI-Powered Database Analytics</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] bg-gradient-to-tr from-light-text to-slate-500 dark:from-white dark:to-slate-500 bg-clip-text text-transparent">
            Ask your database <span className="bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">anything.</span>
          </h1>

          <p className="text-sm md:text-base text-light-muted dark:text-dark-muted max-w-xl leading-relaxed">
            AskDB turns natural language questions into secure SQL queries and helps business teams understand database trends without writing a single line of code.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="primary" size="lg" onClick={() => navigate('/signup')} className="gap-2 shadow-lg shadow-accent-primary/20">
              <span>Start Asking</span>
              <ArrowRight size={16} />
            </Button>
            <Button variant="outline" size="lg" onClick={() => {
              document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
            }}>
              See How It Works
            </Button>
          </div>
        </div>

        {/* Hero Mockup Widget */}
        <div className="lg:col-span-6">
          <Card variant="glass" className="w-full overflow-hidden border-light-border/60 dark:border-dark-border/60 shadow-2xl">
            {/* Mockup Title bar */}
            <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <span className="text-[10px] font-bold text-slate-500 font-mono tracking-widest uppercase">
                ASKDB CLIENT MOCKUP
              </span>
              <div className="w-12"></div>
            </div>

            {/* Mockup Screen body */}
            <div className="p-6 bg-slate-950 font-mono text-xs text-slate-300 space-y-5 min-h-[260px] flex flex-col justify-center">
              {/* Question Input */}
              <div className="flex gap-3 items-start">
                <span className="text-accent-secondary font-bold select-none">&gt;</span>
                <div>
                  <span className="text-white font-bold">User: </span>
                  <span className={mockupState === 'idle' ? 'opacity-30' : ''}>
                    {mockupState === 'idle' && 'Waiting for typing...'}
                    {mockupState !== 'idle' && '"Show me the top 5 products by revenue this month."'}
                  </span>
                </div>
              </div>

              {/* Steps Animation */}
              {mockupState === 'typing' && (
                <div className="flex items-center gap-2 text-accent-primary animate-pulse pl-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-ping"></span>
                  <span>Analyzing question structure...</span>
                </div>
              )}

              {mockupState === 'generating' && (
                <div className="space-y-1.5 pl-5">
                  <div className="flex items-center gap-2 text-accent-secondary">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-secondary animate-ping"></span>
                    <span>Finding schema mapping references...</span>
                  </div>
                  <div className="text-slate-500 text-[10px] pl-3">
                    Found matching tables: [products, sales]
                  </div>
                </div>
              )}

              {/* Output SQL */}
              {mockupState === 'result' && (
                <div className="space-y-3 pl-5 animate-fade-in">
                  <div className="flex items-center gap-1.5 text-accent-success font-semibold">
                    <CheckCircle2 size={12} />
                    <span>SQL Generated Successfully:</span>
                  </div>
                  <pre className="p-4 bg-slate-900 border border-slate-800 rounded-lg text-[11px] leading-relaxed text-indigo-300 overflow-x-auto">
                    <code>
                      <span className="text-amber-400 font-bold">SELECT</span> p.name, <span className="text-amber-400 font-bold">SUM</span>(s.amount) <span className="text-amber-400 font-bold">AS</span> total_revenue{'\n'}
                      <span className="text-amber-400 font-bold">FROM</span> products p{'\n'}
                      <span className="text-amber-400 font-bold">JOIN</span> sales s <span className="text-amber-400 font-bold">ON</span> p.id = s.product_id{'\n'}
                      <span className="text-amber-400 font-bold">GROUP BY</span> p.name{'\n'}
                      <span className="text-amber-400 font-bold">ORDER BY</span> total_revenue <span className="text-amber-400 font-bold">DESC</span>{'\n'}
                      <span className="text-amber-400 font-bold">LIMIT</span> 5;
                    </code>
                  </pre>
                </div>
              )}
            </div>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-24 border-t border-light-border/40 dark:border-dark-border/40">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl font-extrabold tracking-tight text-light-text dark:text-dark-text">
            How AskDB Works
          </h2>
          <p className="text-sm text-light-muted dark:text-dark-muted">
            Our pipeline translates natural English request queries into validated, executable database lookups in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => (
            <Card key={step.id} variant={step.status === 'coming' ? 'outline' : 'default'} className="p-6 flex flex-col justify-between min-h-[160px] relative">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-black text-light-border dark:text-dark-border font-mono">
                    0{step.id}
                  </span>
                  {step.status === 'coming' ? (
                    <Badge variant="neutral" className="!text-[10px]">
                      Phase 2
                    </Badge>
                  ) : (
                    <Badge variant="primary" className="!text-[10px]">
                      Active
                    </Badge>
                  )}
                </div>
                <h4 className="text-sm font-bold text-light-text dark:text-dark-text mb-2">
                  {step.title}
                </h4>
                <p className="text-xs text-light-muted dark:text-dark-muted leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24 border-t border-light-border/40 dark:border-dark-border/40">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl font-extrabold tracking-tight text-light-text dark:text-dark-text">
            Platform Features
          </h2>
          <p className="text-sm text-light-muted dark:text-dark-muted">
            A comprehensive overview of implemented services and upcoming phase components.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, idx) => {
            const icons = [MessageSquare, Cpu, Database, ShieldAlert, Sparkles, BarChart3];
            const FeatIcon = icons[idx];

            return (
              <Card key={idx} className="p-6 relative overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 bg-accent-primary/10 rounded-xl text-accent-primary">
                      <FeatIcon size={18} />
                    </div>
                    {feat.status === 'coming' ? (
                      <Badge variant="neutral" className="!text-[10px]">
                        Coming Soon
                      </Badge>
                    ) : (
                      <Badge variant="success" className="!text-[10px]">
                        Implemented
                      </Badge>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-light-text dark:text-dark-text mb-2">
                    {feat.title}
                  </h4>
                  <p className="text-xs text-light-muted dark:text-dark-muted leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Technology Section */}
      <section id="technology" className="max-w-7xl mx-auto px-6 py-24 border-t border-light-border/40 dark:border-dark-border/40">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl font-extrabold tracking-tight text-light-text dark:text-dark-text">
            Built On Modern Architecture
          </h2>
          <p className="text-sm text-light-muted dark:text-dark-muted">
            Leveraging industry-standard frameworks to ensure data security and fast inference.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {techStack.map((tech, idx) => (
            <Card key={idx} hoverEffect={true} className="p-5 text-center flex flex-col items-center justify-center gap-2">
              <span className="text-sm font-bold text-light-text dark:text-dark-text">
                {tech.name}
              </span>
              <span className="text-[10px] text-light-muted dark:text-dark-muted leading-normal">
                {tech.desc}
              </span>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-light-border/45 dark:border-dark-border/45 py-12 bg-white/20 dark:bg-dark-card/10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-light-muted dark:text-dark-muted">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-accent-primary to-accent-secondary flex items-center justify-center text-white font-bold text-[10px]">
              A
            </div>
            <span className="font-semibold text-light-text dark:text-dark-text">AskDB — AI Data Analyst</span>
          </div>
          <span>&copy; 2026 AskDB Corporation. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
