import React from 'react';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/ui/card';
import { Badge } from '../../../shared/ui/badge';
import { Button } from '../../../shared/ui/button';
import { X, Clock, MapPin, User, Calendar, AlertCircle, CheckCircle, Building2, Home, RotateCcw, Car } from 'lucide-react';
import { getEmployeeFullName } from '../../../utils/employeeDataMapper';
import { getStatusDisplay, getStatusColor, formatTime } from '../../../utils/attendanceDataMapper';

/**
 * AttendanceViewModal - Read-only view of attendance record details
 * 
 * Purpose: Safe admin inspection without mutation risk
 * Shows: All attendance data, breaks, corrections, audit info
 */
const AttendanceViewModal = ({ record, onClose }) => {
  if (!record) return null;

  const formatDateTime = (dateTime) => {
    if (!dateTime) return '--';
    try {
      return format(parseISO(dateTime), 'MMM dd, yyyy hh:mm a');
    } catch {
      return dateTime;
    }
  };

  const formatTimeOnly = (time) => {
    return formatTime(time) || '--';
  };

  const getWorkModeDisplay = (workMode) => {
    const modes = {
      office: { icon: <Building2 className="w-4 h-4" />, label: 'Office' },
      wfh: { icon: <Home className="w-4 h-4" />, label: 'Work From Home' },
      hybrid: { icon: <RotateCcw className="w-4 h-4" />, label: 'Hybrid' },
      field: { icon: <Car className="w-4 h-4" />, label: 'Field Work' }
    };
    
    const mode = modes[workMode] || { icon: <Building2 className="w-4 h-4" />, label: 'Office' };
    
    return (
      <span className="flex items-center gap-2">
        {mode.icon}
        {mode.label}
      </span>
    );
  };

  const getStatusBadge = (status, isLate, lateMinutes) => {
    const statusDisplay = getStatusDisplay(status, isLate, lateMinutes);
    const statusColor = getStatusColor(status, isLate);
    
    return (
      <Badge className={statusColor}>
        {statusDisplay}
      </Badge>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">Attendance Details</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6 text-sm">
          {/* Employee Information */}
          <Section title="Employee Information" icon={<User className="w-4 h-4" />}>
            <Row label="Name" value={getEmployeeFullName(record.employee)} />
            <Row label="Employee ID" value={record.employee?.employeeId || '--'} />
            <Row label="Department" value={record.employee?.department?.name || '--'} />
            <Row label="Designation" value={record.employee?.designation?.title || '--'} />
          </Section>

          {/* Attendance Summary */}
          <Section title="Attendance Summary" icon={<Calendar className="w-4 h-4" />}>
            <Row label="Date" value={format(parseISO(record.date), 'EEEE, MMMM dd, yyyy')} />
            <Row label="Status" value={getStatusBadge(record.status, record.isLate, record.lateMinutes)} />
            <Row label="Work Mode" value={getWorkModeDisplay(record.workMode)} />
            {record.statusReason && (
              <Row label="Status Reason" value={record.statusReason} />
            )}
          </Section>

          {/* Time Tracking */}
          <Section title="Time Tracking" icon={<Clock className="w-4 h-4" />}>
            <Row label="Clock In" value={formatTimeOnly(record.clockIn)} />
            <Row label="Clock Out" value={formatTimeOnly(record.clockOut)} />
            <Row label="Work Hours" value={record.workHours ? `${record.workHours} hours` : '--'} />
            <Row label="Total Worked Minutes" value={record.totalWorkedMinutes ? `${record.totalWorkedMinutes} minutes` : '--'} />
            
            {/* Late/Early Information */}
            {record.isLate && (
              <Row 
                label="Late Arrival" 
                value={
                  <span className="text-red-600 font-medium">
                    {record.lateMinutes} minutes late
                  </span>
                } 
              />
            )}
            {record.isEarlyDeparture && (
              <Row 
                label="Early Departure" 
                value={
                  <span className="text-orange-600 font-medium">
                    {record.earlyExitMinutes} minutes early
                  </span>
                } 
              />
            )}
            
            {/* Overtime */}
            {record.overtimeMinutes > 0 && (
              <Row 
                label="Overtime" 
                value={
                  <span className="text-blue-600 font-medium">
                    {record.overtimeHours} hours ({record.overtimeMinutes} minutes)
                  </span>
                } 
              />
            )}
          </Section>

          {/* Break Sessions */}
          <Section title="Break Sessions" icon={<Clock className="w-4 h-4" />}>
            {record.breakSessions && record.breakSessions.length > 0 ? (
              <div className="space-y-2">
                <Row label="Total Break Time" value={`${record.totalBreakMinutes || 0} minutes`} />
                <div className="mt-3">
                  <div className="text-sm font-medium text-gray-700 mb-2">Break Details:</div>
                  {record.breakSessions.map((breakSession, index) => (
                    <div key={index} className="pl-4 py-2 bg-gray-50 rounded text-xs border-l-2 border-gray-300">
                      <div className="font-medium">Break {index + 1}</div>
                      <div className="text-gray-600">
                        Start: {formatTimeOnly(breakSession.breakIn)} → 
                        End: {breakSession.breakOut ? formatTimeOnly(breakSession.breakOut) : 'Ongoing'}
                      </div>
                      {breakSession.duration && (
                        <div className="text-gray-500">Duration: {breakSession.duration} minutes</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-gray-500 italic">No breaks taken</div>
            )}
          </Section>

          {/* Location & Device Info */}
          <Section title="Location & Device" icon={<MapPin className="w-4 h-4" />}>
            <Row label="Work Location" value={getWorkModeDisplay(record.workMode)} />
            {record.location && (
              <Row 
                label="GPS Location" 
                value={
                  typeof record.location === 'object' 
                    ? `${record.location.latitude}, ${record.location.longitude}` 
                    : record.location
                } 
              />
            )}
            {record.deviceInfo && (
              <Row 
                label="Device Info" 
                value={
                  typeof record.deviceInfo === 'object' 
                    ? JSON.stringify(record.deviceInfo, null, 2)
                    : record.deviceInfo
                } 
              />
            )}
          </Section>

          {/* Correction Information */}
          <Section title="Correction Status" icon={<AlertCircle className="w-4 h-4" />}>
            <Row 
              label="Correction Requested" 
              value={
                record.correctionRequested ? (
                  <Badge className="bg-orange-100 text-orange-800">Yes</Badge>
                ) : (
                  <Badge className="bg-green-100 text-green-800">No</Badge>
                )
              } 
            />
            {record.correctionRequested && (
              <>
                <Row 
                  label="Correction Status" 
                  value={
                    record.correctionStatus ? (
                      <Badge className={
                        record.correctionStatus === 'approved' ? 'bg-green-100 text-green-800' :
                        record.correctionStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {record.correctionStatus}
                      </Badge>
                    ) : '--'
                  } 
                />
                {record.correctionReason && (
                  <Row label="Correction Reason" value={record.correctionReason} />
                )}
                {record.correctedBy && (
                  <Row label="Corrected By" value={`User ID: ${record.correctedBy}`} />
                )}
                {record.correctedAt && (
                  <Row label="Corrected At" value={formatDateTime(record.correctedAt)} />
                )}
              </>
            )}
          </Section>

          {/* Flagged Information */}
          {(record.flaggedReason || record.flaggedBy) && (
            <Section title="Flagged Information" icon={<AlertCircle className="w-4 h-4 text-red-500" />}>
              {record.flaggedReason && (
                <Row label="Flagged Reason" value={record.flaggedReason} />
              )}
              {record.flaggedBy && (
                <Row label="Flagged By" value={`User ID: ${record.flaggedBy}`} />
              )}
              {record.flaggedAt && (
                <Row label="Flagged At" value={formatDateTime(record.flaggedAt)} />
              )}
            </Section>
          )}

          {/* Remarks */}
          {record.remarks && (
            <Section title="Remarks" icon={<CheckCircle className="w-4 h-4" />}>
              <div className="p-3 bg-gray-50 rounded text-sm">
                {record.remarks}
              </div>
            </Section>
          )}

          {/* Audit Information */}
          <Section title="Audit Trail" icon={<CheckCircle className="w-4 h-4" />}>
            <Row label="Created At" value={formatDateTime(record.createdAt)} />
            <Row label="Updated At" value={formatDateTime(record.updatedAt)} />
            {record.createdBy && (
              <Row label="Created By" value={`User ID: ${record.createdBy}`} />
            )}
            {record.updatedBy && (
              <Row label="Updated By" value={`User ID: ${record.updatedBy}`} />
            )}
          </Section>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper Components
const Section = ({ title, icon, children }) => (
  <div className="border rounded-lg p-4">
    <h3 className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
      {icon}
      {title}
    </h3>
    <div className="space-y-2">
      {children}
    </div>
  </div>
);

const Row = ({ label, value }) => (
  <div className="flex justify-between items-start">
    <span className="text-gray-600 font-medium min-w-0 flex-1">{label}:</span>
    <span className="font-medium text-gray-900 ml-4 text-right min-w-0 flex-1">
      {value || '--'}
    </span>
  </div>
);

export default AttendanceViewModal;