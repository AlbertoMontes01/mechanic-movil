import React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef(({ className, type = 'text', ...props }, ref) => {
  return <input type={type} ref={ref} className={cn('input-base', className)} {...props} />;
});
Input.displayName = 'Input';
