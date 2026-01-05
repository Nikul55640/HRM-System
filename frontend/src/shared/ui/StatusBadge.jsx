import React from 'react';
import { cn } from '../../lib/utils';

const StatusBadge = ({ 
  status, 
  variant = 'default', 
  size = 'sm',
  className,
  children 
}) => {
  const getStatusStyles = (status) => {
    const statusMap = {
      // Leave statuses
      'approved': 'bg-green-100 text-green-800 border-green-200',
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'rejected': 'bg-red-100 text-red-800 border-red-200',
      'cancelled': 'bg-gray-100 text-gray-800 border-gray-200',
      
      // Attendance statuses
      'present': 'bg-green-100 text-green-800 border-green-200',
      'absent': 'bg-red-100 text-red-800 border-red-200',
      'late': 'bg-orange-100 text-orange-800 border-orange-200',
      'half-day': 'bg-blue-100 text-blue-800 border-blue-200',
      'on-leave': 'bg-purple-100 text-purple-800 border-purple-200',
      
      // Employee statuses
      'active': 'bg-green-100 text-green-800 border-green-200',
      'inactive': 'bg-gray-100 text-gray-800 border-gray-200',
      'terminated': 'bg-red-100 text-red-800 border-red-200',
      
      // General statuses
      'success': 'bg-green-100 text-green-800 border-green-200',
      'warning': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'error': 'bg-red-100 text-red-800 border-red-200',
      'info': 'bg-blue-100 text-blue-800 border-blue-200',
      'default': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    return statusMap[status?.toLowerCase()] || statusMap.default;
  };

  const sizeStyles = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border',
        getStatusStyles(status || variant),
        sizeStyles[size],
        className
      )}
    >
      {children || status}
    </span>
  );
};

export default StatusBadge;