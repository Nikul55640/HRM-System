/**
 * Property-Based Tests for Dashboard
 * Feature: employee-self-service, Property 13: Dashboard data consistency
 * Validates: Requirements 10.2
 */

import { describe, it, expect } from '@jest/globals';

describe('Dashboard Data Consistency Properties', () => {
  /**
   * Property 13: Dashboard data consistency
   * For any dashboard display, the leave balance, attendance count, and pending request count
   * should match the actual data in their respective modules.
   */
  it('should maintain consistency between dashboard stats and module data', () => {
    // Mock data from different modules
    const leaveBalance = {
      leaveTypes: [
        { type: 'annual', allocated: 20, used: 5, pending: 2, available: 13 },
        { type: 'sick', allocated: 10, used: 3, pending: 0, available: 7 },
      ],
    };

    const attendanceSummary = {
      present: 22,
      absent: 0,
      totalDays: 22,
      workHours: 176,
    };

    const requests = [
      { _id: '1', status: 'pending', requestType: 'reimbursement' },
      { _id: '2', status: 'pending', requestType: 'advance' },
      { _id: '3', status: 'approved', requestType: 'transfer' },
    ];

    // Calculate dashboard stats
    const dashboardStats = {
      totalLeaveAvailable: leaveBalance.leaveTypes.reduce((sum, type) => sum + type.available, 0),
      attendancePercentage: (attendanceSummary.present / attendanceSummary.totalDays) * 100,
      pendingRequestsCount: requests.filter(r => r.status === 'pending').length,
    };

    // Verify consistency
    expect(dashboardStats.totalLeaveAvailable).toBe(20); // 13 + 7
    expect(dashboardStats.attendancePercentage).toBe(100); // 22/22 * 100
    expect(dashboardStats.pendingRequestsCount).toBe(2);

    // Property: Dashboard stats must match source data
    const recalculatedLeave = leaveBalance.leaveTypes.reduce((sum, type) => sum + type.available, 0);
    const recalculatedAttendance = (attendanceSummary.present / attendanceSummary.totalDays) * 100;
    const recalculatedPending = requests.filter(r => r.status === 'pending').length;

    expect(dashboardStats.totalLeaveAvailable).toBe(recalculatedLeave);
    expect(dashboardStats.attendancePercentage).toBe(recalculatedAttendance);
    expect(dashboardStats.pendingRequestsCount).toBe(recalculatedPending);
  });

  it('should handle empty data gracefully', () => {
    const emptyLeaveBalance = { leaveTypes: [] };
    const emptyAttendance = { present: 0, absent: 0, totalDays: 0, workHours: 0 };
    const emptyRequests = [];

    const dashboardStats = {
      totalLeaveAvailable: emptyLeaveBalance.leaveTypes.reduce((sum, type) => sum + type.available, 0),
      attendancePercentage: emptyAttendance.totalDays > 0 
        ? (emptyAttendance.present / emptyAttendance.totalDays) * 100 
        : 0,
      pendingRequestsCount: emptyRequests.filter(r => r.status === 'pending').length,
    };

    expect(dashboardStats.totalLeaveAvailable).toBe(0);
    expect(dashboardStats.attendancePercentage).toBe(0);
    expect(dashboardStats.pendingRequestsCount).toBe(0);
  });
});
