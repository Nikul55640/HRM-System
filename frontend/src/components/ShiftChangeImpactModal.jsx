import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../shared/ui/dialog';
import { Button } from '../shared/ui/button';
import { Badge } from '../shared/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../shared/ui/card';
import {
  AlertTriangle,
  Clock,
  Users,
  CheckCircle,
  Info,
  Calendar,
  Activity,
  Loader2
} from 'lucide-react';
import api from '../services/api';

const ShiftChangeImpactModal = ({ 
  open, 
  onClose, 
  shiftId, 
  newTiming, 
  onConfirm 
}) => {
  const [impact, setImpact] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (open && shiftId) {
      fetchImpactAnalysis();
    }
  }, [open, shiftId]);

  const fetchImpactAnalysis = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/shifts/${shiftId}/change-impact`);
      
      if (response.data.success) {
        setImpact(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching impact analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    try {
      setConfirming(true);
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Error confirming shift change:', error);
    } finally {
      setConfirming(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Shift Change Impact Analysis
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600">Analyzing impact...</p>
          </div>
        ) : impact ? (
          <div className="space-y-6">
            {/* Current vs New Timing */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Timing Change
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Current Timing</div>
                    <div className="font-semibold text-gray-900">
                      {impact.shift.currentTiming}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">New Timing</div>
                    <div className="font-semibold text-blue-700">
                      {newTiming.startTime} - {newTiming.endTime}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Impact Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">
                    {impact.impact.totalAffectedEmployees}
                  </div>
                  <div className="text-sm text-gray-600">Total Affected</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Activity className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-600">
                    {impact.impact.employeesWithActiveSessions}
                  </div>
                  <div className="text-sm text-gray-600">Active Sessions</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">
                    {impact.impact.employeesWithoutActiveSessions}
                  </div>
                  <div className="text-sm text-gray-600">No Active Sessions</div>
                </CardContent>
              </Card>
            </div>

            {/* Recommendation */}
            <Card className={`border-2 ${
              impact.impact.employeesWithActiveSessions > 0 
                ? 'border-orange-200 bg-orange-50' 
                : 'border-green-200 bg-green-50'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {impact.impact.employeesWithActiveSessions > 0 ? (
                    <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  )}
                  <div>
                    <div className="font-semibold text-sm mb-1">
                      {impact.impact.employeesWithActiveSessions > 0 
                        ? 'Changes Will Take Effect Tomorrow' 
                        : 'Changes Will Take Effect Immediately'
                      }
                    </div>
                    <div className="text-sm text-gray-700">
                      {impact.recommendation}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Affected Employees List */}
            {impact.affectedEmployees.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Affected Employees</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {impact.affectedEmployees.map((employee) => (
                      <div 
                        key={employee.id} 
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div>
                          <div className="font-medium text-sm">{employee.name}</div>
                          <div className="text-xs text-gray-500">ID: {employee.employeeId}</div>
                        </div>
                        <Badge 
                          className={employee.hasActiveSession 
                            ? 'bg-orange-100 text-orange-800' 
                            : 'bg-green-100 text-green-800'
                          }
                        >
                          {employee.hasActiveSession ? 'Active Session' : 'No Session'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Warning for Active Sessions */}
            {impact.impact.employeesWithActiveSessions > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div className="text-sm">
                      <div className="font-semibold text-orange-900 mb-1">
                        Important Notice
                      </div>
                      <div className="text-orange-800">
                        {impact.impact.employeesWithActiveSessions} employee(s) currently have active attendance sessions. 
                        To protect their ongoing sessions, the new shift timing will take effect tomorrow. 
                        All affected employees will be notified about this change.
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={confirming}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={confirming}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {confirming ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
            <p>Unable to load impact analysis</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ShiftChangeImpactModal;