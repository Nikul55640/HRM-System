import React from 'react';
import { cn } from '../../lib/utils';

const Alert = React.forwardRef(({ className, variant = 'default', ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(
      "relative w-full rounded-lg border p-4",
      {
        'bg-background text-foreground': variant === 'default',
        'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive': variant === 'destructive',
        'border-yellow-500/50 text-yellow-600 bg-yellow-50 [&>svg]:text-yellow-600': variant === 'warning',
        'border-green-500/50 text-green-600 bg-green-50 [&>svg]:text-green-600': variant === 'success',
        'border-blue-500/50 text-blue-600 bg-blue-50 [&>svg]:text-blue-600': variant === 'info',
      },
      className
    )}
    {...props}
  />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };