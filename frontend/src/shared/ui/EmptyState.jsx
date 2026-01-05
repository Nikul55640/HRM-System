import React from 'react';
import { cn } from '../../lib/utils';

const EmptyState = ({ 
  icon: Icon,
  title,
  description,
  action,
  className,
  ...props 
}) => {
  return (
    <div className={cn(
      'text-center py-12 px-6',
      className
    )} {...props}>
      {Icon && (
        <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
          <Icon className="h-12 w-12" />
        </div>
      )}
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
          {description}
        </p>
      )}
      
      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;