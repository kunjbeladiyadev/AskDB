import React from 'react';

const Input = ({
  label,
  error,
  type = 'text',
  placeholder,
  value,
  onChange,
  className = '',
  required = false,
  helperText,
  icon: Icon,
  ...props
}) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold text-light-muted dark:text-dark-muted tracking-wider uppercase">
          {label} {required && <span className="text-accent-error">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 text-light-muted dark:text-dark-muted">
            <Icon size={16} />
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className={`w-full ${Icon ? 'pl-10' : 'pl-3.5'} pr-3.5 py-2.5 bg-white dark:bg-dark-card border rounded-lg text-sm text-light-text dark:text-dark-text placeholder-light-muted dark:placeholder-dark-muted transition-all duration-200 outline-none focus:ring-2 focus:ring-accent-primary/20 ${
            error
              ? 'border-accent-error focus:border-accent-error'
              : 'border-light-border dark:border-dark-border focus:border-accent-primary dark:focus:border-accent-primary'
          } ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs font-medium text-accent-error">{error}</span>}
      {!error && helperText && <span className="text-xs text-light-muted dark:text-dark-muted">{helperText}</span>}
    </div>
  );
};

export default Input;
