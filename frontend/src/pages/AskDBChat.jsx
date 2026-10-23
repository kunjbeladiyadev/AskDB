import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Send, ArrowRight, MessageSquare, Database, Sparkles, HelpCircle, HardDrive } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/layout/Sidebar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ChatMessage from '../components/ui/ChatMessage';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import toast from 'react-hot-toast';

const AskDBChat = () => {
  const { authenticatedFetch } = useAuth();
  const location = useLocation();
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeDatabase, setActiveDatabase] = useState('AskDB Enterprise Sample DB');

  // Suggestions listed on empty state
  const defaultSuggestions = [
    'What are my top 10 customers by revenue?',
    'Show monthly revenue trend.',
    'Which region has the highest sales?',
    'Show sales only for Gujarat region.',
    'Which products are selling the most?'
  ];

  // Fetch active database source
  useEffect(() => {
    const fetchActiveDb = async () => {
      try {
        const res = await authenticatedFetch('/database/sources');
        if (res.ok) {
          const sources = await res.json();
          const active = sources.find(s => s.is_active);
          if (active) {
            setActiveDatabase(active.name || active.database_name);
          }
        }
      } catch (e) {
        // Fallback default
      }
    };
    fetchActiveDb();
  }, []);

  // Auto-scroll chat history
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Capture initial query sent from Dashboard
  useEffect(() => {
    if (location.state?.initialQuery) {
      handleSendMessage(location.state.initialQuery);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleSendMessage = async (textToSend) => {
    const queryText = textToSend || input;
    if (!queryText.trim()) return;

    // Add user message
    const userMessage = { role: 'user', text: queryText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await authenticatedFetch('/chat', {
        method: 'POST',
        body: JSON.stringify({ message: queryText }),
      });

      const data = await response.json();

      if (response.ok) {
        // Successful generation & execution
        const aiMessage = {
          role: 'assistant',
          text: data.explanation || "Here are the insights generated from your database.",
          sql: data.sql,
          status: data.status,
          columns: data.columns || [],
          data: data.data || [],
          rowCount: data.row_count || 0,
          executionTimeMs: data.execution_time_ms || 0,
          chart_config: data.chart_config,
          error: data.error
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(data.detail || 'Failed to generate and execute query');
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Server query failed. Providing simulated analytics.');

      // Client-side fallback with mock data and charts
      const mockResult = getClientMockResult(queryText);
      const aiMessage = {
        role: 'assistant',
        text: mockResult.explanation,
        sql: mockResult.sql,
        status: 'simulated',
        columns: mockResult.columns,
        data: mockResult.data,
        rowCount: mockResult.data.length,
        executionTimeMs: 14.8,
        chart_config: mockResult.chart_config
      };

      setTimeout(() => {
        setMessages(prev => [...prev, aiMessage]);
      }, 700);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRerun = async (sqlToRun) => {
    if (!sqlToRun) return;
    setIsLoading(true);
    try {
      const res = await authenticatedFetch('/chat/execute-raw', {
        method: 'POST',
        body: JSON.stringify({ sql: sqlToRun })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Query re-executed successfully!');
        const aiMessage = {
          role: 'assistant',
          text: `Re-executed SQL against ${activeDatabase}. Returned ${data.row_count} rows in ${data.execution_time_ms}ms.`,
          sql: data.sql,
          status: data.status,
          columns: data.columns || [],
          data: data.data || [],
          rowCount: data.row_count || 0,
          executionTimeMs: data.execution_time_ms || 0,
          chart_config: data.chart_config,
          error: data.error
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        toast.error(data.detail || 'Execution failed');
      }
    } catch (err) {
      toast.error('Failed to re-execute query.');
    } finally {
      setIsLoading(false);
    }
  };

  // Client-side mock fallback with rich rows & charts
  const getClientMockResult = (question) => {
    const q_lower = question.toLowerCase();

    if (q_lower.includes("customer")) {
      return {
        sql: `SELECT c.name AS customer_name, SUM(o.total_amount) AS total_revenue\nFROM customers c\nJOIN orders o ON c.id = o.customer_id\nGROUP BY c.name\nORDER BY total_revenue DESC\nLIMIT 5;`,
        explanation: "Calculated top 5 customer expenditures from order transaction history.",
        columns: ["customer_name", "total_revenue"],
        data: [
          { customer_name: "Quantum AI Systems", total_revenue: 12500 },
          { customer_name: "Nexus Enterprise Tech", total_revenue: 11000 },
          { customer_name: "Tokyo Robotics Ltd", total_revenue: 9800 },
          { customer_name: "Mumbai Financial Services", total_revenue: 8250 },
          { customer_name: "Global Logistics Corp", total_revenue: 7300 }
        ],
        chart_config: {
          chart_type: "bar",
          x_key: "customer_name",
          y_keys: ["total_revenue"],
          title: "Top 5 Customers by Revenue"
        }
      };
    }

    if (q_lower.includes("region") || q_lower.includes("sales")) {
      return {
        sql: `SELECT r.name AS region_name, SUM(o.total_amount) AS total_sales\nFROM regions r\nJOIN customers c ON r.id = c.region_id\nJOIN orders o ON c.id = o.customer_id\nGROUP BY r.name\nORDER BY total_sales DESC;`,
        explanation: "Aggregated sales totals across geographical regions.",
        columns: ["region_name", "total_sales"],
        data: [
          { region_name: "Gujarat", total_sales: 21700 },
          { region_name: "North America", total_sales: 20000 },
          { region_name: "Asia-Pacific", total_sales: 13950 },
          { region_name: "Karnataka", total_sales: 13598 },
          { region_name: "Europe", total_sales: 12800 },
          { region_name: "Maharashtra", total_sales: 12450 }
        ],
        chart_config: {
          chart_type: "bar",
          x_key: "region_name",
          y_keys: ["total_sales"],
          title: "Total Sales by Region"
        }
      };
    }

    if (q_lower.includes("month") || q_lower.includes("trend") || q_lower.includes("revenue")) {
      return {
        sql: `SELECT order_date AS sales_month, SUM(total_amount) AS monthly_revenue\nFROM orders\nGROUP BY sales_month\nORDER BY sales_month ASC;`,
        explanation: "Tracked monthly revenue performance across billing periods.",
        columns: ["sales_month", "monthly_revenue"],
        data: [
          { sales_month: "2024-01", monthly_revenue: 15699 },
          { sales_month: "2024-02", monthly_revenue: 28048 },
          { sales_month: "2024-03", monthly_revenue: 26100 },
          { sales_month: "2024-04", monthly_revenue: 22000 },
          { sales_month: "2024-05", monthly_revenue: 22650 }
        ],
        chart_config: {
          chart_type: "line",
          x_key: "sales_month",
          y_keys: ["monthly_revenue"],
          title: "Monthly Revenue Trend"
        }
      };
    }

    // Default mock
    return {
      sql: `SELECT p.name AS product_name, p.category, p.price\nFROM products p\nORDER BY p.price DESC\nLIMIT 6;`,
      explanation: "Retrieved product catalogue breakdown by category and pricing.",
      columns: ["product_name", "category", "price"],
      data: [
        { product_name: "Ultra-Performance Server Rack", category: "Hardware", price: 5500 },
        { product_name: "AI Analytics Suite Pro", category: "Software", price: 2499 },
        { product_name: "Automated Backup Appliance", category: "Hardware", price: 1800 },
        { product_name: "Annual Technical Support Plan", category: "Services", price: 1500 },
        { product_name: "Enterprise Cloud License", category: "Software", price: 1200 },
        { product_name: "Database Security Audit Module", category: "Software", price: 899 }
      ],
      chart_config: {
        chart_type: "bar",
        x_key: "product_name",
        y_keys: ["price"],
        title: "Product Pricing Comparison"
      }
    };
  };

  return (
    <div className="flex h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors duration-200 overflow-hidden">
      <Sidebar />

      {/* Chat Area Panel */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Top Navbar */}
        <div className="px-6 py-4 border-b border-light-border dark:border-dark-border flex items-center justify-between bg-light-card dark:bg-dark-card transition-colors duration-200">
          <div className="flex items-center gap-3">
            <MessageSquare size={18} className="text-accent-primary" />
            <div>
              <h2 className="text-sm font-bold text-light-text dark:text-dark-text uppercase tracking-wider">
                AskDB Analytics Session
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Active Database Badge with link to Database Page */}
            <Link
              to="/database"
              className="flex items-center gap-1.5 px-3 py-1 bg-light-hover dark:bg-dark-hover border border-light-border dark:border-dark-border hover:border-accent-primary text-light-text dark:text-dark-text rounded-full text-xs font-medium transition-all"
              title="Click to view or switch database"
            >
              <HardDrive size={12} className="text-accent-primary" />
              <span className="font-semibold text-accent-primary truncate max-w-[150px]">{activeDatabase}</span>
            </Link>

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-accent-secondary/15 border border-accent-secondary/25 text-accent-secondary rounded-full text-[11px] font-bold tracking-wider uppercase">
              <Sparkles size={11} className="animate-spin" style={{ animationDuration: '4s' }} />
              <span>AI Data Analyst Active</span>
            </div>
          </div>
        </div>

        {/* Scrollable Dialogue Screen */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {messages.length === 0 ? (
            /* Chat Empty State */
            <div className="max-w-2xl mx-auto flex flex-col items-center justify-center text-center py-10 space-y-8 h-full">
              <div className="space-y-2.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-accent-primary to-accent-secondary flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-accent-primary/25 mx-auto">
                  A
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight">
                  Ask questions. Get data & charts.
                </h1>
                <p className="text-xs text-light-muted dark:text-dark-muted max-w-sm mx-auto leading-relaxed">
                  Ask any question about your connected database in natural language. AskDB will write the SQL, execute it, and return interactive tables and charts.
                </p>
              </div>

              {/* Suggestions Grid */}
              <div className="w-full space-y-3">
                <span className="text-[10px] font-bold text-light-muted dark:text-dark-muted uppercase tracking-wider block">
                  Suggested Questions
                </span>
                <div className="grid grid-cols-1 gap-2 max-w-lg mx-auto">
                  {defaultSuggestions.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(s)}
                      className="flex items-center justify-between text-left p-3.5 bg-light-card dark:bg-dark-card hover:bg-light-hover dark:hover:bg-dark-hover border border-light-border dark:border-dark-border rounded-xl text-xs font-semibold leading-normal transition-all duration-200 outline-none text-light-text dark:text-dark-text group hover:border-accent-primary"
                    >
                      <span className="group-hover:text-accent-primary transition-colors">{s}</span>
                      <ArrowRight size={13} className="text-light-muted dark:text-dark-muted group-hover:translate-x-1 group-hover:text-accent-primary transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Render active conversation logs */
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((m, idx) => (
                <ChatMessage key={idx} message={m} onRerun={handleRerun} />
              ))}
              
              {/* Thinking state */}
              {isLoading && (
                <div className="flex gap-4 p-5 rounded-2xl bg-light-hover/50 dark:bg-dark-hover/40 border border-light-border/40 dark:border-dark-border/40 max-w-lg">
                  <LoadingIndicator type="ai" />
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Bottom Input Panel */}
        <div className="px-6 py-5 border-t border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card transition-colors duration-200">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="max-w-4xl mx-auto flex gap-3 items-center relative"
          >
            <input
              type="text"
              placeholder="Ask anything about your database... e.g. 'Show top 5 customers by revenue'"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="w-full pl-5 pr-14 py-3 bg-light-hover dark:bg-dark-hover border border-light-border dark:border-dark-border rounded-xl text-sm text-light-text dark:text-dark-text placeholder-light-muted dark:placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary dark:focus:border-accent-primary transition-all duration-200"
            />
            <div className="absolute right-2.5">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!input.trim() || isLoading}
                className="!p-2 rounded-lg"
              >
                <Send size={15} />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AskDBChat;
