import React, { useState, useEffect } from 'react';

const LoadingIndicator = ({ type = 'spinner', ...props }) => {
  if (type === 'spinner') {
    return (
      <div className="flex justify-center items-center py-4" {...props}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
      </div>
    );
  }

  if (type === 'skeleton') {
    return (
      <div className="w-full space-y-3 animate-pulse" {...props}>
        <div className="h-4 bg-light-border dark:bg-dark-border rounded w-3/4"></div>
        <div className="h-4 bg-light-border dark:bg-dark-border rounded w-1/2"></div>
        <div className="h-4 bg-light-border dark:bg-dark-border rounded w-5/6"></div>
      </div>
    );
  }

  if (type === 'ai') {
    return <AILoader {...props} />;
  }

  return null;
};

const AILoader = () => {
  const steps = [
    { id: 1, label: 'Understanding your question...' },
    { id: 2, label: 'Retrieving database schema context...' },
    { id: 3, label: 'Generating optimized SQL query...' }
  ];
  
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep(prev => (prev < 3 ? prev + 1 : 1));
    }, 1500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col gap-4 py-4 px-6 bg-light-hover dark:bg-dark-hover rounded-xl border border-light-border dark:border-dark-border max-w-md">
      <div className="flex items-center gap-3">
        {/* Animated pulse dots */}
        <div className="flex space-x-1.5">
          <div className="w-2.5 h-2.5 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2.5 h-2.5 bg-accent-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2.5 h-2.5 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        <span className="text-xs font-semibold text-accent-primary tracking-wider uppercase">AskDB AI is thinking</span>
      </div>

      <div className="flex flex-col gap-2.5 mt-1">
        {steps.map((step) => {
          const isPassed = step.id < activeStep;
          const isActive = step.id === activeStep;
          
          return (
            <div key={step.id} className="flex items-center gap-3">
              <div className="flex items-center justify-center">
                {isPassed ? (
                  <span className="text-accent-success text-sm">✓</span>
                ) : isActive ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-secondary animate-ping"></span>
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-light-border dark:bg-dark-border"></span>
                )}
              </div>
              <span className={`text-xs transition-colors duration-300 ${
                isActive 
                  ? 'text-light-text dark:text-dark-text font-medium' 
                  : isPassed 
                    ? 'text-light-muted/60 dark:text-dark-muted/60 line-through' 
                    : 'text-light-muted dark:text-dark-muted'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LoadingIndicator;
export { AILoader };
