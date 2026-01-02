/**
 * Attendance Data Mapper
 * Maps database field names to frontend display format
 */

export const mapAttendanceRecord = (record) => {
  if (!record) return null;

  return {
    id: record.id,
    employeeId: record.employeeId,
    employee: record.employee ? {
      id: record.employee.id,
      employeeId: record.employee.employeeId,
      firstName: record.employee.firstName,
      lastName: record.employee.lastName,
      fullName: `${record.employee.firstName || ''} ${record.employee.lastName || ''}`.trim(),
      designation: record.employee.designation,
      department: record.employee.department,
      email: record.employee.user?.email || record.employee.email
    } : null,
    date: record.date,
    clockIn: record.clockIn,
    clockOut: record.clockOut,
    status: record.status,
    statusReason: record.statusReason,
    
    // Late tracking
    isLate: record.isLate || false,
    lateMinutes: record.lateMinutes || 0,
    
    // Early departure tracking
    isEarlyDeparture: record.isEarlyDeparture || false,
    earlyExitMinutes: record.earlyExitMinutes || 0,
    
    // Working hours
    totalWorkedMinutes: record.totalWorkedMinutes || 0,
    workHours: record.workHours || 0,
    workingHours: record.workHours ? `${record.workHours}h` : 
                  record.totalWorkedMinutes ? `${Math.round(record.totalWorkedMinutes / 60 * 100) / 100}h` : 
                  '--:--',
    
    // Break tracking
    breakSessions: record.breakSessions || [],
    totalBreakMinutes: record.totalBreakMinutes || 0,
    
    // Overtime
    overtimeMinutes: record.overtimeMinutes || 0,
    overtimeHours: record.overtimeHours || 0,
    
    // Location and device info
    location: record.location,
    deviceInfo: record.deviceInfo,
    
    // Correction status
    correctionRequested: record.correctionRequested || false,
    correctionReason: record.correctionReason,
    correctionStatus: record.correctionStatus,
    
    // Audit fields
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    createdBy: record.createdBy,
    updatedBy: record.updatedBy,
    
    // Shift information
    shift: record.shift,
    shiftId: record.shiftId,
    
    // Additional computed fields
    isIncomplete: record.status === 'incomplete',
    isPresent: record.status === 'present',
    isAbsent: record.status === 'absent',
    
    // Display helpers
    clockInTime: record.clockIn ? new Date(record.clockIn).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }) : '--:--',
    clockOutTime: record.clockOut ? new Date(record.clockOut).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }) : '--:--',
    
    // Status display
    statusDisplay: getStatusDisplay(record.status, record.isLate, record.lateMinutes),
    statusColor: getStatusColor(record.status, record.isLate)
  };
};

export const mapLiveAttendanceData = (employee) => {
  if (!employee) return null;

  return {
    ...employee,
    // Ensure consistent field names
    isLate: employee.isLate || employee.currentSession?.isLate || false,
    lateMinutes: employee.lateMinutes || employee.currentSession?.lateMinutes || 0,
    status: employee.status || employee.currentSession?.status || 'present',
    
    // Format display names
    fullName: employee.fullName || `${employee.firstName || ''} ${employee.lastName || ''}`.trim(),
    
    // Ensure current session has all required fields
    currentSession: {
      ...employee.currentSession,
      isLate: employee.isLate || employee.currentSession?.isLate || false,
      lateMinutes: employee.lateMinutes || employee.currentSession?.lateMinutes || 0,
      checkInTime: employee.currentSession?.checkInTime,
      totalWorkedMinutes: employee.currentSession?.totalWorkedMinutes || 0,
      totalBreakMinutes: employee.currentSession?.totalBreakMinutes || 0,
      status: employee.currentSession?.status || 'active'
    }
  };
};

export const getStatusDisplay = (status, isLate, lateMinutes) => {
  if (isLate && status === 'present') {
    return `Late (${lateMinutes}m)`;
  }
  
  switch (status) {
    case 'present':
      return 'Present';
    case 'absent':
      return 'Absent';
    case 'incomplete':
      return 'Incomplete - Missing Clock-out';
    case 'leave':
      return 'On Leave';
    case 'half_day':
      return 'Half Day';
    case 'holiday':
      return 'Holiday';
    case 'pending_correction':
      return 'Pending Correction';
    default:
      return status?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
  }
};

export const getStatusColor = (status, isLate) => {
  if (isLate && status === 'present') {
    return 'bg-red-100 text-red-800';
  }
  
  const statusColors = {
    present: 'bg-green-100 text-green-800',
    absent: 'bg-red-100 text-red-800',
    late: 'bg-yellow-100 text-yellow-800',
    incomplete: 'bg-orange-100 text-orange-800',
    leave: 'bg-blue-100 text-blue-800',
    half_day: 'bg-purple-100 text-purple-800',
    holiday: 'bg-purple-100 text-purple-800',
    pending_correction: 'bg-gray-100 text-gray-800'
  };
  
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

export const formatDuration = (minutes) => {
  if (!minutes || minutes === 0) return '0m';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  
  return `${mins}m`;
};

export const formatTime = (timeString) => {
  if (!timeString) return '--:--';
  
  try {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return '--:--';
  }
};

export const formatDate = (dateString) => {
  if (!dateString) return '--';
  
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return '--';
  }
};