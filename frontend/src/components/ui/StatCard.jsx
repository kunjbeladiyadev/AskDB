import React from 'react';
import Card from './Card';

const StatCard = ({ title, value, change, icon: Icon, note }) => {
  return (
    <Card hoverEffect={true} className="p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs font-semibold text-light-muted dark:text-dark-muted tracking-wider uppercase">
          {title}
        </span>
        {Icon && (
          <div className="p-2 bg-light-hover dark:bg-dark-hover rounded-lg border border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted">
            <Icon size={16} />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2.5 mt-4">
        <span className="text-2xl font-bold text-light-text dark:text-dark-text tracking-tight">
          {value}
        </span>
        {change && (
          <span className={`text-xs font-medium ${
            change.startsWith('+') ? 'text-accent-success' : 'text-accent-error'
          }`}>
            {change}
          </span>
        )}
      </div>

      {(note || change) && (
        <span className="text-[10px] text-light-muted dark:text-dark-muted mt-2 block">
          {note || 'Compared to last week'}
        </span>
      )}
    </Card>
  );
};

export default StatCard;
