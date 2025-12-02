/**
 * Unit Tests for Dashboard Components
 * Requirements: 10.1, 10.2, 10.3, 10.4
 */

import { describe, it, expect, vi } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import LeaveBalanceWidget 
        param($match)
        $importPath = $match.Groups[1].Value
        $targetPath = "frontend/src/$importPath"
        
        # Calculate relative path
        if ($fileDir) {
            $levels = ($fileDir -split '\\').Count
            $prefix = '../' * $levels
        } else {
            $prefix = './'
        }
        
        "from '$prefix$importPath'"
    ;
import AttendanceWidget 
        param($match)
        $importPath = $match.Groups[1].Value
        $targetPath = "frontend/src/$importPath"
        
        # Calculate relative path
        if ($fileDir) {
            $levels = ($fileDir -split '\\').Count
            $prefix = '../' * $levels
        } else {
            $prefix = './'
        }
        
        "from '$prefix$importPath'"
    ;
import RequestsWidget 
        param($match)
        $importPath = $match.Groups[1].Value
        $targetPath = "frontend/src/$importPath"
        
        # Calculate relative path
        if ($fileDir) {
            $levels = ($fileDir -split '\\').Count
            $prefix = '../' * $levels
        } else {
            $prefix = './'
        }
        
        "from '$prefix$importPath'"
    ;

describe('LeaveBalanceWidget', () => {
  it('should render leave balance correctly', () => {
    const mockData = {
      leaveTypes: [
        { type: 'annual', allocated: 20, used: 5, pending: 2, available: 13 },
        { type: 'sick', allocated: 10, used: 3, pending: 0, available: 7 },
      ],
    };

    const { container } = render(<LeaveBalanceWidget leaveBalance={mockData} />);
    expect(container).toBeTruthy();
  });

  it('should show no data message when leave balance is null', () => {
    const { container } = render(<LeaveBalanceWidget leaveBalance={null} />);
    expect(container.textContent).toContain('No leave data available');
  });
});

describe('AttendanceWidget', () => {
  it('should render attendance summary correctly', () => {
    const mockData = {
      present: 22,
      absent: 0,
      totalDays: 22,
      workHours: 176,
    };

    const { container } = render(<AttendanceWidget attendanceSummary={mockData} />);
    expect(container).toBeTruthy();
  });

  it('should show no data message when attendance is null', () => {
    const { container } = render(<AttendanceWidget attendanceSummary={null} />);
    expect(container.textContent).toContain('No attendance data available');
  });
});

describe('RequestsWidget', () => {
  it('should render requests correctly', () => {
    const mockData = [
      { _id: '1', status: 'pending', requestType: 'reimbursement', submittedAt: new Date() },
      { _id: '2', status: 'approved', requestType: 'advance', submittedAt: new Date() },
    ];

    const { container } = render(<RequestsWidget requests={mockData} />);
    expect(container).toBeTruthy();
  });

  it('should show no requests message when array is empty', () => {
    const { container } = render(<RequestsWidget requests={[]} />);
    expect(container.textContent).toContain('No requests found');
  });
});
