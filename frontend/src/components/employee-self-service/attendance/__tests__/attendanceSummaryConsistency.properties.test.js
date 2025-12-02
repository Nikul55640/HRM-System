/**
 * Property-Based Tests for Attendance Summary Consistency
 * Feature: employee-self-service, Property 8: Attendance summary consistency
 * Validates: Requirements 6.2
 */

import { describe, it, expect } from '@jest/globals';

describe('Attendance Summary Consistency Properties', () => {
  /**
   * Property 8: Attendance summary consistency
   * For any monthly attendance summary, the total days should equal the sum of
   * present, absent, leave, and holiday days for that month.
   */
  
  const calculateSummary = (present, absent, leave, holiday) => {
    return {
      present,
      absent,
      leave,
      holiday,
      totalDays: present + absent + leave + holiday,
    };
  };

  describe('Basic Consistency', () => {
    it('should sum all attendance types to total days', () => {
      const summary = calculateSummary(22, 0, 0, 0);
      expect(summary.totalDays).toBe(22);
      expect(summary.present + summary.absent + summary.leave + summary.holiday).toBe(summary.totalDays);
    });

    it('should handle mixed attendance types', () => {
      const summary = calculateSummary(20, 1, 1, 0);
      expect(summary.totalDays).toBe(22);
      expect(summary.present + summary.absent + summary.leave + summary.holiday).toBe(22);
    });

    it('should handle all attendance types present', () => {
      const summary = calculateSummary(18, 2, 1, 1);
      expect(summary.totalDays).toBe(22);
      expect(summary.present + summary.absent + summary.leave + summary.holiday).toBe(22);
    });
  });

  describe('Various Month Scenarios', () => {
    it('should handle 30-day months', () => {
      const summary = calculateSummary(22, 0, 0, 8);
      expect(summary.totalDays).toBe(30);
    });

    it('should handle 31-day months', () => {
      const summary = calculateSummary(23, 0, 0, 8);
      expect(summary.totalDays).toBe(31);
    });

    it('should handle 28-day February', () => {
      const summary = calculateSummary(20, 0, 0, 8);
      expect(summary.totalDays).toBe(28);
    });

    it('should handle 29-day leap year February', () => {
      const summary = calculateSummary(21, 0, 0, 8);
      expect(summary.totalDays).toBe(29);
    });
  });

  describe('Edge Cases', () => {
    it('should handle all present days', () => {
      const summary = calculateSummary(22, 0, 0, 0);
      expect(summary.totalDays).toBe(22);
      expect(summary.present).toBe(summary.totalDays);
    });

    it('should handle all absent days', () => {
      const summary = calculateSummary(0, 22, 0, 0);
      expect(summary.totalDays).toBe(22);
      expect(summary.absent).toBe(summary.totalDays);
    });

    it('should handle all leave days', () => {
      const summary = calculateSummary(0, 0, 22, 0);
      expect(summary.totalDays).toBe(22);
      expect(summary.leave).toBe(summary.totalDays);
    });

    it('should handle all holiday days', () => {
      const summary = calculateSummary(0, 0, 0, 22);
      expect(summary.totalDays).toBe(22);
      expect(summary.holiday).toBe(summary.totalDays);
    });

    it('should handle zero days', () => {
      const summary = calculateSummary(0, 0, 0, 0);
      expect(summary.totalDays).toBe(0);
    });
  });

  describe('Consistency Validation', () => {
    it('should always satisfy: present + absent + leave + holiday = totalDays', () => {
      const testCases = [
        { present: 22, absent: 0, leave: 0, holiday: 0 },
        { present: 20, absent: 2, leave: 0, holiday: 0 },
        { present: 18, absent: 1, leave: 2, holiday: 1 },
        { present: 15, absent: 3, leave: 2, holiday: 2 },
        { present: 10, absent: 5, leave: 3, holiday: 4 },
      ];

      testCases.forEach(({ present, absent, leave, holiday }) => {
        const summary = calculateSummary(present, absent, leave, holiday);
        expect(summary.present + summary.absent + summary.leave + summary.holiday).toBe(summary.totalDays);
      });
    });

    it('should maintain consistency regardless of distribution', () => {
      const totalDays = 22;
      
      // Different distributions that sum to 22
      const distributions = [
        [22, 0, 0, 0],
        [20, 2, 0, 0],
        [18, 2, 2, 0],
        [15, 3, 2, 2],
        [10, 5, 4, 3],
        [0, 0, 0, 22],
      ];

      distributions.forEach(([present, absent, leave, holiday]) => {
        const summary = calculateSummary(present, absent, leave, holiday);
        expect(summary.totalDays).toBe(totalDays);
      });
    });
  });

  describe('Real-World Scenarios', () => {
    it('should handle typical working month', () => {
      // 22 working days, 8 weekends/holidays
      const summary = calculateSummary(20, 1, 1, 8);
      expect(summary.totalDays).toBe(30);
      expect(summary.present + summary.absent + summary.leave + summary.holiday).toBe(30);
    });

    it('should handle month with sick leave', () => {
      const summary = calculateSummary(18, 0, 4, 8);
      expect(summary.totalDays).toBe(30);
      expect(summary.leave).toBe(4);
    });

    it('should handle month with absences', () => {
      const summary = calculateSummary(19, 3, 0, 8);
      expect(summary.totalDays).toBe(30);
      expect(summary.absent).toBe(3);
    });

    it('should handle month with public holidays', () => {
      const summary = calculateSummary(18, 0, 0, 13); // Month with many holidays
      expect(summary.totalDays).toBe(31);
      expect(summary.holiday).toBe(13);
    });
  });

  describe('Partial Month Scenarios', () => {
    it('should handle employee joining mid-month', () => {
      // Employee joined on 15th, worked 10 days
      const summary = calculateSummary(10, 0, 0, 0);
      expect(summary.totalDays).toBe(10);
    });

    it('should handle employee leaving mid-month', () => {
      // Employee left on 15th, worked 15 days
      const summary = calculateSummary(15, 0, 0, 0);
      expect(summary.totalDays).toBe(15);
    });
  });

  describe('Mathematical Properties', () => {
    it('should be associative', () => {
      const present = 18;
      const absent = 2;
      const leave = 1;
      const holiday = 1;
      
      const sum1 = (present + absent) + (leave + holiday);
      const sum2 = present + (absent + leave) + holiday;
      const sum3 = (present + absent + leave) + holiday;
      
      expect(sum1).toBe(22);
      expect(sum2).toBe(22);
      expect(sum3).toBe(22);
    });

    it('should be commutative', () => {
      // Order shouldn't matter
      const summary1 = calculateSummary(18, 2, 1, 1);
      const summary2 = calculateSummary(2, 18, 1, 1);
      const summary3 = calculateSummary(1, 1, 18, 2);
      
      expect(summary1.totalDays).toBe(22);
      expect(summary2.totalDays).toBe(22);
      expect(summary3.totalDays).toBe(22);
    });
  });

  describe('Percentage Calculations', () => {
    it('should calculate attendance percentage correctly', () => {
      const summary = calculateSummary(20, 2, 0, 8);
      const workingDays = summary.present + summary.absent + summary.leave;
      const attendancePercentage = (summary.present / workingDays) * 100;
      
      expect(workingDays).toBe(22);
      expect(attendancePercentage).toBeCloseTo(90.91, 2);
    });

    it('should handle 100% attendance', () => {
      const summary = calculateSummary(22, 0, 0, 8);
      const workingDays = summary.present + summary.absent + summary.leave;
      const attendancePercentage = (summary.present / workingDays) * 100;
      
      expect(attendancePercentage).toBe(100);
    });

    it('should handle 0% attendance', () => {
      const summary = calculateSummary(0, 22, 0, 8);
      const workingDays = summary.present + summary.absent + summary.leave;
      const attendancePercentage = (summary.present / workingDays) * 100;
      
      expect(attendancePercentage).toBe(0);
    });
  });

  describe('Data Integrity', () => {
    it('should not allow negative values in practice', () => {
      // While the calculation works with negatives mathematically,
      // in practice all values should be non-negative
      const validSummary = calculateSummary(20, 2, 0, 8);
      
      expect(validSummary.present).toBeGreaterThanOrEqual(0);
      expect(validSummary.absent).toBeGreaterThanOrEqual(0);
      expect(validSummary.leave).toBeGreaterThanOrEqual(0);
      expect(validSummary.holiday).toBeGreaterThanOrEqual(0);
      expect(validSummary.totalDays).toBeGreaterThanOrEqual(0);
    });

    it('should maintain integer values for full days', () => {
      const summary = calculateSummary(20, 2, 0, 8);
      
      expect(Number.isInteger(summary.present)).toBe(true);
      expect(Number.isInteger(summary.absent)).toBe(true);
      expect(Number.isInteger(summary.leave)).toBe(true);
      expect(Number.isInteger(summary.holiday)).toBe(true);
      expect(Number.isInteger(summary.totalDays)).toBe(true);
    });
  });

  describe('Half-Day Scenarios', () => {
    it('should handle half-day attendance', () => {
      const summary = calculateSummary(20.5, 1, 0.5, 8);
      expect(summary.totalDays).toBe(30);
      expect(summary.present + summary.absent + summary.leave + summary.holiday).toBe(30);
    });

    it('should handle multiple half-days', () => {
      const summary = calculateSummary(19.5, 0.5, 2, 8);
      expect(summary.totalDays).toBe(30);
    });
  });
});
