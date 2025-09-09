import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const variantClasses: Record<string, string> = {
  default: 'bg-indigo-600 text-white hover:bg-indigo-500',
  outline: 'border border-neutral-700 bg-transparent hover:bg-neutral-800',
  destructive: 'bg-red-600 text-white hover:bg-red-500',
  ghost: 'bg-transparent hover:bg-neutral-800',
};

const sizeClasses: Record<string, string> = {
  sm: 'h-8 px-2 text-xs',
  md: 'h-9 px-3',
  lg: 'h-11 px-4',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = 'default', size = 'md', ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-neutral-950 disabled:opacity-50 disabled:pointer-events-none',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
});
Button.displayName = 'Button';

export default Button;
