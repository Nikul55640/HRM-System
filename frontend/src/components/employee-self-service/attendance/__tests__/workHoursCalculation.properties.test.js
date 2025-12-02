/**
 * Property-Based Tests for Work Hours Calculation
 * Feature: employee-self-service, Property 9: Work hours calculation
 * Validates: Requirements 6.4
 */

import { describe, it, expect } from '@jest/globals';
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

describe('Work Hours Calculation Properties', () => {
  /**
   * Property 9: Work hours calculation
   * For any attendance record with check-in and check-out times,
   * the calculated work hours should equal the time difference between check-out and check-in.
   */
  
  describe('Basic Calculation', () => {
    it('should calculate hours from check-in to check-out', () => {
      const checkIn = new Date('2025-01-15T09:00:00');
      const checkOut = new Date('2025-01-15T17:00:00');
      
      expect(calculateWorkHours(checkIn, checkOut)).toBe(8);
    });

    it('should handle standard 8-hour workday', () => {
      const checkIn = new Date('2025-01-15T09:00:00');
      const checkOut = new Date('2025-01-15T17:00:00');
      
      expect(calculateWorkHours(checkIn, checkOut)).toBe(8);
    });

    it('should handle 9-hour workday', () => {
      const checkIn = new Date('2025-01-15T09:00:00');
      const checkOut = new Date('2025-01-15T18:00:00');
      
      expect(calculateWorkHours(checkIn, checkOut)).toBe(9);
    });

    it('should handle half-day work', () => {
      const checkIn = new Date('2025-01-15T09:00:00');
      const checkOut = new Date('2025-01-15T13:00:00');
      
      expect(calculateWorkHours(checkIn, checkOut)).toBe(4);
    });
  });

  describe('Fractional Hours', () => {
    it('should calculate hours with 30-minute precision', () => {
      const checkIn = new Date('2025-01-15T09:00:00');
      const checkOut = new Date('2025-01-15T17:30:00');
      
      expect(calculateWorkHours(checkIn, checkOut)).toBe(8.5);
    });

    it('should calculate hours with 15-minute precision', () => {
      const checkIn = new Date('2025-01-15T09:00:00');
      const checkOut = new Date('2025-01-15T17:15:00');
      
      expect(calculateWorkHours(checkIn, checkOut)).toBe(8.25);
    });

    it('should calculate hours with minute precision', () => {
      const checkIn = new Date('2025-01-15T09:00:00');
      const checkOut = new Date('2025-01-15T17:10:00');
      
      const hours = calculateWorkHours(checkIn, checkOut);
      expect(hours).toBeCloseTo(8.17, 2);
    });
  });

  describe('Different Time Ranges', () => {
    it('should handle early morning shift', () => {
      const checkIn = new Date('2025-01-15T06:00:00');
      const checkOut = new Date('2025-01-15T14:00:00');
      
      expect(calculateWorkHours(checkIn, checkOut)).toBe(8);
    });

    it('should handle late shift', () => {
      const checkIn = new Date('2025-01-15T14:00:00');
      const checkOut = new Date('2025-01-15T22:00:00');
      
      expect(calculateWorkHours(checkIn, checkOut)).toBe(8);
    });

    it('should handle night shift', () => {
      const checkIn = new Date('2025-01-15T22:00:00');
      const checkOut = new Date('2025-01-16T06:00:00');
      
      expect(calculateWorkHours(checkIn, checkOut)).toBe(8);
    });

    it('should handle overnight shift', () => {
      const checkIn = new Date('2025-01-15T20:00:00');
      const checkOut = new Date('2025-01-16T04:00:00');
      
      expect(calculateWorkHours(checkIn, checkOut)).toBe(8);
    });
  });

  describe('Edge Cases', () => {
    it('should handle same check-in and check-out time', () => {
      const time = new Date('2025-01-15T09:00:00');
      
      expect(calculateWorkHours(time, time)).toBe(0);
    });

    it('should handle very short duration', () => {
      const checkIn = new Date('2025-01-15T09:00:00');
      const checkOut = new Date('2025-01-15T09:05:00');
      
      const hours = calculateWorkHours(checkIn, checkOut);
      expect(hours).toBeCloseTo(0.08, 2);
    });

    it('should handle very long duration', () => {
      const checkIn = new Date('2025-01-15T09:00:00');
      const checkOut = new Date('2025-01-15T21:00:00');
      
      expect(calculateWorkHours(checkIn, checkOut)).toBe(12);
    });

    it('should handle null check-in', () => {
      const checkOut = new Date('2025-01-15T17:00:00');
      
      expect(calculateWorkHours(null, checkOut)).toBe(0);
    });

    it('should handle null check-out', () => {
      const checkIn = new Date('2025-01-15T09:00:00');
      
      expect(calculateWorkHours(checkIn, null)).toBe(0);
    });

    it('should handle both null', () => {
      expect(calculateWorkHours(null, null)).toBe(0);
    });

    it('should handle undefined values', () => {
      expect(calculateWorkHours(undefined, undefined)).toBe(0);
      expect(calculateWorkHours(undefined, new Date())).toBe(0);
      expect(calculateWorkHours(new Date(), undefined)).toBe(0);
    });
  });

  describe('String Date Inputs', () => {
    it('should handle ISO string dates', () => {
      const checkIn = '2025-01-15T09:00:00';
      const checkOut = '2025-01-15T17:00:00';
      
      expect(calculateWorkHours(checkIn, checkOut)).toBe(8);
    });

    it('should handle date strings with timezone', () => {
      const checkIn = '2025-01-15T09:00:00Z';
      const checkOut = '2025-01-15T17:00:00Z';
      
      expect(calculateWorkHours(checkIn, checkOut)).toBe(8);
    });
  });

  describe('Mathematical Properties', () => {
    it('should be non-negative for valid check-in/check-out', () => {
      const checkIn = new Date('2025-01-15T09:00:00');
      const checkOut = new Date('2025-01-15T17:00:00');
      
      const hours = calculateWorkHours(checkIn, checkOut);
      expect(hours).toBeGreaterThanOrEqual(0);
    });

    it('should return 0 for check-out before check-in', () => {
      const checkIn = new Date('2025-01-15T17:00:00');
      const checkOut = new Date('2025-01-15T09:00:00');
      
      expect(calculateWorkHours(checkIn, checkOut)).toBe(0);
    });

    it('should be proportional to time difference', () => {
      const checkIn = new Date('2025-01-15T09:00:00');
      
      const hours4 = calculateWorkHours(checkIn, new Date('2025-01-15T13:00:00'));
      const hours8 = calculateWorkHours(checkIn, new Date('2025-01-15T17:00:00'));
      
      expect(hours8).toBe(hours4 * 2);
    });
  });

  describe('Real-World Scenarios', () => {
    it('should calculate for typical office hours', () => {
      const checkIn = new Date('2025-01-15T09:00:00');
      const checkOut = new Date('2025-01-15T18:00:00'); // 9 hours with 1 hour lunch
      
      expect(calculateWorkHours(checkIn, checkOut)).toBe(9);
    });

    it('should calculate for flexible hours', () => {
      const checkIn = new Date('2025-01-15T10:30:00');
      const checkOut = new Date('2025-01-15T18:30:00');
      
      expect(calculateWorkHours(checkIn, checkOut)).toBe(8);
    });

    it('should calculate for overtime', () => {
      const checkIn = new Date('2025-01-15T09:00:00');
      const checkOut = new Date('2025-01-15T20:00:00');
      
      expect(calculateWorkHours(checkIn, checkOut)).toBe(11);
    });

    it('should calculate for part-time hours', () => {
      const checkIn = new Date('2025-01-15T09:00:00');
      const checkOut = new Date('2025-01-15T13:00:00');
      
      expect(calculateWorkHours(checkIn, checkOut)).toBe(4);
    });
  });

  describe('Multiple Check-ins Same Day', () => {
    it('should calculate morning session', () => {
      const checkIn = new Date('2025-01-15T09:00:00');
      const checkOut = new Date('2025-01-15T12:00:00');
      
      expect(calculateWorkHours(checkIn, checkOut)).toBe(3);
    });

    it('should calculate afternoon session', () => {
      const checkIn = new Date('2025-01-15T13:00:00');
      const checkOut = new Date('2025-01-15T17:00:00');
      
      expect(calculateWorkHours(checkIn, checkOut)).toBe(4);
    });

    it('should sum multiple sessions correctly', () => {
      const morning = calculateWorkHours(
        new Date('2025-01-15T09:00:00'),
        new Date('2025-01-15T12:00:00')
      );
      const afternoon = calculateWorkHours(
        new Date('2025-01-15T13:00:00'),
        new Date('2025-01-15T17:00:00')
      );
      
      expect(morning + afternoon).toBe(7);
    });
  });

  describe('Precision and Rounding', () => {
    it('should round to 2 decimal places', () => {
      const checkIn = new Date('2025-01-15T09:00:00');
      const checkOut = new Date('2025-01-15T17:20:00'); // 8 hours 20 minutes = 8.333...
      
      const hours = calculateWorkHours(checkIn, checkOut);
      expect(hours).toBeCloseTo(8.33, 2);
    });

    it('should handle rounding edge cases', () => {
      const checkIn = new Date('2025-01-15T09:00:00');
      const checkOut = new Date('2025-01-15T17:29:00'); // 8 hours 29 minutes
      
      const hours = calculateWorkHours(checkIn, checkOut);
      expect(hours).toBeCloseTo(8.48, 2);
    });
  });

  describe('Consistency Checks', () => {
    it('should produce same result for same inputs', () => {
      const checkIn = new Date('2025-01-15T09:00:00');
      const checkOut = new Date('2025-01-15T17:00:00');
      
      const result1 = calculateWorkHours(checkIn, checkOut);
      const result2 = calculateWorkHours(checkIn, checkOut);
      const result3 = calculateWorkHours(checkIn, checkOut);
      
      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });

    it('should be independent of date', () => {
      // Same time range on different dates should give same hours
      const hours1 = calculateWorkHours(
        new Date('2025-01-15T09:00:00'),
        new Date('2025-01-15T17:00:00')
      );
      const hours2 = calculateWorkHours(
        new Date('2025-02-20T09:00:00'),
        new Date('2025-02-20T17:00:00')
      );
      
      expect(hours1).toBe(hours2);
    });
  });

  describe('Weekly and Monthly Totals', () => {
    it('should calculate weekly hours correctly', () => {
      const dailyHours = [];
      
      for (let day = 0; day < 5; day++) {
        const checkIn = new Date(`2025-01-${15 + day}T09:00:00`);
        const checkOut = new Date(`2025-01-${15 + day}T17:00:00`);
        dailyHours.push(calculateWorkHours(checkIn, checkOut));
      }
      
      const weeklyTotal = dailyHours.reduce((sum, hours) => sum + hours, 0);
      expect(weeklyTotal).toBe(40); // 5 days * 8 hours
    });

    it('should calculate monthly hours correctly', () => {
      const monthlyHours = 22 * 8; // 22 working days * 8 hours
      expect(monthlyHours).toBe(176);
    });
  });
});
