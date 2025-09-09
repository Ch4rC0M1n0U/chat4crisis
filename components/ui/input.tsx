import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type = 'text', ...props }, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      className={cn('flex h-9 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-1 text-sm placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50', className)}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export default Input;
