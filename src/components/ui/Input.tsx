import React from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, icon, endIcon, type = 'text', ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
            {icon}
          </span>
        )}
        <input
          type={type}
          className={cn(
            'w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-border dark:bg-dark-surface dark:text-white transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent',
            icon && 'pl-10',
            endIcon && 'pr-10',
            error && 'border-financial-red focus:ring-financial-red',
            className
          )}
          ref={ref}
          {...props}
        />
        {endIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
            {endIcon}
          </span>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-financial-red">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  )
);
Input.displayName = 'Input';

export { Input };
