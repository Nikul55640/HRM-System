import React from 'react';
import { cn } from '../../lib/utils';

const DetailModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  className,
  headerClassName,
  contentClassName,
  footerActions
}) => {
  if (!isOpen) return null;

  const sizeStyles = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full mx-4'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal */}
        <div className={cn(
          'inline-block w-full overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle',
          sizeStyles[size],
          className
        )}>
          {/* Header */}
          {title && (
            <div className={cn(
              'px-6 py-4 border-b border-gray-200 bg-gray-50',
              headerClassName
            )}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          <div className={cn('px-6 py-4', contentClassName)}>
            {children}
          </div>

          {/* Footer */}
          {footerActions && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end space-x-3">
                {footerActions}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailModal;