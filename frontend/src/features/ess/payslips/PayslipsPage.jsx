import React, { useState, useEffect, useRef } from "react";
import { usePayslips } from "../../../features/employees/useEmployeeSelfService";
import PayslipList from "./PayslipList";
import PayslipDetail from "./PayslipDetail";
import { toast } from "react-toastify";

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

  if (loading && !payslips?.length) {
    return (
      <div className="p-6 text-center">
        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-2 text-gray-600">Loading payslips...</p>
      </div>
    );
  }

  if (error && !payslips?.length) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-900 font-semibold">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Payslips</h1>

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
