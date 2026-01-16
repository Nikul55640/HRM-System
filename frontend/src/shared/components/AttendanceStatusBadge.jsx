import React from 'react';
import { Badge } from '../ui/badge';
import { getStatusConfig } from '../../utils/attendanceStatus';
import { Clock, CheckCircle, XCircle, AlertCircle, Calendar, HelpCircle } from 'lucide-react';

/**
 * Attendance Status Badge Component
 * Displays attendance status with consistent styling across the app
 * 
 * IMPORTANT: This component is shift-aware and doesn't assume fixed times
 */

const statusIcons = {
  present: CheckCircle,
  half_day: AlertCircle,
  leave: XCircle,
  incomplete: Clock,
  holiday: Calendar,
  pending_correction: AlertCircle,
  not_started: HelpCircle
};

const AttendanceStatusBadge = ({ 
  status, 
  showIcon = true, 
  size = 'default',
  className = '' 
}) => {
  const config = getStatusConfig(status);
  const Icon = statusIcons[status] || Clock;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    default: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const iconSizes = {
    sm: 12,
    default: 14,
    lg: 16
  };

  return (
    <Badge 
      className={`
        ${config.bgClass} 
        ${config.textClass} 
        ${config.borderClass}
        border
        font-medium
        inline-flex
        items-center
        gap-1.5
        ${sizeClasses[size]}
        ${className}
      `}
      variant="outline"
    >
      {showIcon && <Icon size={iconSizes[size]} />}
      <span>{config.label}</span>
    </Badge>
  );
};

export default AttendanceStatusBadge;
