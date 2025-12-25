import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/ui/card";
import { Button } from "../../../shared/ui/button";
import { Badge } from "../../../shared/ui/badge";
import { Icon, LoadingSpinner } from "../../../shared/components";
import { useToast } from "../../../core/hooks/use-toast";

const ShiftsPage = () => {
  const [shifts, setShifts] = useState([]);
  const [currentShift, setCurrentShift] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMyShifts();
  }, []);

  const fetchMyShifts = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await api.get('/employee/shifts/my-shifts');
      
      // Mock data for now
      const mockShifts = [
        {
          id: 1,
          name: "Morning Shift",
          startTime: "09:00",
          endTime: "17:00",
          days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          isActive: true,
          effectiveFrom: "2024-01-01",
          effectiveTo: null
        }
      ];
      
      setShifts(mockShifts);
      setCurrentShift(mockShifts.find(s => s.isActive));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch shift information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const requestShiftChange = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Shift change request functionality will be available soon",
    });
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
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Working Hours</label>
                <p className="text-lg font-semibold">
                  {currentShift.startTime} - {currentShift.endTime}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div>
                  <Badge variant="success">Active</Badge>
                </div>
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
          <CardTitle>This Week's Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div key={day} className="text-center">
                <div className="text-sm font-medium text-gray-500 mb-2">{day}</div>
                <div className="p-2 bg-blue-50 rounded text-xs">
                  {currentShift?.days.includes(day + "day") ? (
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
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShiftsPage;