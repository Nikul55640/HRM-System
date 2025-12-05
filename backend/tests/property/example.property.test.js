/**
 * Example Property-Based Test
 * Demonstrates how to write property tests using fast-check
 */

import fc from 'fast-check';
import {
  objectIdGen,
  timestampGen,
  workLocationGen,
  validSessionGen,
  propertyTestConfig,
  runPropertyTest,
} from '../utils/generators.js';

describe('Property-Based Testing Examples', () => {
  describe('Generator Examples', () => {
    test('objectIdGen generates valid 24-character hex strings', () => {
      runPropertyTest(
        fc.property(objectIdGen, (id) => {
          expect(id).toHaveLength(24);
          expect(id).toMatch(/^[0-9a-f]{24}$/);
        })
      );
    });

    test('timestampGen generates dates within range', () => {
      runPropertyTest(
        fc.property(timestampGen(), (date) => {
          expect(date).toBeInstanceOf(Date);
          expect(date.getTime()).toBeGreaterThanOrEqual(
            new Date('2024-01-01').getTime()
          );
          expect(date.getTime()).toBeLessThanOrEqual(
            new Date('2025-12-31').getTime()
          );
        })
      );
    });

    test('workLocationGen generates valid location values', () => {
      runPropertyTest(
        fc.property(workLocationGen, (location) => {
          expect(['office', 'wfh', 'client_site']).toContain(location);
        })
      );
    });

    test('validSessionGen generates sessions with checkOut after checkIn', () => {
      runPropertyTest(
        fc.property(validSessionGen, (session) => {
          expect(session.checkOut.getTime()).toBeGreaterThan(
            session.checkIn.getTime()
          );
          expect(session.workedMinutes).toBeGreaterThan(0);
          expect(['office', 'wfh', 'client_site']).toContain(session.workLocation);
        })
      );
    });
  });

  describe('Property Test Patterns', () => {
    test('Example: Addition is commutative', () => {
      runPropertyTest(
        fc.property(fc.integer(), fc.integer(), (a, b) => {
          expect(a + b).toBe(b + a);
        })
      );
    });

    test('Example: String concatenation length', () => {
      runPropertyTest(
        fc.property(fc.string(), fc.string(), (str1, str2) => {
          const result = str1 + str2;
          expect(result.length).toBe(str1.length + str2.length);
        })
      );
    });

    test('Example: Array reverse is involutive', () => {
      runPropertyTest(
        fc.property(fc.array(fc.integer()), (arr) => {
          const reversed = arr.slice().reverse();
          const doubleReversed = reversed.slice().reverse();
          expect(doubleReversed).toEqual(arr);
        })
      );
    });
  });

  describe('Configuration Test', () => {
    test('property tests run with configured iterations', () => {
      let runCount = 0;

      fc.assert(
        fc.property(fc.integer(), () => {
          runCount++;
          return true;
        }),
        propertyTestConfig
      );

      expect(runCount).toBeGreaterThanOrEqual(100);
    });
  });
});
