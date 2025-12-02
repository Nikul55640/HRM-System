import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LeaveBalanceCards 
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
import LeaveHistoryTable 
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
import LeaveApplicationForm 
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
import { calculateLeaveBalance } 
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

// Mock toast
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Leave Module', () => {
  describe('Helper Functions', () => {
    it('calculates leave balance correctly', () => {
      expect(calculateLeaveBalance(10, 2, 1)).toBe(7);
      expect(calculateLeaveBalance(10, 0, 0)).toBe(10);
    });
  });

  describe('LeaveBalanceCards', () => {
    const mockBalances = [
      { type: 'Sick Leave', allocated: 10, used: 2, pending: 1 },
      { type: 'Casual Leave', allocated: 12, used: 0, pending: 0 }
    ];

    it('renders balances correctly', () => {
      render(<LeaveBalanceCards balances={mockBalances} />);
      expect(screen.getByText('Sick Leave')).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument(); // 10 - 2 - 1
      expect(screen.getByText('Casual Leave')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
    });
  });

  describe('LeaveHistoryTable', () => {
    const mockHistory = [
      {
        id: '1',
        leaveType: 'Sick Leave',
        startDate: '2024-03-20',
        endDate: '2024-03-21',
        days: 2,
        reason: 'Fever',
        status: 'Approved'
      }
    ];

    it('renders history table', () => {
      render(<LeaveHistoryTable history={mockHistory} />);
      expect(screen.getByText('Sick Leave')).toBeInTheDocument();
      expect(screen.getByText('Fever')).toBeInTheDocument();
      expect(screen.getByText('Approved')).toBeInTheDocument();
    });
  });

  describe('LeaveApplicationForm', () => {
    const mockSubmit = jest.fn();

    it('validates required fields', async () => {
      render(<LeaveApplicationForm onSubmit={mockSubmit} isLoading={false} />);
      
      fireEvent.click(screen.getByText('Apply Leave'));

      await waitFor(() => {
        expect(screen.getAllByText(/Required/i).length).toBeGreaterThan(0);
      });
    });

    it('validates end date after start date', async () => {
      render(<LeaveApplicationForm onSubmit={mockSubmit} isLoading={false} />);
      
      const startDateInput = screen.getByLabelText(/Start Date/);
      const endDateInput = screen.getByLabelText(/End Date/);
      
      fireEvent.change(startDateInput, { target: { value: '2024-03-20' } });
      fireEvent.change(endDateInput, { target: { value: '2024-03-19' } }); // Before start date
      
      fireEvent.click(screen.getByText('Apply Leave'));

      await waitFor(() => {
        expect(screen.getByText('End date must be after or equal to start date')).toBeInTheDocument();
      });
    });
  });
});
