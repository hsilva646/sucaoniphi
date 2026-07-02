import React from 'react';
import { cn } from '@/utils/cn';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({ size = 'md', className }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <motion.div
        className={cn('border-2 border-gray-200 dark:border-dark-border border-t-teal rounded-full', sizeClasses[size])}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
}

const Badge: React.FC<BadgeProps> = ({ className, variant = 'default', size = 'sm', children, ...props }) => {
  const variantClasses = {
    default: 'bg-teal/10 text-teal dark:bg-teal/20 dark:text-teal-light',
    success: 'bg-financial-green/10 text-financial-green dark:bg-financial-green/20',
    warning: 'bg-accent-gold/10 text-accent-gold dark:bg-accent-gold/20',
    error: 'bg-financial-red/10 text-financial-red dark:bg-financial-red/20',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

interface SkeletonProps extends HTMLMotionProps<'div'> {
  count?: number;
}

const Skeleton: React.FC<SkeletonProps> = ({ count = 1, className, ...props }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className={cn('bg-gray-200 dark:bg-dark-border rounded-lg', className)}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          {...props}
        />
      ))}
    </>
  );
};

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, position = 'top' }) => {
  const [isVisible, setIsVisible] = React.useState(false);

  const positionClasses = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
  };

  return (
    <div className="relative inline-block">
      <div onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)}>
        {children}
      </div>
      {isVisible && (
        <motion.div
          className={cn(
            'absolute z-50 px-2 py-1 text-sm text-white bg-gray-900 dark:bg-gray-800 rounded whitespace-nowrap',
            positionClasses[position]
          )}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          {content}
        </motion.div>
      )}
    </div>
  );
};

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose?: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'info', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeClasses = {
    success: 'bg-financial-green text-white',
    error: 'bg-financial-red text-white',
    info: 'bg-blue-500 text-white',
    warning: 'bg-accent-gold text-white',
  };

  return (
    <motion.div
      className={cn('fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-card-lg', typeClasses[type])}
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      {message}
    </motion.div>
  );
};

export { Loader, Badge, Skeleton, Tooltip, Toast };
