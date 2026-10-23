import React from 'react';

const Card = ({
  children,
  className = '',
  onClick,
  variant = 'default', // 'default', 'glass', 'outline'
  hoverEffect = false,
  ...props
}) => {
  const baseStyles = 'rounded-xl transition-all duration-300';
  
  const variants = {
    default: 'bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border',
    glass: 'bg-white/40 dark:bg-dark-card/40 backdrop-blur-md border border-light-border/40 dark:border-dark-border/40 shadow-glass-light dark:shadow-glass-dark',
    outline: 'border border-dashed border-light-border dark:border-dark-border bg-transparent',
  };

  const hoverStyles = hoverEffect 
    ? 'hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-2xl hover:border-accent-primary/20 dark:hover:border-accent-primary/20' 
    : '';

  return (
    <div
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
