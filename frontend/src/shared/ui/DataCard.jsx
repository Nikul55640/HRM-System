import React from 'react';
import { cn } from '../../lib/utils';

const DataCard = ({ 
  title,
  subtitle,
  children,
  actions,
  className,
  headerClassName,
  contentClassName,
  hover = true,
  ...props 
}) => {
  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-gray-200 shadow-sm',
        hover && 'hover:shadow-md transition-shadow duration-200',
        className
      )}
      {...props}
    >
      {(title || subtitle || actions) && (
        <div className={cn(
          'px-6 py-4 border-b border-gray-200',
          headerClassName
        )}>
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-gray-900">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex items-center space-x-2">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
      <div className={cn('px-6 py-4', contentClassName)}>
        {children}
      </div>
    </div>
  );
};

export default DataCard;