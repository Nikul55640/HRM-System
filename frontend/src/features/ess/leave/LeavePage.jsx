import React, { useEffect, useState } from 'react';
import { useLeave } from '../../../features/employees/useEmployeeSelfService';
import LeaveBalanceCards from './LeaveBalanceCards';
import LeaveHistoryTable from './LeaveHistoryTable';
import LeaveApplicationForm from './LeaveApplicationForm';

const LeavePage = () => {
  const { 
    leaveBalance, 
    leaveHistory, 
    loading, 
    error, 
    getLeaveBalance, 
    getLeaveHistory,
    applyLeave
  } = useLeave();

  const [activeTab, setActiveTab] = useState('apply');

  useEffect(() => {
    getLeaveBalance();
    getLeaveHistory();
  }, [getLeaveBalance, getLeaveHistory]);

  const handleApplyLeave = async (data) => {
    await applyLeave(data);
  };

  if (loading && !leaveBalance) {
    return (
      <div className="p-6 text-center">
        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-2 text-gray-600">Loading leave information...</p>
      </div>
    );
  }

  if (error && !leaveBalance) {
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Leave Management</h1>
      
      <LeaveBalanceCards balances={leaveBalance} />

      {/* Simple Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 mt-6">
        <div className="border-b border-gray-200">
          <div className="flex gap-4 p-4">
            <button
              onClick={() => setActiveTab('apply')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'apply'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Apply for Leave
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'history'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Leave History
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'apply' && (
            <LeaveApplicationForm onSubmit={handleApplyLeave} isLoading={loading} />
          )}
          {activeTab === 'history' && (
            <LeaveHistoryTable history={leaveHistory} />
          )}
        </div>
      </div>
    </div>
  );
};

export default LeavePage;
