import React from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ToastProvider = ToastPrimitives.Provider;

export const ToastViewport = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      'fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col gap-2 p-4 sm:max-w-[380px]',
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

export const Toast = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Root
    ref={ref}
    className={cn(
      'glass-card pointer-events-auto relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-md border border-white/10 p-4 shadow-lg',
      className
    )}
    {...props}
  />
));
Toast.displayName = ToastPrimitives.Root.displayName;

export const ToastClose = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn('absolute right-2 top-2 rounded-md text-muted-foreground hover:text-foreground', className)}
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

export const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Title ref={ref} className={cn('text-sm font-semibold text-foreground', className)} {...props} />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

export const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Description ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;
