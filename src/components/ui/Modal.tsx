import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  overlayClosable?: boolean;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  showCloseButton = true,
  overlayClosable = true,
  className,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  };

  if (!isOpen && !isAnimating) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        'transition-opacity duration-300'
      )}
    >
      {/* Overlay */}
      <div
        className={cn(
          'absolute inset-0 bg-black transition-opacity duration-300',
          isOpen ? 'opacity-50' : 'opacity-0'
        )}
        onClick={overlayClosable ? onClose : undefined}
      />

      {/* Modal */}
      <div
        className={cn(
          'relative bg-white dark:bg-dark-surface rounded-xl shadow-card-lg max-w-full w-full mx-4',
          sizeClasses[size],
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
          'transition-all duration-300',
          className
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-dark-border">
            <div className="flex-1">
              {title && (
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="p-6 border-t border-gray-200 dark:border-dark-border">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export { Modal };
