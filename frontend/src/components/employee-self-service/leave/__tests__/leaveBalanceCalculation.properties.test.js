/**
 * Property-Based Tests for Leave Balance Calculation
 * Feature: employee-self-service, Property 7: Leave balance calculation accuracy
 * Validates: Requirements 5.1
 */

import { describe, it, expect } from '@jest/globals';
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

describe('Leave Balance Calculation Properties', () => {
  /**
   * Property 7: Leave balance calculation accuracy
   * For any leave balance display, the available leave should equal
   * allocated leave minus (used leave plus pending leave).
   */
  
  describe('Basic Calculation', () => {
    it('should calculate available = allocated - (used + pending)', () => {
      expect(calculateLeaveBalance(20, 5, 2)).toBe(13); // 20 - (5 + 2) = 13
      expect(calculateLeaveBalance(10, 3, 1)).toBe(6);  // 10 - (3 + 1) = 6
      expect(calculateLeaveBalance(15, 0, 0)).toBe(15); // 15 - (0 + 0) = 15
    });

    it('should handle zero used and pending leaves', () => {
      expect(calculateLeaveBalance(20, 0, 0)).toBe(20);
      expect(calculateLeaveBalance(10, 0, 0)).toBe(10);
      expect(calculateLeaveBalance(5, 0, 0)).toBe(5);
    });

    it('should handle zero pending leaves', () => {
      expect(calculateLeaveBalance(20, 5, 0)).toBe(15);
      expect(calculateLeaveBalance(10, 3, 0)).toBe(7);
      expect(calculateLeaveBalance(15, 10, 0)).toBe(5);
    });

    it('should handle zero used leaves', () => {
      expect(calculateLeaveBalance(20, 0, 5)).toBe(15);
      expect(calculateLeaveBalance(10, 0, 3)).toBe(7);
      expect(calculateLeaveBalance(15, 0, 10)).toBe(5);
    });
  });

  describe('Edge Cases', () => {
    it('should handle when all leaves are used', () => {
      expect(calculateLeaveBalance(20, 20, 0)).toBe(0);
      expect(calculateLeaveBalance(10, 10, 0)).toBe(0);
      expect(calculateLeaveBalance(5, 5, 0)).toBe(0);
    });

    it('should handle when all leaves are pending', () => {
      expect(calculateLeaveBalance(20, 0, 20)).toBe(0);
      expect(calculateLeaveBalance(10, 0, 10)).toBe(0);
      expect(calculateLeaveBalance(5, 0, 5)).toBe(0);
    });

    it('should handle when used + pending equals allocated', () => {
      expect(calculateLeaveBalance(20, 10, 10)).toBe(0);
      expect(calculateLeaveBalance(15, 8, 7)).toBe(0);
      expect(calculateLeaveBalance(10, 6, 4)).toBe(0);
    });

    it('should handle negative result when overused', () => {
      expect(calculateLeaveBalance(20, 25, 0)).toBe(-5);
      expect(calculateLeaveBalance(10, 0, 15)).toBe(-5);
      expect(calculateLeaveBalance(15, 10, 10)).toBe(-5);
    });
  });

  describe('Various Leave Scenarios', () => {
    it('should calculate for typical annual leave', () => {
      expect(calculateLeaveBalance(20, 5, 2)).toBe(13);
      expect(calculateLeaveBalance(25, 10, 3)).toBe(12);
      expect(calculateLeaveBalance(30, 15, 5)).toBe(10);
    });

    it('should calculate for sick leave', () => {
      expect(calculateLeaveBalance(10, 2, 1)).toBe(7);
      expect(calculateLeaveBalance(12, 4, 0)).toBe(8);
      expect(calculateLeaveBalance(8, 3, 2)).toBe(3);
    });

    it('should calculate for personal leave', () => {
      expect(calculateLeaveBalance(5, 1, 0)).toBe(4);
      expect(calculateLeaveBalance(7, 2, 1)).toBe(4);
      expect(calculateLeaveBalance(3, 1, 1)).toBe(1);
    });
  });

  describe('Calculation Consistency', () => {
    it('should produce same result for same inputs', () => {
      const allocated = 20;
      const used = 5;
      const pending = 2;
      
      const result1 = calculateLeaveBalance(allocated, used, pending);
      const result2 = calculateLeaveBalance(allocated, used, pending);
      const result3 = calculateLeaveBalance(allocated, used, pending);
      
      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
      expect(result1).toBe(13);
    });

    it('should be commutative for used and pending', () => {
      // Order of used and pending shouldn't matter for the sum
      expect(calculateLeaveBalance(20, 5, 3)).toBe(calculateLeaveBalance(20, 3, 5));
      expect(calculateLeaveBalance(15, 7, 2)).toBe(calculateLeaveBalance(15, 2, 7));
      expect(calculateLeaveBalance(10, 4, 1)).toBe(calculateLeaveBalance(10, 1, 4));
    });
  });

  describe('Mathematical Properties', () => {
    it('should satisfy: available + used + pending = allocated', () => {
      const testCases = [
        { allocated: 20, used: 5, pending: 2 },
        { allocated: 15, used: 7, pending: 3 },
        { allocated: 10, used: 4, pending: 1 },
        { allocated: 25, used: 10, pending: 5 },
      ];

      testCases.forEach(({ allocated, used, pending }) => {
        const available = calculateLeaveBalance(allocated, used, pending);
        expect(available + used + pending).toBe(allocated);
      });
    });

    it('should decrease available when used increases', () => {
      const allocated = 20;
      const pending = 2;
      
      const available1 = calculateLeaveBalance(allocated, 5, pending);
      const available2 = calculateLeaveBalance(allocated, 10, pending);
      
      expect(available2).toBeLessThan(available1);
      expect(available1 - available2).toBe(5);
    });

    it('should decrease available when pending increases', () => {
      const allocated = 20;
      const used = 5;
      
      const available1 = calculateLeaveBalance(allocated, used, 2);
      const available2 = calculateLeaveBalance(allocated, used, 7);
      
      expect(available2).toBeLessThan(available1);
      expect(available1 - available2).toBe(5);
    });
  });

  describe('Fractional Leaves', () => {
    it('should handle half-day leaves', () => {
      expect(calculateLeaveBalance(20, 5.5, 2)).toBe(12.5);
      expect(calculateLeaveBalance(10, 3.5, 1.5)).toBe(5);
      expect(calculateLeaveBalance(15, 7.5, 2.5)).toBe(5);
    });

    it('should handle quarter-day leaves', () => {
      expect(calculateLeaveBalance(20, 5.25, 2.25)).toBe(12.5);
      expect(calculateLeaveBalance(10, 3.75, 1.25)).toBe(5);
    });
  });

  describe('Large Numbers', () => {
    it('should handle large leave allocations', () => {
      expect(calculateLeaveBalance(100, 30, 10)).toBe(60);
      expect(calculateLeaveBalance(365, 100, 50)).toBe(215);
      expect(calculateLeaveBalance(1000, 250, 100)).toBe(650);
    });
  });

  describe('Zero and Negative Inputs', () => {
    it('should handle zero allocated leaves', () => {
      expect(calculateLeaveBalance(0, 0, 0)).toBe(0);
      expect(calculateLeaveBalance(0, 5, 2)).toBe(-7);
    });

    it('should handle negative values gracefully', () => {
      // While negative values shouldn't occur in practice,
      // the calculation should still work mathematically
      expect(calculateLeaveBalance(20, -5, 2)).toBe(23);
      expect(calculateLeaveBalance(20, 5, -2)).toBe(17);
    });
  });

  describe('Real-World Scenarios', () => {
    it('should calculate for employee with partial year', () => {
      // Employee joined mid-year, gets prorated leaves
      expect(calculateLeaveBalance(10, 2, 1)).toBe(7);
      expect(calculateLeaveBalance(6, 1, 0)).toBe(5);
    });

    it('should calculate for employee with carry-forward', () => {
      // Employee has carry-forward from previous year
      expect(calculateLeaveBalance(25, 5, 2)).toBe(18); // 20 + 5 carry-forward
      expect(calculateLeaveBalance(30, 10, 3)).toBe(17); // 20 + 10 carry-forward
    });

    it('should calculate after leave approval', () => {
      // Before approval: allocated=20, used=5, pending=3, available=12
      const beforeApproval = calculateLeaveBalance(20, 5, 3);
      expect(beforeApproval).toBe(12);
      
      // After approval: pending becomes used
      const afterApproval = calculateLeaveBalance(20, 8, 0);
      expect(afterApproval).toBe(12);
      
      // Available remains same
      expect(beforeApproval).toBe(afterApproval);
    });

    it('should calculate after leave cancellation', () => {
      // Before cancellation: allocated=20, used=5, pending=3
      const beforeCancel = calculateLeaveBalance(20, 5, 3);
      expect(beforeCancel).toBe(12);
      
      // After cancellation: pending reduced
      const afterCancel = calculateLeaveBalance(20, 5, 0);
      expect(afterCancel).toBe(15);
      
      // Available increases by cancelled amount
      expect(afterCancel - beforeCancel).toBe(3);
    });
  });

  describe('Multiple Leave Types', () => {
    it('should calculate independently for each leave type', () => {
      const annual = calculateLeaveBalance(20, 5, 2);
      const sick = calculateLeaveBalance(10, 3, 1);
      const personal = calculateLeaveBalance(5, 1, 0);
      
      expect(annual).toBe(13);
      expect(sick).toBe(6);
      expect(personal).toBe(4);
      
      // Total available
      const totalAvailable = annual + sick + personal;
      expect(totalAvailable).toBe(23);
    });
  });
});
