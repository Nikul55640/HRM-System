/**
 * Calendar Event Normalizer
 * Provides unified event model and date filtering utilities for calendar system
 */

import { Op } from "sequelize";

/**
 * Unified Calendar Event Model
 * All calendar events are normalized to this structure
 */
export const UnifiedEventModel = {
  // Core identification
  id: null,                    // Unique identifier (string for generated events)
  sourceType: null,           // 'company_event', 'holiday', 'leave', 'birthday', 'anniversary', 'attendance'
  sourceId: null,             // Original model ID
  
  // Display properties
  title: null,                // Display title
  description: null,          // Event description
  eventType: null,           // Event type for categorization
  
  // Date/time properties
  startDate: null,           // Start date (Date object)
  endDate: null,             // End date (Date object)
  isAllDay: true,            // Whether event spans full day
  
  // Visual properties
  color: null,               // Hex color code
  priority: 0,               // Display priority (higher = more important)
  
  // Employee-related properties
  employeeId: null,          // Related employee ID
  employeeName: null,        // Employee display name
  employeeCode: null,        // Employee code/ID
  department: null,          // Employee department
  
  // Event-specific properties
  metadata: {}               // Additional event-specific data
};

/**
 * Date Range Utilities
 */

/**
 * Check if an event falls within a date range using proper date comparison
 * @param {Object} event - Normalized event object
 * @param {Date} rangeStart - Start of date range
 * @param {Date} rangeEnd - End of date range
 * @returns {boolean} - Whether event is in range
 */
export const isEventInDateRange = (event, rangeStart, rangeEnd) => {
  if (!event.startDate || !event.endDate) return false;
  
  const eventStart = new Date(event.startDate);
  const eventEnd = new Date(event.endDate);
  const start = new Date(rangeStart);
  const end = new Date(rangeEnd);
  
  // Event overlaps with range if:
  // - Event starts within range, OR
  // - Event ends within range, OR
  // - Event spans the entire range
  return (
    (eventStart >= start && eventStart <= end) ||
    (eventEnd >= start && eventEnd <= end) ||
    (eventStart <= start && eventEnd >= end)
  );
};

/**
 * Filter events by date range
 * @param {Array} events - Array of normalized events
 * @param {Date} startDate - Range start
 * @param {Date} endDate - Range end
 * @returns {Array} - Filtered events
 */
export const filterEventsByDateRange = (events, startDate, endDate) => {
  return events.filter(event => isEventInDateRange(event, startDate, endDate));
};

/**
 * Get events for a specific date
 * @param {Array} events - Array of normalized events
 * @param {Date} targetDate - Target date
 * @returns {Array} - Events on that date
 */
export const getEventsForDate = (events, targetDate) => {
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);
  
  return filterEventsByDateRange(events, startOfDay, endOfDay);
};

/**
 * Event Normalizers
 */

/**
 * Normalize Company Event to unified model
 * @param {Object} companyEvent - CompanyEvent model instance
 * @returns {Object} - Normalized event
 */
export const normalizeCompanyEvent = (companyEvent) => {
  return {
    id: `company_event_${companyEvent.id}`,
    sourceType: 'company_event',
    sourceId: companyEvent.id,
    title: companyEvent.title,
    description: companyEvent.description,
    eventType: companyEvent.eventType || 'event',
    startDate: new Date(companyEvent.startDate),
    endDate: new Date(companyEvent.endDate),
    isAllDay: companyEvent.isAllDay || false,
    color: companyEvent.color || '#3498db',
    priority: companyEvent.priority || 1,
    employeeId: null,
    employeeName: null,
    employeeCode: null,
    department: null,
    metadata: {
      location: companyEvent.location,
      organizer: companyEvent.organizer,
      isPublic: companyEvent.isPublic,
      status: companyEvent.status
    }
  };
};

/**
 * Normalize Holiday to unified model
 * @param {Object} holiday - Holiday model instance
 * @returns {Object} - Normalized event
 */
export const normalizeHoliday = (holiday) => {
  const holidayDate = new Date(holiday.date);
  
  return {
    id: `holiday_${holiday.id}`,
    sourceType: 'holiday',
    sourceId: holiday.id,
    title: holiday.name,
    description: holiday.description,
    eventType: 'holiday',
    startDate: holidayDate,
    endDate: holidayDate,
    isAllDay: true,
    color: holiday.color || '#dc2626',
    priority: 3, // High priority for holidays
    employeeId: null,
    employeeName: null,
    employeeCode: null,
    department: null,
    metadata: {
      type: holiday.type,
      isPaid: holiday.isPaid,
      isRecurring: holiday.isRecurring,
      recurrencePattern: holiday.recurrencePattern,
      isActive: holiday.isActive
    }
  };
};

/**
 * Normalize Leave Request to unified model
 * @param {Object} leaveRequest - LeaveRequest model instance with employee
 * @returns {Object} - Normalized event
 */
export const normalizeLeaveRequest = (leaveRequest) => {
  const employee = leaveRequest.employee || {};
  const employeeName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
  
  return {
    id: `leave_${leaveRequest.id}`,
    sourceType: 'leave',
    sourceId: leaveRequest.id,
    title: `${employeeName} - ${leaveRequest.leaveType}`,
    description: leaveRequest.reason,
    eventType: 'leave',
    startDate: new Date(leaveRequest.startDate),
    endDate: new Date(leaveRequest.endDate),
    isAllDay: true,
    color: '#f59e0b',
    priority: 2,
    employeeId: leaveRequest.employeeId,
    employeeName: employeeName,
    employeeCode: employee.employeeId,
    department: employee.department,
    metadata: {
      leaveType: leaveRequest.leaveType,
      totalDays: leaveRequest.totalDays,
      isHalfDay: leaveRequest.isHalfDay,
      halfDayPeriod: leaveRequest.halfDayPeriod,
      status: leaveRequest.status
    }
  };
};

/**
 * Normalize Employee Birthday to unified model
 * @param {Object} employee - Employee model instance
 * @param {number} year - Target year for birthday
 * @returns {Object} - Normalized event
 */
export const normalizeBirthday = (employee, year) => {
  const dob = new Date(employee.dateOfBirth);
  const birthdayThisYear = new Date(year, dob.getMonth(), dob.getDate());
  const employeeName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
  const age = year - dob.getFullYear();
  
  return {
    id: `birthday_${employee.id}_${year}`,
    sourceType: 'birthday',
    sourceId: employee.id,
    title: `🎂 ${employeeName}`,
    description: `${employeeName}'s ${age}${getOrdinalSuffix(age)} birthday`,
    eventType: 'birthday',
    startDate: birthdayThisYear,
    endDate: birthdayThisYear,
    isAllDay: true,
    color: '#ec4899',
    priority: 1,
    employeeId: employee.id,
    employeeName: employeeName,
    employeeCode: employee.employeeId,
    department: employee.department,
    metadata: {
      age: age,
      dateOfBirth: employee.dateOfBirth
    }
  };
};

/**
 * Normalize Work Anniversary to unified model
 * @param {Object} employee - Employee model instance
 * @param {number} year - Target year for anniversary
 * @returns {Object} - Normalized event
 */
export const normalizeAnniversary = (employee, year) => {
  const joinDate = new Date(employee.joiningDate);
  const anniversaryThisYear = new Date(year, joinDate.getMonth(), joinDate.getDate());
  const employeeName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
  const years = year - joinDate.getFullYear();
  
  return {
    id: `anniversary_${employee.id}_${year}`,
    sourceType: 'anniversary',
    sourceId: employee.id,
    title: `🎊 ${employeeName} - ${years} years`,
    description: `${employeeName}'s ${years}${getOrdinalSuffix(years)} work anniversary`,
    eventType: 'anniversary',
    startDate: anniversaryThisYear,
    endDate: anniversaryThisYear,
    isAllDay: true,
    color: '#8b5cf6',
    priority: 1,
    employeeId: employee.id,
    employeeName: employeeName,
    employeeCode: employee.employeeId,
    department: employee.department,
    metadata: {
      years: years,
      joiningDate: employee.joiningDate
    }
  };
};

/**
 * Normalize Attendance Record to unified model
 * @param {Object} attendanceRecord - AttendanceRecord model instance with employee
 * @returns {Object} - Normalized event
 */
export const normalizeAttendance = (attendanceRecord) => {
  const employee = attendanceRecord.employee || {};
  const employeeName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
  const attendanceDate = new Date(attendanceRecord.date);
  
  // Create title based on attendance status
  let title = `${employeeName} - ${attendanceRecord.status}`;
  if (attendanceRecord.isLate) title += ' (Late)';
  if (attendanceRecord.isEarlyDeparture) title += ' (Early Exit)';
  
  return {
    id: `attendance_${attendanceRecord.id}`,
    sourceType: 'attendance',
    sourceId: attendanceRecord.id,
    title: title,
    description: `Work hours: ${attendanceRecord.workHours || 'N/A'}`,
    eventType: 'attendance',
    startDate: attendanceDate,
    endDate: attendanceDate,
    isAllDay: true,
    color: getAttendanceColor(attendanceRecord.status),
    priority: 0, // Low priority for attendance
    employeeId: attendanceRecord.employeeId,
    employeeName: employeeName,
    employeeCode: employee.employeeId,
    department: employee.department,
    metadata: {
      checkIn: attendanceRecord.checkIn,
      checkOut: attendanceRecord.checkOut,
      status: attendanceRecord.status,
      workHours: attendanceRecord.workHours,
      breakTime: attendanceRecord.breakTime,
      isLate: attendanceRecord.isLate,
      isEarlyDeparture: attendanceRecord.isEarlyDeparture,
      lateMinutes: attendanceRecord.lateMinutes,
      earlyExitMinutes: attendanceRecord.earlyExitMinutes
    }
  };
};

/**
 * Event Sorting and Grouping
 */

/**
 * Sort events by priority and date
 * @param {Array} events - Array of normalized events
 * @returns {Array} - Sorted events
 */
export const sortEventsByPriorityAndDate = (events) => {
  return events.sort((a, b) => {
    // First sort by priority (higher priority first)
    if (a.priority !== b.priority) {
      return b.priority - a.priority;
    }
    
    // Then sort by start date
    const dateA = new Date(a.startDate);
    const dateB = new Date(b.startDate);
    
    if (dateA.getTime() !== dateB.getTime()) {
      return dateA - dateB;
    }
    
    // Finally sort by event type for consistency
    const typeOrder = {
      'holiday': 0,
      'leave': 1,
      'event': 2,
      'birthday': 3,
      'anniversary': 4,
      'attendance': 5
    };
    
    return (typeOrder[a.eventType] || 99) - (typeOrder[b.eventType] || 99);
  });
};

/**
 * Group events by date
 * @param {Array} events - Array of normalized events
 * @returns {Object} - Events grouped by date string (YYYY-MM-DD)
 */
export const groupEventsByDate = (events) => {
  return events.reduce((groups, event) => {
    const dateKey = new Date(event.startDate).toISOString().split('T')[0];
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    
    groups[dateKey].push(event);
    return groups;
  }, {});
};

/**
 * Database Query Builders
 */

/**
 * Build date range filter for Sequelize queries
 * @param {Date} startDate - Range start
 * @param {Date} endDate - Range end
 * @param {string} dateField - Field name for date comparison (default: 'date')
 * @returns {Object} - Sequelize where clause
 */
export const buildDateRangeFilter = (startDate, endDate, dateField = 'date') => {
  return {
    [dateField]: {
      [Op.between]: [startDate, endDate]
    }
  };
};

/**
 * Build date range filter for events with start/end dates
 * @param {Date} rangeStart - Range start
 * @param {Date} rangeEnd - Range end
 * @returns {Object} - Sequelize where clause for events with date ranges
 */
export const buildEventDateRangeFilter = (rangeStart, rangeEnd) => {
  return {
    [Op.or]: [
      // Event starts within range
      {
        startDate: { [Op.between]: [rangeStart, rangeEnd] }
      },
      // Event ends within range
      {
        endDate: { [Op.between]: [rangeStart, rangeEnd] }
      },
      // Event spans the entire range
      {
        [Op.and]: [
          { startDate: { [Op.lte]: rangeStart } },
          { endDate: { [Op.gte]: rangeEnd } }
        ]
      }
    ]
  };
};

/**
 * Utility Functions
 */

/**
 * Get ordinal suffix for numbers (1st, 2nd, 3rd, etc.)
 * @param {number} num - Number to get suffix for
 * @returns {string} - Ordinal suffix
 */
const getOrdinalSuffix = (num) => {
  const j = num % 10;
  const k = num % 100;
  
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
};

/**
 * Get color for attendance status
 * @param {string} status - Attendance status
 * @returns {string} - Hex color code
 */
const getAttendanceColor = (status) => {
  const colors = {
    'present': '#10b981',    // Green
    'absent': '#ef4444',     // Red
    'late': '#f59e0b',       // Orange
    'half_day': '#6366f1',   // Indigo
    'on_leave': '#8b5cf6'    // Purple
  };
  
  return colors[status] || '#6b7280'; // Gray for unknown status
};

/**
 * Legacy Support Functions
 * These maintain compatibility with existing frontend code
 */

/**
 * Convert normalized events back to legacy format for frontend compatibility
 * @param {Array} normalizedEvents - Array of normalized events
 * @returns {Object} - Legacy format with separate arrays by type
 */
export const convertToLegacyFormat = (normalizedEvents) => {
  const legacy = {
    events: [],
    holidays: [],
    leaves: [],
    birthdays: [],
    anniversaries: [],
    attendance: []
  };
  
  normalizedEvents.forEach(event => {
    const legacyEvent = {
      id: event.sourceId,
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      eventType: event.eventType,
      isAllDay: event.isAllDay,
      color: event.color,
      ...event.metadata
    };
    
    // Add employee info if available
    if (event.employeeId) {
      legacyEvent.employeeId = event.employeeId;
      legacyEvent.employeeName = event.employeeName;
      legacyEvent.employeeCode = event.employeeCode;
      legacyEvent.department = event.department;
    }
    
    // Route to appropriate array based on source type
    switch (event.sourceType) {
      case 'company_event':
        legacy.events.push(legacyEvent);
        break;
      case 'holiday':
        legacy.holidays.push({
          ...legacyEvent,
          name: event.title,
          date: event.startDate,
          type: event.metadata.type,
          isPaid: event.metadata.isPaid,
          isRecurring: event.metadata.isRecurring
        });
        break;
      case 'leave':
        legacy.leaves.push({
          ...legacyEvent,
          leaveType: event.metadata.leaveType,
          totalDays: event.metadata.totalDays,
          isHalfDay: event.metadata.isHalfDay,
          halfDayPeriod: event.metadata.halfDayPeriod,
          reason: event.description,
          status: event.metadata.status
        });
        break;
      case 'birthday':
        legacy.birthdays.push({
          ...legacyEvent,
          date: event.startDate,
          age: event.metadata.age
        });
        break;
      case 'anniversary':
        legacy.anniversaries.push({
          ...legacyEvent,
          date: event.startDate,
          years: event.metadata.years
        });
        break;
      case 'attendance':
        legacy.attendance.push(legacyEvent);
        break;
    }
  });
  
  return legacy;
};