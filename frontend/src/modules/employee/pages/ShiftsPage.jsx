import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/ui/card";
import { Button } from "../../../shared/ui/button";
import { Badge } from "../../../shared/ui/badge";
import { Icon, LoadingSpinner } from "../../../shared/components";
import { useToast } from "../../../core/hooks/use-toast";
import shiftService from "../../../services/shiftService";

const ShiftsPage = () => {
  const [shifts, setShifts] = useState([]);
  const [currentShift, setCurrentShift] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMyShifts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchMyShifts = async () => {
    try {
      setLoading(true);
      
      // Fetch both current shift and all shifts
      const [currentShiftResponse, shiftsResponse] = await Promise.all([
        shiftService.employee.getCurrentShift(),
        shiftService.employee.getMyShifts()
      ]);
      
      if (currentShiftResponse.success && currentShiftResponse.data?.currentShift) {
        const currentShiftData = currentShiftResponse.data.currentShift;
        setCurrentShift({
          id: currentShiftData.id,
          name: currentShiftData.shift?.shiftName || 'Unknown Shift',
          startTime: currentShiftData.shift?.shiftStartTime || '09:00',
          endTime: currentShiftData.shift?.shiftEndTime || '17:00',
          days: getWorkingDays(currentShiftData.shift?.weeklyOffDays),
          isActive: true,
          effectiveFrom: currentShiftData.effectiveDate,
          effectiveTo: currentShiftData.endDate,
          shiftCode: currentShiftData.shift?.shiftCode,
          gracePeriod: currentShiftData.shift?.gracePeriodMinutes,
          maxBreakMinutes: currentShiftData.shift?.maxBreakMinutes
        });
      }
      
      if (shiftsResponse.success && shiftsResponse.data?.shiftAssignments) {
        const formattedShifts = shiftsResponse.data.shiftAssignments.map(assignment => ({
          id: assignment.id,
          name: assignment.shift?.shiftName || 'Unknown Shift',
          startTime: assignment.shift?.shiftStartTime || '09:00',
          endTime: assignment.shift?.shiftEndTime || '17:00',
          days: getWorkingDays(assignment.shift?.weeklyOffDays),
          isActive: assignment.isActive,
          effectiveFrom: assignment.effectiveDate,
          effectiveTo: assignment.endDate,
          shiftCode: assignment.shift?.shiftCode
        }));
        setShifts(formattedShifts);
      }
      
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch shift information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert weeklyOffDays to working days
  const getWorkingDays = (weeklyOffDays) => {
    const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    if (!weeklyOffDays || weeklyOffDays.length === 0) {
      return allDays.slice(0, 5); // Default to Mon-Fri
    }
    
    // weeklyOffDays might be an array like ['Saturday', 'Sunday']
    const offDays = Array.isArray(weeklyOffDays) ? weeklyOffDays : JSON.parse(weeklyOffDays || '[]');
    return allDays.filter(day => !offDays.includes(day));
  };

  const requestShiftChange = async () => {
    try {
      // For now, just show a simple prompt for shift change reason
      const reason = window.prompt("Please provide a reason for the shift change request:");
      
      if (!reason) {
        return; // User cancelled
      }
      
      // Get effective date (default to next Monday)
      const nextMonday = new Date();
      nextMonday.setDate(nextMonday.getDate() + (1 + 7 - nextMonday.getDay()) % 7);
      const effectiveDate = nextMonday.toISOString().split('T')[0];
      
      await shiftService.employee.requestShiftChange({
        reason,
        effectiveDate,
        requestedShiftId: 1, // This should be selected by user in a proper form
        // Add more fields as needed based on backend requirements
      });
      
      toast({
        title: "Success",
        description: "Shift change request submitted successfully. HR will review your request.",
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit shift change request",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your shifts..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Shifts</h1>
          <p className="text-gray-600">View your assigned shifts and schedule</p>
        </div>
        <Button onClick={requestShiftChange} className="flex items-center gap-2">
          <Icon name="Clock" className="w-4 h-4" />
          Request Shift Change
        </Button>
      </div>

      {/* Current Active Shift */}
      {currentShift && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Clock" className="w-5 h-5 text-green-600" />
              Current Active Shift
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Shift Name</label>
                <p className="text-lg font-semibold">{currentShift.name}</p>
                {currentShift.shiftCode && (
                  <p className="text-sm text-gray-600">Code: {currentShift.shiftCode}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Working Hours</label>
                <p className="text-lg font-semibold">
                  {currentShift.startTime} - {currentShift.endTime}
                </p>
                {currentShift.gracePeriod && (
                  <p className="text-sm text-gray-600">Grace: {currentShift.gracePeriod} min</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div>
                  <Badge variant="success">Active</Badge>
                </div>
                {currentShift.maxBreakMinutes && (
                  <p className="text-sm text-gray-600">Max break: {currentShift.maxBreakMinutes} min</p>
                )}
              </div>
            </div>
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-500">Working Days</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {currentShift.days.map((day) => (
                  <Badge key={day} variant="outline">
                    {day}
                  </Badge>
                ))}
              </div>
            </div>
            {(currentShift.effectiveFrom || currentShift.effectiveTo) && (
              <div className="mt-4 text-sm text-gray-600">
                <span className="font-medium">Effective Period: </span>
                {currentShift.effectiveFrom && new Date(currentShift.effectiveFrom).toLocaleDateString()}
                {currentShift.effectiveTo && ` to ${new Date(currentShift.effectiveTo).toLocaleDateString()}`}
                {!currentShift.effectiveTo && ' (ongoing)'}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Shift History */}
      <Card>
        <CardHeader>
          <CardTitle>Shift History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {shifts.map((shift) => (
              <div
                key={shift.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium">{shift.name}</h3>
                    <Badge variant={shift.isActive ? "success" : "secondary"}>
                      {shift.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {shift.startTime} - {shift.endTime} • {shift.days.join(", ")}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Effective from: {shift.effectiveFrom}
                    {shift.effectiveTo && ` to ${shift.effectiveTo}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Schedule Preview */}
      <Card>
        <CardHeader>
          <CardTitle>This Week&apos;s Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
              const isWorkingDay = currentShift?.days.some(workDay => 
                workDay.toLowerCase().startsWith(day.toLowerCase())
              );
              
              return (
                <div key={day} className="text-center">
                  <div className="text-sm font-medium text-gray-500 mb-2">{day}</div>
                  <div className={`p-2 rounded text-xs ${isWorkingDay ? 'bg-blue-50' : 'bg-gray-50'}`}>
                    {isWorkingDay ? (
                      <div>
                        <div className="font-medium">
                          {currentShift.startTime}
                        </div>
                        <div>to</div>
                        <div className="font-medium">
                          {currentShift.endTime}
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-400">Off</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShiftsPage;