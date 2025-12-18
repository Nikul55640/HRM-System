import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Badge } from '../../../shared/ui/badge';
import { ApprovalStatusBadge } from '../../../shared/components';
import { formatDate, getStatusBadgeVariant } from '../../../core/utils/essHelpers';
import { Calendar, Clock, FileText } from 'lucide-react';

const LeaveHistoryTable = ({ history }) => {
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
              <ApprovalStatusBadge status={item.status} />
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
