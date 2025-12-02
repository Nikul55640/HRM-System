/**
 * Property-Based Tests for Bank Information Masking
 * Feature: employee-self-service, Property 3: Bank information masking
 * Validates: Requirements 2.5
 */

import { describe, it, expect } from '@jest/globals';
import { maskAccountNumber } 
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

describe('Bank Information Masking Properties', () => {
  /**
   * Property 3: Bank information masking
   * For any bank account display, the system should mask all but the last 4 digits
   * of the account number when rendering to the UI.
   */
  
  describe('Standard Account Number Masking', () => {
    it('should mask all but last 4 digits for 10-digit account', () => {
      const accountNumber = '1234567890';
      const masked = maskAccountNumber(accountNumber);
      
      expect(masked).toBe('****7890');
      expect(masked.length).toBeLessThan(accountNumber.length);
    });

    it('should mask all but last 4 digits for 12-digit account', () => {
      const accountNumber = '123456789012';
      const masked = maskAccountNumber(accountNumber);
      
      expect(masked).toBe('****9012');
    });

    it('should mask all but last 4 digits for 16-digit account', () => {
      const accountNumber = '1234567890123456';
      const masked = maskAccountNumber(accountNumber);
      
      expect(masked).toBe('****3456');
    });

    it('should mask all but last 4 digits for 8-digit account', () => {
      const accountNumber = '12345678';
      const masked = maskAccountNumber(accountNumber);
      
      expect(masked).toBe('****5678');
    });
  });

  describe('Edge Cases', () => {
    it('should handle 4-digit account number', () => {
      const accountNumber = '1234';
      const masked = maskAccountNumber(accountNumber);
      
      expect(masked).toBe('****1234');
    });

    it('should handle 3-digit account number', () => {
      const accountNumber = '123';
      const masked = maskAccountNumber(accountNumber);
      
      expect(masked).toBe('****');
    });

    it('should handle 2-digit account number', () => {
      const accountNumber = '12';
      const masked = maskAccountNumber(accountNumber);
      
      expect(masked).toBe('****');
    });

    it('should handle 1-digit account number', () => {
      const accountNumber = '1';
      const masked = maskAccountNumber(accountNumber);
      
      expect(masked).toBe('****');
    });

    it('should handle empty string', () => {
      const accountNumber = '';
      const masked = maskAccountNumber(accountNumber);
      
      expect(masked).toBe('****');
    });

    it('should handle null value', () => {
      const accountNumber = null;
      const masked = maskAccountNumber(accountNumber);
      
      expect(masked).toBe('****');
    });

    it('should handle undefined value', () => {
      const accountNumber = undefined;
      const masked = maskAccountNumber(accountNumber);
      
      expect(masked).toBe('****');
    });
  });

  describe('Various Account Number Formats', () => {
    it('should mask numeric string account numbers', () => {
      const testCases = [
        { input: '9876543210', expected: '****3210' },
        { input: '1111222233334444', expected: '****4444' },
        { input: '0000111122223333', expected: '****3333' },
        { input: '9999888877776666', expected: '****6666' },
      ];

      testCases.forEach(({ input, expected }) => {
        expect(maskAccountNumber(input)).toBe(expected);
      });
    });

    it('should mask account numbers with leading zeros', () => {
      const accountNumber = '0001234567';
      const masked = maskAccountNumber(accountNumber);
      
      expect(masked).toBe('****4567');
    });

    it('should mask account numbers with all same digits', () => {
      const accountNumber = '1111111111';
      const masked = maskAccountNumber(accountNumber);
      
      expect(masked).toBe('****1111');
    });
  });

  describe('Masking Consistency', () => {
    it('should always show exactly 4 asterisks for masking', () => {
      const testCases = [
        '12345678',
        '123456789012',
        '1234567890123456',
        '12345',
      ];

      testCases.forEach(accountNumber => {
        const masked = maskAccountNumber(accountNumber);
        expect(masked.startsWith('****')).toBe(true);
      });
    });

    it('should always show last 4 digits when account has 4+ digits', () => {
      const accountNumber = '1234567890';
      const masked = maskAccountNumber(accountNumber);
      
      expect(masked.endsWith('7890')).toBe(true);
      expect(masked.slice(-4)).toBe(accountNumber.slice(-4));
    });

    it('should produce same result for same input', () => {
      const accountNumber = '1234567890';
      const masked1 = maskAccountNumber(accountNumber);
      const masked2 = maskAccountNumber(accountNumber);
      
      expect(masked1).toBe(masked2);
    });
  });

  describe('Security Properties', () => {
    it('should not reveal full account number', () => {
      const accountNumber = '1234567890';
      const masked = maskAccountNumber(accountNumber);
      
      expect(masked).not.toBe(accountNumber);
      expect(masked).not.toContain('12345');
    });

    it('should hide first digits of account number', () => {
      const accountNumber = '9876543210';
      const masked = maskAccountNumber(accountNumber);
      
      expect(masked).not.toContain('9876');
      expect(masked).not.toContain('987654');
    });

    it('should hide middle digits of account number', () => {
      const accountNumber = '1234567890';
      const masked = maskAccountNumber(accountNumber);
      
      expect(masked).not.toContain('3456');
      expect(masked).not.toContain('456789');
    });

    it('should only reveal last 4 digits', () => {
      const accountNumber = '1234567890123456';
      const masked = maskAccountNumber(accountNumber);
      const lastFour = accountNumber.slice(-4);
      
      // Check that only last 4 digits are visible
      expect(masked).toContain(lastFour);
      
      // Check that no other consecutive 4 digits are visible
      for (let i = 0; i < accountNumber.length - 4; i++) {
        const fourDigits = accountNumber.slice(i, i + 4);
        if (fourDigits !== lastFour) {
          expect(masked).not.toContain(fourDigits);
        }
      }
    });
  });

  describe('Length Properties', () => {
    it('should produce shorter output than input for long accounts', () => {
      const longAccounts = [
        '12345678901234',
        '123456789012345678',
        '12345678901234567890',
      ];

      longAccounts.forEach(accountNumber => {
        const masked = maskAccountNumber(accountNumber);
        expect(masked.length).toBeLessThan(accountNumber.length);
      });
    });

    it('should produce consistent length output', () => {
      const testCases = [
        '12345678',
        '123456789012',
        '1234567890123456',
      ];

      testCases.forEach(accountNumber => {
        const masked = maskAccountNumber(accountNumber);
        expect(masked.length).toBe(8); // **** + 4 digits
      });
    });
  });

  describe('Real-World Account Numbers', () => {
    it('should mask typical US bank account numbers', () => {
      const usAccounts = [
        '1234567890',      // 10 digits
        '123456789012',    // 12 digits
        '12345678901234',  // 14 digits
      ];

      usAccounts.forEach(accountNumber => {
        const masked = maskAccountNumber(accountNumber);
        expect(masked).toMatch(/^\*{4}\d{4}$/);
      });
    });

    it('should mask typical Indian bank account numbers', () => {
      const indianAccounts = [
        '12345678901',     // 11 digits
        '123456789012',    // 12 digits
        '1234567890123',   // 13 digits
        '12345678901234',  // 14 digits
      ];

      indianAccounts.forEach(accountNumber => {
        const masked = maskAccountNumber(accountNumber);
        expect(masked).toMatch(/^\*{4}\d{4}$/);
        expect(masked.slice(-4)).toBe(accountNumber.slice(-4));
      });
    });

    it('should mask typical European IBAN account numbers (numeric part)', () => {
      const ibanNumbers = [
        '1234567890123456',  // 16 digits
        '12345678901234567890', // 20 digits
      ];

      ibanNumbers.forEach(accountNumber => {
        const masked = maskAccountNumber(accountNumber);
        expect(masked).toMatch(/^\*{4}\d{4}$/);
      });
    });
  });

  describe('Masking Pattern Validation', () => {
    it('should follow the pattern ****XXXX where X is a digit', () => {
      const accountNumbers = [
        '1234567890',
        '9876543210',
        '1111222233334444',
      ];

      accountNumbers.forEach(accountNumber => {
        const masked = maskAccountNumber(accountNumber);
        expect(masked).toMatch(/^\*{4}\d{4}$/);
      });
    });

    it('should not contain any characters other than asterisks and digits', () => {
      const accountNumber = '1234567890';
      const masked = maskAccountNumber(accountNumber);
      
      expect(masked).toMatch(/^[\*\d]+$/);
    });
  });

  describe('Bulk Masking Scenarios', () => {
    it('should mask multiple account numbers consistently', () => {
      const accounts = [
        '1234567890',
        '9876543210',
        '1111222233334444',
        '5555666677778888',
      ];

      const masked = accounts.map(acc => maskAccountNumber(acc));
      
      expect(masked[0]).toBe('****7890');
      expect(masked[1]).toBe('****3210');
      expect(masked[2]).toBe('****4444');
      expect(masked[3]).toBe('****8888');
    });

    it('should handle array of different length accounts', () => {
      const accounts = [
        '12345678',
        '123456789012',
        '1234567890123456',
        '12345',
      ];

      accounts.forEach(accountNumber => {
        const masked = maskAccountNumber(accountNumber);
        expect(masked).toMatch(/^\*{4}/);
        if (accountNumber.length >= 4) {
          expect(masked.slice(-4)).toBe(accountNumber.slice(-4));
        }
      });
    });
  });

  describe('Display Properties', () => {
    it('should produce human-readable masked format', () => {
      const accountNumber = '1234567890';
      const masked = maskAccountNumber(accountNumber);
      
      expect(masked).toBe('****7890');
      expect(masked.length).toBe(8);
      expect(masked).toContain('*');
      expect(masked).toContain('7890');
    });

    it('should be suitable for UI display', () => {
      const accountNumber = '9876543210';
      const masked = maskAccountNumber(accountNumber);
      
      // Should be short enough for display
      expect(masked.length).toBeLessThanOrEqual(20);
      
      // Should clearly indicate masking
      expect(masked.includes('*')).toBe(true);
      
      // Should show some identifying information
      expect(/\d{4}$/.test(masked)).toBe(true);
    });
  });
});
