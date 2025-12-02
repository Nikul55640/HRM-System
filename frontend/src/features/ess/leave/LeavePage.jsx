import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
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

  useEffect(() => {
    getLeaveBalance();
    getLeaveHistory();
  }, [getLeaveBalance, getLeaveHistory]);

  const handleApplyLeave = async (data) => {
    await applyLeave(data);
  };

  if (loading && !leaveBalance) {
    return <div className="p-6 text-center">Loading leave information...</div>;
  }

  if (error && !leaveBalance) {
    return <div className="p-6 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Leave Management</h1>
      
      <LeaveBalanceCards balances={leaveBalance} />

      <Tabs defaultValue="apply" className="space-y-4">
        <TabsList>
          <TabsTrigger value="apply">Apply for Leave</TabsTrigger>
          <TabsTrigger value="history">Leave History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="apply">
          <LeaveApplicationForm onSubmit={handleApplyLeave} isLoading={loading} />
        </TabsContent>
        
        <TabsContent value="history">
          <LeaveHistoryTable history={leaveHistory} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeavePage;
