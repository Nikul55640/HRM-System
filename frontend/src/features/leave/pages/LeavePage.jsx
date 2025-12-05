import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import leaveService from '../services/leaveService';
import LeaveBalanceCards from '../components/LeaveBalanceCards';
import LeaveHistoryTable from '../components/LeaveHistoryTable';
import LeaveApplicationForm from '../components/LeaveApplicationForm';

const LeavePage = () => {
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('apply');

  useEffect(() => {
    fetchLeaveData();
  }, []);

  const fetchLeaveData = async () => {
    try {
      setLoading(true);
      const [balanceRes, historyRes] = await Promise.all([
        leaveService.getLeaveBalance(),
        leaveService.getMyLeaveHistory(),
      ]);

      if (balanceRes.success) {
        setLeaveBalance(balanceRes.data);
      }
      if (historyRes.success) {
        setLeaveHistory(historyRes.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load leave data');
      toast.error('Failed to load leave information');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLeave = async (data) => {
    try {
      const response = await leaveService.applyLeave(data);
      if (response.success) {
        toast.success('Leave application submitted successfully');
        fetchLeaveData(); // Refresh data
        setActiveTab('history'); // Switch to history tab
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit leave application');
      throw err;
    }
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
            <LeaveApplicationForm 
              onSubmit={handleApplyLeave} 
              isLoading={loading}
              leaveBalance={leaveBalance}
            />
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
