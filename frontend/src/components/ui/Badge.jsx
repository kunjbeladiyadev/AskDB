import React from 'react';

const Badge = ({
  children,
  variant = 'neutral', // 'primary', 'secondary', 'success', 'warning', 'error', 'neutral'
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border';

  const variants = {
    primary: 'bg-accent-primary/10 text-accent-primary border-accent-primary/20',
    secondary: 'bg-accent-secondary/10 text-accent-secondary border-accent-secondary/20',
    success: 'bg-accent-success/10 text-accent-success border-accent-success/20',
    warning: 'bg-accent-warning/10 text-accent-warning border-accent-warning/20',
    error: 'bg-accent-error/10 text-accent-error border-accent-error/20',
    neutral: 'bg-light-hover dark:bg-dark-hover text-light-muted dark:text-dark-muted border-light-border dark:border-dark-border',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};

export default Badge;
