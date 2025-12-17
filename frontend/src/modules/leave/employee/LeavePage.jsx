import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { LoadingSpinner, EmptyState } from "../../../shared/components";
import {
  Calendar,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Download,
  RefreshCw,
} from "lucide-react";
import employeeSelfService from "../../../services/employeeSelfService";
import LeaveRequestModal from "./LeaveRequestModal";
import LeaveBalanceCards from "../components/LeaveBalanceCards";
import useLeaveBalance from "../hooks/useLeaveBalance";

const LeavePage = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

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
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const loading = balanceLoading && historyLoading;

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading leave information..." />;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Leave</h1>
          <p className="text-gray-600 mt-1">
            Manage your leave requests and view balance
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={refreshBalance}
            disabled={balanceLoading}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2 disabled:opacity-50"
            title={lastFetched ? `Last updated: ${lastFetched.toLocaleTimeString()}` : 'Refresh balance'}
          >
            <RefreshCw className={`h-4 w-4 ${balanceLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
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
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Leave History
            </h2>
            <span className="text-sm text-gray-600">
              {leaveRequests.length} request
              {leaveRequests.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className="p-6">
          {leaveRequests.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No leave requests yet"
              description="Start by applying for your first leave request"
              action={
                <button
                  onClick={() => setShowModal(true)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Apply Leave
                </button>
              }
            />
          ) : (
            <div className="space-y-4">
              {leaveRequests.map((request) => (
                <div
                  key={request._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedRequest(request)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {request.leaveType || "Leave Request"}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(
                            request.status
                          )}`}
                        >
                          {getStatusIcon(request.status)}
                          {request.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
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
                        <p className="text-sm text-gray-600 mt-2">
                          <span className="font-medium">Reason:</span>{" "}
                          {request.reason}
                        </p>
                      )}

                      {request.rejectionReason && (
                        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-900">
                            <span className="font-medium">
                              Rejection Reason:
                            </span>{" "}
                            {request.rejectionReason}
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

      {/* Leave Request Modal */}
      {showModal && (
        <LeaveRequestModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleApplyLeave}
          leaveBalance={leaveBalance}
        />
      )}
    </div>
  );
};

export default LeavePage;
