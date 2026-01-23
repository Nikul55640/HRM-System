/**
 * Alert Component
 * Reusable alert component for notifications and messages
 */

import React from 'react';
import { cn } from '../../lib/utils';

const Alert = ({ 
  variant = 'default',
  className, 
  children, 
  ...props 
}) => {
  const variants = {
    default: 'bg-white border-gray-200 text-gray-900',
    success: 'bg-green-50 border-green-200 text-green-900',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    error: 'bg-red-50 border-red-200 text-red-900',
    info: 'bg-blue-50 border-blue-200 text-blue-900'
  };

  return (
    <div
      className={cn(
        'relative w-full rounded-lg border p-4',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const AlertDescription = ({ className, children, ...props }) => {
  return (
    <div
      className={cn('text-sm [&_p]:leading-relaxed', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export { Alert, AlertDescription };