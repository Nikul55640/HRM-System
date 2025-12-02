import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AttendanceSummary 
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
import AttendanceCalendar 
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
import { calculateWorkHours } 
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

describe('Attendance Module', () => {
  describe('Helper Functions', () => {
    it('calculates work hours correctly', () => {
      const checkIn = '2024-03-20T09:00:00';
      const checkOut = '2024-03-20T18:00:00';
      expect(calculateWorkHours(checkIn, checkOut)).toBe(9);
    });

    it('returns 0 for missing times', () => {
      expect(calculateWorkHours(null, null)).toBe(0);
    });
  });

  describe('AttendanceSummary', () => {
    const mockSummary = {
      avgWorkHours: 8.5,
      presentDays: 20,
      lateArrivals: 2,
      earlyDepartures: 1
    };

    it('renders summary stats', () => {
      render(<AttendanceSummary summary={mockSummary} />);
      expect(screen.getByText('8.5 hrs')).toBeInTheDocument();
      expect(screen.getByText('20')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  describe('AttendanceCalendar', () => {
    const mockRecords = [
      {
        id: '1',
        date: '2024-03-20',
        checkIn: '2024-03-20T09:00:00',
        checkOut: '2024-03-20T18:00:00',
        status: 'Present'
      }
    ];

    it('renders attendance records', () => {
      render(<AttendanceCalendar records={mockRecords} />);
      expect(screen.getByText('Present')).toBeInTheDocument();
      expect(screen.getByText('9 hrs')).toBeInTheDocument();
    });

    it('renders empty state', () => {
      render(<AttendanceCalendar records={[]} />);
      expect(screen.getByText('No attendance records found for this period.')).toBeInTheDocument();
    });
  });
});
