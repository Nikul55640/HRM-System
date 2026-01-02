import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/ui/card";
import { Button } from "../../../shared/ui/button";
import { Badge } from "../../../shared/ui/badge";
import { Icon, LoadingSpinner } from "../../../shared/components";
import { useToast } from "../../../core/hooks/use-toast";
import api from "../../../services/api";

const LeaveBalanceRolloverPage = () => {
  const [loading, setLoading] = useState(true);
  const [rolloverStatus, setRolloverStatus] = useState(null);
  const [defaultConfig, setDefaultConfig] = useState(null);
  const [performingRollover, setPerformingRollover] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [selectedYear]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statusResponse, configResponse] = await Promise.all([
        api.get(`/admin/leave-balance-rollover/status?year=${selectedYear}`),
        api.get('/admin/leave-balance-rollover/default-config')
      ]);

      setRolloverStatus(statusResponse.data.data);
      setDefaultConfig(configResponse.data.data);
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load rollover data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const performRollover = async () => {
    try {
      setPerformingRollover(true);
      const response = await api.post('/admin/leave-balance-rollover/perform', {
        year: selectedYear
      });

      if (response.data.success) {
        toast({
          title: "Success",
          description: response.data.message,
        });
        fetchData(); // Refresh data
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to perform rollover",
        variant: "destructive",
      });
    } finally {
      setPerformingRollover(false);
    }
  };

  const assignToEmployee = async (employeeId) => {
    try {
      const response = await api.post('/admin/leave-balance-rollover/assign-employee', {
        employeeId,
        year: selectedYear
      });

      if (response.data.success) {
        toast({
          title: "Success",
          description: `Leave balances assigned successfully`,
        });
        fetchData(); // Refresh data
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to assign leave balances",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading rollover data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Balance Rollover</h1>
          <p className="text-gray-600">Manage automatic leave balance assignments</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            {Array.from({ length: 5 }, (_, i) => {
              const year = new Date().getFullYear() - 2 + i;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${rolloverStatus?.rolloverCompleted ? 'bg-green-100' : 'bg-yellow-100'}`}>
                <Icon 
                  name={rolloverStatus?.rolloverCompleted ? "CheckCircle" : "AlertCircle"} 
                  className={`w-5 h-5 ${rolloverStatus?.rolloverCompleted ? 'text-green-600' : 'text-yellow-600'}`} 
                />
              </div>
              <div>
                <p className="text-sm text-gray-600">Rollover Status</p>
                <p className="text-lg font-bold">
                  {rolloverStatus?.rolloverCompleted ? 'Completed' : 'Pending'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Icon name="Users" className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Employees Needing Rollover</p>
                <p className="text-lg font-bold">{rolloverStatus?.employeesWithoutBalances || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Icon name="Calendar" className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Selected Year</p>
                <p className="text-lg font-bold">{selectedYear}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Default Configuration */}
      {defaultConfig && (
        <Card>
          <CardHeader>
            <CardTitle>Default Leave Balance Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {defaultConfig.defaultLeaveTypes.map((leaveType) => (
                <div key={leaveType.leaveType} className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900">{leaveType.leaveType} Leave</h4>
                  <p className="text-2xl font-bold text-blue-600">{leaveType.allocated} days</p>
                  <p className="text-sm text-gray-500">
                    Carry Forward: {leaveType.carryForward} days
                  </p>
                </div>
              ))}
            </div>
            
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Icon name="CheckCircle" className="w-3 h-3 mr-1" />
                  Automatic Rollover Enabled
                </Badge>
                <span className="text-sm text-gray-600">
                  {defaultConfig.automaticRollover.schedule}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <Icon name="UserPlus" className="w-3 h-3 mr-1" />
                  New Employee Assignment Enabled
                </Badge>
                <span className="text-sm text-gray-600">
                  {defaultConfig.newEmployeeAssignment.description}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manual Rollover */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Rollover</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              Manually trigger leave balance rollover for {selectedYear}. This will assign default leave balances to all employees who don't have them for this year.
            </p>
            
            <Button
              onClick={performRollover}
              disabled={performingRollover || rolloverStatus?.rolloverCompleted}
              className="w-full md:w-auto"
            >
              {performingRollover ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Performing Rollover...
                </>
              ) : (
                <>
                  <Icon name="RefreshCw" className="w-4 h-4 mr-2" />
                  {rolloverStatus?.rolloverCompleted ? 'Rollover Already Completed' : 'Perform Rollover'}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Employees Needing Rollover */}
      {rolloverStatus?.employeesNeedingRollover?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Employees Needing Leave Balance Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rolloverStatus.employeesNeedingRollover.map((employee) => (
                <div key={employee.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{employee.name}</p>
                    <p className="text-sm text-gray-500">ID: {employee.employeeId}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => assignToEmployee(employee.id)}
                  >
                    <Icon name="Plus" className="w-3 h-3 mr-1" />
                    Assign Balances
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cron Job Status */}
      {rolloverStatus?.cronJob && (
        <Card>
          <CardHeader>
            <CardTitle>Automatic Rollover Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Cron Job Status:</span>
                <Badge variant={rolloverStatus.cronJob.initialized ? "default" : "secondary"}>
                  {rolloverStatus.cronJob.initialized ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Next Automatic Rollover:</span>
                <span className="font-medium">{rolloverStatus.nextAutomaticRollover}</span>
              </div>
              
              <p className="text-sm text-gray-500">
                The system automatically assigns default leave balances to all employees at the start of each year.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LeaveBalanceRolloverPage;