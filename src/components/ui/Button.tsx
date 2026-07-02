import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-teal text-white hover:bg-teal/90 focus-visible:ring-teal',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-dark-border dark:text-white dark:hover:bg-dark-border/70',
        destructive: 'bg-financial-red text-white hover:bg-financial-red/90 focus-visible:ring-financial-red',
        outline: 'border-2 border-gray-300 bg-white text-gray-900 hover:bg-gray-50 dark:border-dark-border dark:bg-dark-surface dark:text-white dark:hover:bg-dark-border/30',
        ghost: 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-dark-border',
        success: 'bg-financial-green text-white hover:bg-financial-green/90 focus-visible:ring-financial-green',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, icon, children, disabled, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || isLoading}
      ref={ref}
      {...props}
    >
      {isLoading ? (
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      {children}
    </button>
  )
);
Button.displayName = 'Button';

export { Button, buttonVariants };
