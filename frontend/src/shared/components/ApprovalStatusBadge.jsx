import React from 'react';
import { Badge } from '../ui/badge';

const ApprovalStatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return { variant: 'success', label: 'Approved', className: 'bg-green-100 text-green-800 hover:bg-green-100' };
      case 'rejected':
        return { variant: 'destructive', label: 'Rejected', className: 'bg-red-100 text-red-800 hover:bg-red-100' };
      case 'pending':
        return { variant: 'secondary', label: 'Pending', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' };
      default:
        return { variant: 'outline', label: status || 'Unknown', className: 'bg-gray-100 text-gray-800 hover:bg-gray-100' };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant="outline" className={`font-medium border-0 ${config.className}`}>
      {config.label}
    </Badge>
  );
};

export default ApprovalStatusBadge;