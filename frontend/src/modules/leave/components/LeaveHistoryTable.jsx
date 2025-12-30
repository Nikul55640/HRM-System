import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../shared/ui/card";
import { Button } from "../../../shared/ui/button";
import { ApprovalStatusBadge } from "../../../shared/components";
import { formatDate } from "../../ess/utils/essHelpers";
import {
  Calendar,
  Clock,
  FileText,
  X,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import leaveService from "../../../services/leaveService";

const LeaveHistoryTable = ({ history, onRefresh }) => {
  const [cancellingId, setCancellingId] = useState(null);

  const handleCancelRequest = async (requestId) => {
    if (
      !window.confirm("Are you sure you want to cancel this leave request?")
    ) {
      return;
    }

    // Prompt for cancellation reason
    const reason = window.prompt('Please provide a reason for cancellation (optional):');
    if (reason === null) {
      // User clicked cancel on the prompt
      return;
    }

    try {
      setCancellingId(requestId);
      await leaveService.cancelLeaveRequest(requestId, reason);
      toast.success("Leave request cancelled successfully");
      onRefresh?.();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to cancel leave request"
      );
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
      {history.map((item) => {
        const requestId = item.id || item._id;

        return (
          <Card key={requestId} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2 capitalize text-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  {item.leaveType}
                </CardTitle>

                <div className="flex items-center gap-2">
                  <ApprovalStatusBadge status={item.status} />

                  {/* PENDING → Cancel - Check for both "pending" and empty string without approvedAt */}
                  {(item.status === "pending" || (item.status === "" && !item.approvedAt && !item.cancelledAt)) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelRequest(requestId)}
                      disabled={cancellingId === requestId}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      {cancellingId === requestId ? (
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

                  {/* APPROVED - Check for both "approved" and empty string with approvedAt */}
                  {(item.status === "approved" || (item.status === "" && item.approvedAt)) && (
                    <span className="flex items-center gap-1 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      Approved
                    </span>
                  )}

                  {/* REJECTED */}
                  {item.status === "rejected" && (
                    <span className="flex items-center gap-1 text-sm text-red-600">
                      <XCircle className="h-4 w-4" />
                      Rejected
                    </span>
                  )}

                  {/* CANCELLED */}
                  {item.status === "cancelled" && (
                    <span className="flex items-center gap-1 text-sm text-gray-600">
                      <XCircle className="h-4 w-4" />
                      Cancelled
                    </span>
                  )}

                  {/* PENDING - Show for empty status without approvedAt or explicit pending */}
                  {(item.status === "pending" || (item.status === "" && !item.approvedAt && !item.cancelledAt)) && (
                    <span className="flex items-center gap-1 text-sm text-yellow-600">
                      <Clock className="h-4 w-4" />
                      Pending
                    </span>
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
                    {item.days} {item.days === 1 ? "day" : "days"}
                  </span>
                </div>

                {/* Reason */}
                {item.reason && (
                  <div className="space-y-1">
                    <span className="text-muted-foreground text-sm">
                      Reason:
                    </span>
                    <p className="text-sm bg-muted/50 p-2 rounded-md">
                      {item.reason}
                    </p>
                  </div>
                )}

                {/* Rejection Reason */}
                {item.status === "rejected" && item.rejectionReason && (
                  <div className="space-y-1">
                    <span className="text-sm text-red-600">
                      Rejection Reason:
                    </span>
                    <p className="text-sm bg-red-50 p-2 rounded-md text-red-700">
                      {item.rejectionReason}
                    </p>
                  </div>
                )}

                {/* Cancellation Reason */}
                {item.status === "cancelled" && item.cancellationReason && (
                  <div className="space-y-1">
                    <span className="text-sm text-gray-600">
                      Cancellation Reason:
                    </span>
                    <p className="text-sm bg-gray-50 p-2 rounded-md text-gray-700">
                      {item.cancellationReason}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

LeaveHistoryTable.propTypes = {
  history: PropTypes.array,
  onRefresh: PropTypes.func,
};

LeaveHistoryTable.defaultProps = {
  history: [],
  onRefresh: null,
};

export default LeaveHistoryTable;
