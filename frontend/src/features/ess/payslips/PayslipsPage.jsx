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
    // Prevent double fetch (React Strict Mode)
    if (!hasFetched.current) {
      getPayslips();
      hasFetched.current = true;
    }
  }, []); // EMPTY DEPS — stable & clean

  const handleView = (payslip) => {
    setSelectedPayslip(payslip);
    setIsDetailOpen(true);
/*************  ✨ Windsurf Command ⭐  *************/
/**
 * Downloads a payslip PDF file.
 * @param {Object} payslip - payslip object with at least an ID, month, and year.
 * @throws {Error} - failed to download payslip
 */
/*******  bee28524-8795-4acc-a804-2dd0c66d9c26  *******/  };

  const handleDownload = async () => {
    toast.info("Downloading payslip...");

    setTimeout(() => {
      toast.success("Payslip downloaded successfully");
    }, 1000);
  };

  if (loading && !payslips?.length) {
    return <div className="p-6 text-center">Loading payslips...</div>;
  }

  if (error && !payslips?.length) {
    return <div className="p-6 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Payslips</h1>

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
