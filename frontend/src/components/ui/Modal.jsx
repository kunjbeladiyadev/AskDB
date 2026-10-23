import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md', // 'sm', 'md', 'lg', 'xl'
  className = '',
  ...props
}) => {
  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    '3xl': 'max-w-4xl',
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div
        className={`w-full ${sizes[size]} bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl shadow-xl overflow-hidden animate-slide-up ${className}`}
        {...props}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-light-border dark:border-dark-border">
          <h3 className="text-base font-semibold text-light-text dark:text-dark-text">
            {title}
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="!p-1 rounded-full">
            <X size={18} />
          </Button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
