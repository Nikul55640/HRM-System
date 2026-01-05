import React from 'react';
import { Badge } from './badge';
import { statusMappings } from '../../lib/utils';

const HRMStatusBadge = ({ status, className, ...props }) => {
  if (!status) return null;
  
  const statusKey = status.toLowerCase();
  const statusConfig = statusMappings[statusKey];
  
  if (!statusConfig) {
    // Fallback for unknown statuses
    return (
      <Badge variant="outline" className={className} {...props}>
        {status}
      </Badge>
    );
  }
  
  return (
    <Badge 
      variant={statusConfig.variant} 
      className={className} 
      {...props}
    >
      {statusConfig.label}
    </Badge>
  );
};

export { HRMStatusBadge };