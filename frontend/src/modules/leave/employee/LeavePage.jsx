import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { LoadingSpinner } from "../../../shared/components";
import {
  Calendar,
  Plus,
  Download,
  RefreshCw,
} from "lucide-react";
import employeeSelfService from "../../../services/employeeSelfService";
import LeaveRequestModal from "./LeaveRequestModal";
import LeaveBalanceCards from "../components/LeaveBalanceCards";
import useLeaveBalance from "../hooks/useLeaveBalance";
import LeaveHistoryTable from "../../leave/components/LeaveHistoryTable";

const LeavePage = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

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

      {/* Leave History Table */}
      <LeaveHistoryTable
        history={leaveRequests}
        onRefresh={fetchLeaveHistory}
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
    </div>
  );
};

export default LeavePage;
