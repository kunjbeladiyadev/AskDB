import React from 'react';
import { Database, HardDrive, RefreshCw, CheckCircle2, Zap, Trash2 } from 'lucide-react';
import Card from './Card';
import Badge from './Badge';
import Button from './Button';

const DatabaseCard = ({ database, onSetActive, activatingId, onDelete, deletingId }) => {
  const { id, name, db_type, database_name, host, port, status, is_active, last_synced } = database;
  const isActivating = activatingId === id;
  const isDeleting = deletingId === id;

  return (
    <Card 
      hoverEffect={true} 
      className={`p-6 relative overflow-hidden flex flex-col justify-between transition-all duration-200 ${
        is_active 
          ? 'border-2 border-accent-primary shadow-lg shadow-accent-primary/10 bg-accent-primary/5 dark:bg-accent-primary/10' 
          : 'border border-light-border dark:border-dark-border'
      }`}
    >
      {/* Background decoration */}
      <div className="absolute right-0 top-0 -mr-6 -mt-6 p-12 text-slate-100/5 dark:text-slate-900/10 pointer-events-none">
        <Database size={120} />
      </div>

      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl border ${
              is_active 
                ? 'bg-accent-primary text-white border-accent-primary shadow-md shadow-accent-primary/25' 
                : 'bg-light-hover dark:bg-dark-hover border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted'
            }`}>
              <HardDrive size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-light-text dark:text-dark-text truncate max-w-[170px]" title={name || database_name}>
                {name || database_name}
              </h4>
              <span className="text-xs text-light-muted dark:text-dark-muted font-mono block truncate max-w-[170px]">
                {db_type} &bull; {database_name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {is_active ? (
              <Badge variant="success" className="gap-1 shadow-sm font-bold text-[10px] !py-0.5">
                <CheckCircle2 size={10} />
                <span>ACTIVE</span>
              </Badge>
            ) : (
              <Badge variant="neutral" className="text-[10px] !py-0.5">
                {status || 'Ready'}
              </Badge>
            )}

            {/* Delete button */}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(id, name || database_name)}
                disabled={isDeleting}
                className="!p-1.5 text-light-muted dark:text-dark-muted hover:!text-accent-error hover:!bg-accent-error/15 rounded-lg transition-colors"
                title="Delete this database connection"
              >
                <Trash2 size={14} className={isDeleting ? "animate-pulse" : ""} />
              </Button>
            )}
          </div>
        </div>

        {/* Connection attributes */}
        <div className="mt-5 space-y-2 border-t border-light-border dark:border-dark-border pt-4 text-xs">
          <div className="flex justify-between">
            <span className="text-light-muted dark:text-dark-muted">Host</span>
            <span className="font-medium text-light-text dark:text-dark-text font-mono truncate max-w-[150px]">{host}</span>
          </div>
          {port > 0 && (
            <div className="flex justify-between">
              <span className="text-light-muted dark:text-dark-muted">Port</span>
              <span className="font-medium text-light-text dark:text-dark-text font-mono">{port}</span>
            </div>
          )}
          <div className="flex justify-between items-center text-[10px] text-light-muted dark:text-dark-muted mt-2 pt-2 border-t border-light-border/40 dark:border-dark-border/40">
            <div className="flex items-center gap-1">
              <RefreshCw size={10} className={is_active ? "animate-spin text-accent-primary" : ""} style={{ animationDuration: '6s' }} />
              <span>Status: {is_active ? 'Currently Queried by AI' : 'Connected'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-5 pt-3 border-t border-light-border/60 dark:border-dark-border/60 flex items-center justify-between">
        {is_active ? (
          <span className="text-xs font-semibold text-accent-primary flex items-center gap-1.5 w-full justify-center py-1">
            <Zap size={13} className="fill-accent-primary" />
            <span>Target for Chat & SQL queries</span>
          </span>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSetActive(id)}
            disabled={isActivating}
            className="w-full text-xs font-bold gap-1.5 hover:bg-accent-primary hover:text-white transition-all"
          >
            <Zap size={13} />
            <span>{isActivating ? 'Switching...' : 'Set as Active Database'}</span>
          </Button>
        )}
      </div>
    </Card>
  );
};

export default DatabaseCard;
