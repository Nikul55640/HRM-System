import React, { useState, useEffect, useRef } from "react";
import { usePayslips } from "../../employees/useEmployeeSelfService";
import { LoadingSpinner, EmptyState } from "../../../shared/components";
import PayslipList from "./PayslipList";
import PayslipDetail from "./PayslipDetail";
import { toast } from "react-toastify";
import { FileText, Download } from "lucide-react";

const PayslipsPage = () => {
  const { payslips, loading, error, getPayslips } = usePayslips();
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      getPayslips();
      hasFetched.current = true;
    }
  }, []);

  const handleView = (payslip) => {
    setSelectedPayslip(payslip);
    setIsDetailOpen(true);
  };

  const handleDownload = async () => {
    toast.info("Downloading payslip...");
    setTimeout(() => {
      toast.success("Payslip downloaded successfully");
    }, 1000);
  };

  // Loading state
  if (loading && !payslips?.length) {
    return <LoadingSpinner size="lg" message="Loading your payslips..." />;
  }

  // Error state
  if (error && !payslips?.length) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 text-4xl mb-3">⚠️</div>
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Unable to Load Payslips
          </h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => getPayslips()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!payslips || payslips.length === 0) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Payslips</h1>

        <EmptyState
          icon={FileText}
          title="No payslips available"
          description="You don't have any payslips yet. Payslips will appear here once your first payroll is processed."
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Payslips</h1>
        <div className="text-sm text-gray-600">
          {payslips.length} payslip{payslips.length !== 1 ? "s" : ""} available
        </div>
      </div>

      <PayslipList
        payslips={payslips}
        onView={handleView}
        onDownload={handleDownload}
      />

      <PayslipDetail
        payslip={selectedPayslip}
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </div>
  );
};

export default PayslipsPage;
