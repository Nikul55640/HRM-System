import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Badge } from '../../../shared/ui/badge';
import { Progress } from '../../../shared/ui/progress';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import leaveService from '../../../core/services/leaveService';

const LeaveBalance = ({ employeeId }) => {
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaveBalances();
  }, [employeeId]);

  const fetchLeaveBalances = async () => {
    try {
      setLoading(true);
      const response = await leaveService.getEmployeeLeaveBalance(employeeId);
      setLeaveBalances(response.data || []);
    } catch (error) {
      toast.error('Failed to load leave balances');
    } finally {
      setLoading(false);
    }
  };

  const getLeaveTypeColor = (type) => {
    const colors = {
      annual: 'bg-blue-500',
      sick: 'bg-red-500',
      personal: 'bg-green-500',
      maternity: 'bg-purple-500',
      paternity: 'bg-indigo-500',
      emergency: 'bg-orange-500',
      compensatory: 'bg-yellow-500'
    };
    return colors[type.toLowerCase()] || 'bg-gray-500';
  };

  const getUsagePercentage = (used, total) => {
    if (total === 0) return 0;
    return Math.min((used / total) * 100, 100);
  };

  const getUsageStatus = (used, total) => {
    const percentage = getUsagePercentage(used, total);
    if (percentage >= 90) return 'high';
    if (percentage >= 70) return 'medium';
    return 'low';
  };

  const formatDays = (days) => {
    return `${days} ${days === 1 ? 'day' : 'days'}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Leave Balance</CardTitle>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/employee/leave/request'}
          >
            Request Leave
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {leaveBalances.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No leave balance information available</p>
          </div>
        ) : (
          <div className="space-y-6">
            {leaveBalances.map((balance) => {
              const usagePercentage = getUsagePercentage(balance.used, balance.allocated);
              const usageStatus = getUsageStatus(balance.used, balance.allocated);
              
              return (
                <div key={balance.leaveType} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div 
                        className={`w-4 h-4 rounded-full ${getLeaveTypeColor(balance.leaveType)}`}
                      />
                      <h3 className="font-medium text-lg">
                        {balance.leaveType.charAt(0).toUpperCase() + balance.leaveType.slice(1)} Leave
                      </h3>
                    </div>
                    <Badge 
                      variant={
                        usageStatus === 'high' ? 'destructive' : 
                        usageStatus === 'medium' ? 'warning' : 'success'
                      }
                    >
                      {Math.round(usagePercentage)}% Used
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Used: {formatDays(balance.used)}</span>
                      <span>Available: {formatDays(balance.available)}</span>
                      <span>Total: {formatDays(balance.allocated)}</span>
                    </div>
                    
                    <Progress 
                      value={usagePercentage} 
                      className="h-2"
                    />
                    
                    {balance.carryOver > 0 && (
                      <div className="text-sm text-blue-600">
                        <span>Carry over from previous year: {formatDays(balance.carryOver)}</span>
                      </div>
                    )}
                    
                    {balance.expiryDate && (
                      <div className="text-sm text-orange-600">
                        <span>Expires on: {new Date(balance.expiryDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Leave Policy Summary</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• Leave balances are updated monthly</p>
                <p>• Unused annual leave may carry over (subject to policy limits)</p>
                <p>• Sick leave does not expire but may have usage restrictions</p>
                <p>• Contact HR for questions about leave policies</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeaveBalance;