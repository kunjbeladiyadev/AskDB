import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Eye, Copy, Trash2, CheckCircle2, AlertCircle, Clock, Play, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/layout/Sidebar';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import SQLViewer from '../components/ui/SQLViewer';
import toast from 'react-hot-toast';

const QueryHistory = () => {
  const { authenticatedFetch } = useAuth();
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSql, setSelectedSql] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const response = await authenticatedFetch('/history');
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not load query history from server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleCopy = async (sql) => {
    try {
      await navigator.clipboard.writeText(sql);
      toast.success('SQL copied to clipboard!');
    } catch {
      toast.error('Failed to copy.');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await authenticatedFetch(`/history/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setHistory(prev => prev.filter(item => item.id !== id));
        toast.success('Query removed from history.');
      } else {
        toast.error('Failed to delete query history.');
      }
    } catch {
      toast.error('Failed to delete query history.');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all query history?')) return;
    try {
      const res = await authenticatedFetch('/history', { method: 'DELETE' });
      if (res.ok) {
        setHistory([]);
        toast.success('All query history cleared.');
      }
    } catch {
      toast.error('Failed to clear history.');
    }
  };

  const handleView = (item) => {
    setSelectedQuestion(item.question);
    setSelectedSql(item.sql);
    setSelectedItem(item);
  };

  const handleRunInChat = (question) => {
    navigate('/chat', { state: { initialQuery: question } });
  };

  return (
    <div className="flex h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors duration-200 overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-8 lg:p-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-light-border dark:border-dark-border">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold tracking-tight">
              Query History & Audit Log
            </h1>
            <p className="text-sm text-light-muted dark:text-dark-muted">
              Track natural language requests, generated SQL, execution metrics, and results
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchHistory} className="gap-1.5 text-xs">
              <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </Button>
            {history.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleClearAll} className="gap-1.5 text-xs !text-accent-error hover:!bg-accent-error/10">
                <Trash2 size={13} />
                <span>Clear History</span>
              </Button>
            )}
          </div>
        </div>

        {/* History Table Card */}
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl"></div>
            ))}
          </div>
        ) : history.length === 0 ? (
          <Card variant="outline" className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="p-3 bg-light-hover dark:bg-dark-hover rounded-xl text-light-muted">
              <History size={24} />
            </div>
            <h4 className="text-sm font-bold">No query history yet</h4>
            <p className="text-xs text-light-muted dark:text-dark-muted max-w-xs">
              Go to the AskDB Chat session and ask questions to populate your analytics audit trail.
            </p>
            <Button variant="primary" size="sm" onClick={() => navigate('/chat')} className="mt-2 text-xs">
              Go to AskDB Chat
            </Button>
          </Card>
        ) : (
          <Card variant="default" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-light-hover/40 dark:bg-dark-hover/20 text-[10px] font-bold text-light-muted dark:text-dark-muted uppercase tracking-wider border-b border-light-border dark:border-dark-border">
                    <th className="px-6 py-4">Question</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Rows</th>
                    <th className="px-6 py-4">Latency</th>
                    <th className="px-6 py-4">Executed</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-border dark:divide-dark-border text-xs">
                  {history.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-light-hover/20 dark:hover:bg-dark-hover/5 transition-colors duration-150"
                    >
                      {/* Question Summary */}
                      <td className="px-6 py-4 max-w-sm">
                        <span className="font-bold text-light-text dark:text-dark-text block truncate" title={item.question}>
                          {item.question}
                        </span>
                        <span className="font-mono text-[10px] text-light-muted dark:text-dark-muted block truncate max-w-xs mt-0.5 opacity-80">
                          {item.sql.replace(/\n/g, ' ')}
                        </span>
                      </td>

                      {/* Status Tag */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          {item.status === 'Success' ? (
                            <Badge variant="success" className="gap-1">
                              <CheckCircle2 size={10} />
                              <span>Success</span>
                            </Badge>
                          ) : (
                            <Badge variant="error" className="gap-1">
                              <AlertCircle size={10} />
                              <span>Failed</span>
                            </Badge>
                          )}
                        </div>
                      </td>

                      {/* Rows count */}
                      <td className="px-6 py-4 font-mono text-light-muted dark:text-dark-muted">
                        {item.rowCount !== undefined ? item.rowCount : '-'}
                      </td>

                      {/* Execution time */}
                      <td className="px-6 py-4 font-mono text-light-muted dark:text-dark-muted">
                        {item.executionTime}
                      </td>

                      {/* Time ago */}
                      <td className="px-6 py-4 text-light-muted dark:text-dark-muted">
                        {item.date}
                      </td>

                      {/* Action buttons */}
                      <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRunInChat(item.question)}
                          className="!p-1.5 hover:!bg-accent-primary/10 hover:!text-accent-primary !text-light-muted dark:!text-dark-muted"
                          title="Run in Chat"
                        >
                          <Play size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(item)}
                          className="!p-1.5 hover:!bg-light-hover dark:hover:!bg-dark-hover !text-light-muted dark:!text-dark-muted hover:!text-light-text"
                          title="View SQL"
                        >
                          <Eye size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(item.sql)}
                          className="!p-1.5 hover:!bg-light-hover dark:hover:!bg-dark-hover !text-light-muted dark:!text-dark-muted hover:!text-light-text"
                          title="Copy SQL"
                        >
                          <Copy size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          className="!p-1.5 hover:!bg-accent-error/15 hover:!text-accent-error !text-light-muted dark:!text-dark-muted"
                          title="Delete Record"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* View Query SQL Modal */}
        <Modal
          isOpen={!!selectedSql}
          onClose={() => setSelectedSql(null)}
          title="Generated SQL Query Details"
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-light-muted dark:text-dark-muted uppercase tracking-wider block mb-1">
                Natural Language Question
              </span>
              <p className="text-xs font-semibold text-light-text dark:text-dark-text bg-light-hover/30 dark:bg-dark-hover/10 p-3.5 border border-light-border dark:border-dark-border rounded-lg leading-normal">
                "{selectedQuestion}"
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-light-muted dark:text-dark-muted uppercase tracking-wider block mb-1">
                Generated & Executed SQL
              </span>
              {selectedSql && <SQLViewer sql={selectedSql} />}
            </div>

            {selectedItem?.error && (
              <div className="p-3 bg-accent-error/10 border border-accent-error/30 rounded-xl text-xs text-accent-error">
                <span className="font-bold block mb-1">Execution Error:</span>
                <span className="font-mono">{selectedItem.error}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <Button 
                variant="primary" 
                size="sm" 
                onClick={() => {
                  setSelectedSql(null);
                  handleRunInChat(selectedQuestion);
                }}
                className="gap-1.5 text-xs"
              >
                <Play size={13} />
                <span>Re-run in AskDB Chat</span>
              </Button>

              <Button variant="outline" size="sm" onClick={() => setSelectedSql(null)}>
                Close Details
              </Button>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  );
};

export default QueryHistory;
