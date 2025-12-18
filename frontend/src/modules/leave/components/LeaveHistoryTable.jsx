import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Badge } from '../../../shared/ui/badge';
import { Button } from '../../../shared/ui/button';
import { ApprovalStatusBadge } from '../../../shared/components';
import { formatDate, getStatusBadgeVariant } from '../../../core/utils/essHelpers';
import { Calendar, Clock, FileText, X, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import leaveService from '../../../core/services/leaveService';

const LeaveHistoryTable = ({ history, onRefresh }) => {
  const [cancellingId, setCancellingId] = useState(null);

  const handleCancelRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this leave request?')) {
      return;
    }

    try {
      setCancellingId(requestId);
      await leaveService.cancelLeaveRequest(requestId);
      toast.success('Leave request cancelled successfully');
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error cancelling leave request:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel leave request');
    } finally {
      setCancellingId(null);
    }
  };

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No leave history available.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((item) => (
        <Card
          key={item.id || item._id}
          className="hover:shadow-md transition-shadow"
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2 capitalize text-lg">
                <FileText className="h-5 w-5 text-primary" />
                {item.leaveType}
              </CardTitle>
              <div className="flex items-center gap-2">
                <ApprovalStatusBadge status={item.status} />
                {item.status === 'pending' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancelRequest(item.id || item._id)}
                    disabled={cancellingId === (item.id || item._id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  >
                    {cancellingId === (item.id || item._id) ? (
                      <>
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-1" />
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  From:
                </span>
                <span>{formatDate(item.startDate)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  To:
                </span>
                <span>{formatDate(item.endDate)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Duration:
                </span>
                <span className="font-medium">
                  {item.days} {item.days === 1 ? 'day' : 'days'}
                </span>
              </div>

              {item.reason && (
                <div className="space-y-1">
                  <span className="text-muted-foreground text-sm">Reason:</span>
                  <p className="text-sm bg-muted/50 p-2 rounded-md">
                    {item.reason}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default LeaveHistoryTable;
