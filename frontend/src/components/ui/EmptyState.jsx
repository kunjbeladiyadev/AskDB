import React from 'react';
import Button from './Button';

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onActionClick,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 border border-dashed border-light-border dark:border-dark-border rounded-2xl bg-white/10 dark:bg-dark-card/5 backdrop-blur-sm ${className}`}
      {...props}
    >
      {Icon && (
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-light-hover dark:bg-dark-hover text-light-muted dark:text-dark-muted mb-4 border border-light-border dark:border-dark-border">
          <Icon size={24} />
        </div>
      )}
      <h3 className="text-sm font-semibold text-light-text dark:text-dark-text mb-1">
        {title}
      </h3>
      <p className="text-xs text-light-muted dark:text-dark-muted max-w-sm mb-5">
        {description}
      </p>
      {actionLabel && onActionClick && (
        <Button variant="primary" size="sm" onClick={onActionClick}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
