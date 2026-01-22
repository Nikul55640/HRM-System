import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { LoadingSpinner, EmptyState, DetailModal } from "../../../shared/components";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/ui/card";
import { Button } from "../../../shared/ui/button";
import { HRMStatusBadge } from "../../../shared/ui/HRMStatusBadge";
import { Badge } from "../../../shared/ui/badge";
import {
  Calendar,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  RefreshCw,
  X,
  CalendarDays,
  FileText,
  User,
  MapPin,
  Eye,
} from "lucide-react";
import employeeSelfService from "../../../services/employeeSelfService";
import leaveService from "../../../services/leaveService";
import LeaveRequestModal from "./LeaveRequestModal";
import LeaveBalanceCards from "../components/LeaveBalanceCards";
import useLeaveBalance from "../hooks/useLeaveBalance";
import LeaveHistoryTable from "../../leave/components/LeaveHistoryTable";
import { cn, formatDate } from "../../../lib/utils";

const LeavePage = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Use the custom hook for leave balance
  const { 
    leaveBalance, 
    loading: balanceLoading, 
    refreshBalance,
    lastFetched 
  } = useLeaveBalance();

  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      fetchLeaveHistory();
      hasFetched.current = true;
    }
  }, []);

  const fetchLeaveHistory = async () => {
    try {
      setHistoryLoading(true);
      const historyRes = await employeeSelfService.leave.getHistory();
      setLeaveRequests(historyRes.data || []);
      console.log("Leave history fetched:", historyRes.data); 
    } catch (error) {
      toast.error(error.message || "Failed to load leave history");
    
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchData = async () => {
    await Promise.all([
      refreshBalance(),
      fetchLeaveHistory(),

    ]);
  };

  const handleApplyLeave = async (leaveData) => {
    try {
      await employeeSelfService.leave.apply(leaveData);
      toast.success("Leave request submitted successfully");
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.message || "Failed to submit leave request");
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const handleCancelRequest = async (requestId, event) => {
    event.stopPropagation(); // Prevent triggering the card click
    
    if (!window.confirm('Are you sure you want to cancel this leave request?')) {
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
      toast.success('Leave request cancelled successfully');
      fetchData();
    } catch (error) {
      
      toast.error(error.response?.data?.message || 'Failed to cancel leave request');
    } finally {
      setCancellingId(null);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await employeeSelfService.leave.exportSummary();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leave-summary-${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Leave summary exported successfully");
    } catch (error) {
      toast.error(error.message || "Failed to export leave summary");
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-gray-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const loading = balanceLoading && historyLoading;

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading leave information..." />;
  }

  return (
    <div className="p-3 sm:p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">My Leave</h1>
          <p className="text-gray-600 mt-1">
            Manage your leave requests and view balance
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={refreshBalance}
            disabled={balanceLoading}
            className="px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
            title={lastFetched ? `Last updated: ${lastFetched.toLocaleTimeString()}` : 'Refresh balance'}
          >
            <RefreshCw className={`h-4 w-4 ${balanceLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={handleExport}
            className="px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <Plus className="h-4 sm:h-5 w-4 sm:w-5" />
            Apply Leave
          </button>
        </div>
      </div>

      {/* Leave Balance Cards */}
      <div className="mb-6">
        <LeaveBalanceCards balances={leaveBalance} />
      </div>

      {/* Leave Requests List */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Leave History
            </h2>
            <span className="text-sm text-gray-600">
              {leaveRequests.length} request
              {leaveRequests.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {leaveRequests.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No leave requests yet"
              description="Start by applying for your first leave request"
              action={
                <button
                  onClick={() => setShowModal(true)}
                  className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  Apply Leave
                </button>
              }
            />
          ) : (
            <div className="space-y-4">
              {leaveRequests.map((request) => (
                <div
                  key={request.id || request._id || `request-${Math.random()}`}
                  className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                          {request.leaveType || "Leave Request"}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(
                              request.status
                            )}`}
                          >
                            {getStatusIcon(request.status)}
                            {request.status}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(request);
                            }}
                            className="px-2 py-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200 rounded-md transition-colors flex items-center gap-1"
                            title="View details"
                          >
                            <Eye className="w-3 h-3" />
                            <span className="hidden sm:inline">View</span>
                          </button>
                          {request.status === 'pending' && (
                            <button
                              onClick={(e) => handleCancelRequest(request._id || request.id, e)}
                              disabled={cancellingId === (request._id || request.id)}
                              className="px-2 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-md transition-colors flex items-center gap-1 disabled:opacity-50"
                              title="Cancel this leave request"
                            >
                              {cancellingId === (request._id || request.id) ? (
                                <>
                                  <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                  <span className="hidden sm:inline">Cancelling...</span>
                                </>
                              ) : (
                                <>
                                  <X className="w-3 h-3" />
                                  <span className="hidden sm:inline">Cancel</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                        <div>
                          <span className="font-medium">From:</span>{" "}
                          {new Date(request.startDate).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">To:</span>{" "}
                           {new Date(request.endDate).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Duration:</span>{" "}
                          {request.duration} day
                          {request.duration !== 1 ? "s" : ""}
                        </div>
                        <div>
                          <span className="font-medium">Applied:</span>{" "}
                          {new Date(
                            request.createdAt || request.appliedDate
                          ).toLocaleDateString()}
                        </div>
                      </div>

                      {request.reason && (
                        <p className="text-xs sm:text-sm text-gray-600 mt-2">
                          <span className="font-medium">Reason:</span>{" "}
                          {request.reason}
                        </p>
                      )}

                      {request.rejectionReason && (
                        <div className="mt-2 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-xs sm:text-sm text-red-900">
                            <span className="font-medium">
                              Rejection Reason:
                            </span>{" "}
                            {request.rejectionReason}
                          </p>
                        </div>
                      )}

                      {request.cancellationReason && (
                        <div className="mt-2 p-2 sm:p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <p className="text-xs sm:text-sm text-gray-900">
                            <span className="font-medium">
                              Cancellation Reason:
                            </span>{" "}
                            {request.cancellationReason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
<LeaveHistoryTable
  history={leaveRequests}
  onRefresh={fetchLeaveHistory}
  className="hidden lg:block"
/>

      {/* Leave Request Modal */}
      {showModal && (
        <LeaveRequestModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleApplyLeave}
          leaveBalance={leaveBalance}
        />
      )}

      {/* Leave Details Modal */}
      {showDetailModal && selectedRequest && (
        <DetailModal
          open={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedRequest(null);
          }}
          title="Leave Request Details"
          data={selectedRequest}
          sections={[
            {
              label: 'Leave Information',
              fields: [
                { key: 'leaveType', label: 'Leave Type', icon: 'description' },
                { key: 'status', label: 'Status', type: 'status' },
                { key: 'duration', label: 'Duration (Days)', type: 'number', icon: 'time' },
                { key: 'halfDayType', label: 'Half Day Type', icon: 'time' }
              ]
            },
            {
              label: 'Dates & Timeline',
              fields: [
                { key: 'startDate', label: 'Start Date', type: 'date', icon: 'date' },
                { key: 'endDate', label: 'End Date', type: 'date', icon: 'date' },
                { key: 'createdAt', label: 'Applied Date', type: 'date', icon: 'date' },
                { key: 'appliedDate', label: 'Applied Date (Alt)', type: 'date', icon: 'date' }
              ]
            },
            {
              label: 'Details & Reason',
              fields: [
                { key: 'reason', label: 'Leave Reason', type: 'longtext', fullWidth: true },
                { key: 'emergencyContact', label: 'Emergency Contact', icon: 'user' },
                { key: 'workHandover', label: 'Work Handover', type: 'longtext', fullWidth: true }
              ]
            },
            ...(selectedRequest.status === 'approved' || selectedRequest.approvedBy ? [{
              label: 'Approval Information',
              fields: [
                { key: 'approvedBy', label: 'Approved By', icon: 'user' },
                { key: 'approvedDate', label: 'Approved Date', type: 'date', icon: 'date' },
                { key: 'approverComments', label: 'Approver Comments', type: 'longtext', fullWidth: true }
              ]
            }] : []),
            ...(selectedRequest.status === 'rejected' || selectedRequest.rejectionReason ? [{
              label: 'Rejection Information',
              fields: [
                { key: 'rejectionReason', label: 'Rejection Reason', type: 'longtext', fullWidth: true },
                { key: 'rejectedBy', label: 'Rejected By', icon: 'user' },
                { key: 'rejectedDate', label: 'Rejected Date', type: 'date', icon: 'date' }
              ]
            }] : []),
            ...(selectedRequest.status === 'cancelled' || selectedRequest.cancellationReason ? [{
              label: 'Cancellation Information',
              fields: [
                { key: 'cancellationReason', label: 'Cancellation Reason', type: 'longtext', fullWidth: true },
                { key: 'cancelledBy', label: 'Cancelled By', icon: 'user' },
                { key: 'cancelledDate', label: 'Cancelled Date', type: 'date', icon: 'date' }
              ]
            }] : [])
          ]}
          actions={[
            ...(selectedRequest.status === 'pending' ? [{
              label: 'Cancel Request',
              icon: X,
              onClick: () => {
                setShowDetailModal(false);
                handleCancelRequest(selectedRequest._id || selectedRequest.id, { stopPropagation: () => {} });
              },
              variant: 'destructive'
            }] : []),
            {
              label: 'Close',
              onClick: () => {
                setShowDetailModal(false);
                setSelectedRequest(null);
              },
              variant: 'outline'
            }
          ]}
        />
      )}
    </div>
  );
};

export default LeavePage;
