import { useState } from "react";
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
import { formatIndianDateTime } from "../../../utils/indianFormatters";
import {
  Calendar,
  Clock,
  FileText,
  X,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  User,
} from "lucide-react";
import { toast } from "react-toastify";
import leaveService from "../../../services/leaveService";

const LeaveHistoryTable = ({ history, onRefresh }) => {
  const [expandedId, setExpandedId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleCancelRequest = async (requestId) => {
    if (
      !window.confirm("Are you sure you want to cancel this leave request?")
    ) {
      return;
    }

    const reason = window.prompt(
      "Please provide a reason for cancellation (optional):",
    );
    if (reason === null) return;

    try {
      setCancellingId(requestId);
      await leaveService.cancelLeaveRequest(requestId, reason);
      toast.success("Leave request cancelled successfully");
      onRefresh?.();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to cancel leave request",
      );
    } finally {
      setCancellingId(null);
    }
  };

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        No leave history available.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((item) => {
        const isExpanded = expandedId === item.id;

        return (
          <Card
            key={item.id}
            className="border border-gray-200 rounded-xl transition"
          >
            {/* ===== HEADER (ALWAYS VISIBLE) ===== */}
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  {item.leaveType}
                </CardTitle>

                <div className="flex items-center gap-3">
                  <ApprovalStatusBadge status={item.status} />

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleExpand(item.id)}
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-1" />
                        Hide
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-1" />
                        View
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* ===== BASIC INFO ===== */}
            <CardContent className="text-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-gray-500 flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> From
                </span>
                <div>{formatDate(item.startDate)}</div>
              </div>

              <div>
                <span className="text-gray-500 flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> To
                </span>
                <div>{formatDate(item.endDate)}</div>
              </div>

              <div>
                <span className="text-gray-500 flex items-center gap-1">
                  <Clock className="h-4 w-4" /> Duration
                </span>
                <div className="font-medium">
                  {item.totalDays} {item.totalDays === 1 ? "day" : "days"}
                </div>
              </div>
            </CardContent>

            {/* ===== EXPANDED DETAILS ===== */}
            {isExpanded && (
              <CardContent className="border-t bg-gray-50 space-y-4 text-sm">
                {/* Reason */}
                {item.reason && (
                  <div>
                    <span className="text-gray-500">Reason</span>
                    <p className="mt-1 bg-white p-3 rounded-md border">
                      {item.reason}
                    </p>
                  </div>
                )}

                {/* Approved */}
                {item.status === "approved" && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="h-4 w-4" />
                      Approved
                    </div>
                    <div className="mt-1 text-xs text-green-700">
                      By: {item.approver?.email || "HR"}
                    </div>
                    <div className="text-xs text-green-600">
                      On:{" "}
                      {item.approvedAt
                        ? formatIndianDateTime(item.approvedAt)
                        : "-"}
                    </div>
                  </div>
                )}

                {/* Rejected */}
                {item.status === "rejected" && item.rejectionReason && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <div className="flex items-center gap-2 text-red-700">
                      <XCircle className="h-4 w-4" />
                      Rejected
                    </div>
                    <p className="mt-1 text-red-700">{item.rejectionReason}</p>
                  </div>
                )}

                {/* Cancelled */}
                {item.status === "cancelled" && item.cancellationReason && (
                  <div className="bg-gray-100 border rounded-md p-3">
                    <span className="font-medium text-gray-700">
                      Cancellation Reason
                    </span>
                    <p className="mt-1">{item.cancellationReason}</p>
                  </div>
                )}

                {/* Cancel Button */}
                {item.canCancel && (
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelRequest(item.id)}
                      disabled={cancellingId === item.id}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      {cancellingId === item.id ? (
                        <>
                          <span className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-1" />
                          Cancelling...
                        </>
                      ) : (
                        <>
                          <X className="h-4 w-4 mr-1" />
                          Cancel Leave
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
};

LeaveHistoryTable.propTypes = {
  history: PropTypes.array.isRequired,
  onRefresh: PropTypes.func,
};

export default LeaveHistoryTable;
