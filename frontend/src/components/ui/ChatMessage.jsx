import React from 'react';
import { User, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import DataVisualizer from './DataVisualizer';
import Badge from './Badge';

const ChatMessage = ({ message, onRerun }) => {
  const { 
    role, 
    text, 
    sql, 
    status, 
    columns = [], 
    data = [], 
    rowCount = 0, 
    executionTimeMs = 0, 
    chart_config, 
    error 
  } = message;
  const isUser = role === 'user';
  const isError = status === 'failed' || !!error;

  return (
    <div className={`flex w-full gap-4 p-5 rounded-2xl transition-colors duration-200 ${
      isUser 
        ? 'bg-transparent flex-row-reverse' 
        : 'bg-light-hover/50 dark:bg-dark-hover/40 border border-light-border/40 dark:border-dark-border/40'
    }`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-xl border ${
        isUser 
          ? 'bg-accent-primary/10 text-accent-primary border-accent-primary/20' 
          : isError
            ? 'bg-accent-error/15 text-accent-error border-accent-error/30'
            : 'bg-gradient-to-tr from-accent-primary to-accent-secondary text-white border-transparent'
      }`}>
        {isUser ? <User size={18} /> : isError ? <AlertCircle size={17} /> : <Sparkles size={16} />}
      </div>

      {/* Message Content */}
      <div className={`flex flex-col gap-3 w-full max-w-[92%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Username/Label & Status */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-light-muted dark:text-dark-muted uppercase tracking-wider">
            {isUser ? 'You' : 'AskDB AI Analyst'}
          </span>
          {!isUser && status && (
            <Badge variant={isError ? 'error' : 'success'} className="text-[10px] !py-0 !px-1.5 gap-1">
              {isError ? <AlertCircle size={9} /> : <CheckCircle2 size={9} />}
              <span>{isError ? 'Failed' : 'Executed'}</span>
            </Badge>
          )}
        </div>

        {/* Text bubble */}
        <div className={`text-sm leading-relaxed ${
          isUser 
            ? 'px-4.5 py-2.5 bg-accent-primary text-white rounded-2xl rounded-tr-none shadow-sm' 
            : 'text-light-text dark:text-dark-text'
        }`}>
          {text}
        </div>

        {/* Error message banner */}
        {!isUser && error && (
          <div className="w-full p-3.5 bg-accent-error/10 border border-accent-error/30 rounded-xl text-xs text-accent-error flex items-start gap-2.5">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Execution Error:</span>
              <span className="font-mono">{error}</span>
            </div>
          </div>
        )}

        {/* Interactive Data Visualizer (Chart + Table + SQL) */}
        {!isUser && (sql || (data && data.length > 0)) && (
          <div className="w-full">
            <DataVisualizer
              sql={sql}
              columns={columns}
              data={data}
              rowCount={rowCount}
              executionTimeMs={executionTimeMs}
              chartConfig={chart_config}
              onRerun={onRerun}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
