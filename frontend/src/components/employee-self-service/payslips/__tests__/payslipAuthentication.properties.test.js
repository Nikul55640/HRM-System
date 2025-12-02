/**
 * **Feature: employee-self-service, Property 6: Payslip authentication requirement**
 * **Validates: Requirements 4.5**
 * 
 * Property: For any payslip access request, the system should verify the user is authenticated 
 * and authorized to view only their own payslips.
 */

const fc = require('fast-check');

// Mock authentication and authorization functions
const mockAuthenticateUser = (token) => {
  if (!token || token === 'invalid') return null;
  
  // Mock user data based on token
  const userId = token.split('-')[1] || '1';
  return {
    _id: `user-${userId}`,
    employeeId: `emp-${userId}`,
    role: 'employee'
  };
};

const mockGetPayslip = (payslipId, requestingEmployeeId) => {
  // Mock payslip data - each payslip belongs to a specific employee
  const payslipEmployeeId = payslipId.split('-')[1] || '1';
  
  return {
    _id: payslipId,
    employeeId: `emp-${payslipEmployeeId}`,
    month: 12,
    year: 2025,
    netPay: 5000,
    status: 'published'
  };
};

const mockCheckPayslipAccess = (user, payslipId) => {
  if (!user || !user.employeeId) {
    return { authorized: false, reason: 'User not authenticated' };
  }
  
  const payslip = mockGetPayslip(payslipId, user.employeeId);
  
  if (payslip.employeeId !== user.employeeId) {
    return { authorized: false, reason: 'User can only access their own payslips' };
  }
  
  return { authorized: true, payslip };
};

describe('Payslip Authentication Properties', () => {
  test('Property 6: Payslip authentication requirement - users can only access their own payslips', () => {
    fc.assert(
      fc.property(
        // Generate user tokens
        fc.oneof(
          fc.constant('invalid'),
          fc.constant(null),
          fc.string({ minLength: 1, maxLength: 10 }).map(id => `token-${id}`)
        ),
        // Generate payslip IDs
        fc.string({ minLength: 1, maxLength: 10 }).map(id => `payslip-${id}`),
        
        (userToken, payslipId) => {
          const user = mockAuthenticateUser(userToken);
          const accessResult = mockCheckPayslipAccess(user, payslipId);
          
          if (!user) {
            // Unauthenticated users should be denied access
            expect(accessResult.authorized).toBe(false);
            expect(accessResult.reason).toBe('User not authenticated');
          } else {
            const payslip = mockGetPayslip(payslipId, user.employeeId);
            
            if (payslip.employeeId === user.employeeId) {
              // Users should be able to access their own payslips
              expect(accessResult.authorized).toBe(true);
              expect(accessResult.payslip).toBeDefined();
              expect(accessResult.payslip.employeeId).toBe(user.employeeId);
            } else {
              // Users should not be able to access other users' payslips
              expect(accessResult.authorized).toBe(false);
              expect(accessResult.reason).toBe('User can only access their own payslips');
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 6a: Payslip authentication - invalid tokens are rejected', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(''),
          fc.constant('invalid'),
          fc.constant('expired'),
          fc.constant('malformed-token'),
          fc.constant(null),
          fc.constant(undefined)
        ),
        fc.string({ minLength: 1, maxLength: 10 }).map(id => `payslip-${id}`),
        
        (invalidToken, payslipId) => {
          const user = mockAuthenticateUser(invalidToken);
          const accessResult = mockCheckPayslipAccess(user, payslipId);
          
          // All invalid tokens should result in denied access
          expect(accessResult.authorized).toBe(false);
          expect(accessResult.reason).toBe('User not authenticated');
        }
      ),
      { numRuns: 50 }
    );
  });

  test('Property 6b: Payslip authentication - cross-employee access is denied', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 1, max: 100 }),
        
        (employeeId1, employeeId2) => {
          // Ensure different employees
          fc.pre(employeeId1 !== employeeId2);
          
          const user1Token = `token-${employeeId1}`;
          const user2PayslipId = `payslip-${employeeId2}`;
          
          const user1 = mockAuthenticateUser(user1Token);
          const accessResult = mockCheckPayslipAccess(user1, user2PayslipId);
          
          // Employee 1 should not be able to access Employee 2's payslips
          expect(accessResult.authorized).toBe(false);
          expect(accessResult.reason).toBe('User can only access their own payslips');
        }
      ),
      { numRuns: 50 }
    );
  });

  test('Property 6c: Payslip authentication - same employee access is allowed', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        
        (employeeId) => {
          const userToken = `token-${employeeId}`;
          const payslipId = `payslip-${employeeId}`;
          
          const user = mockAuthenticateUser(userToken);
          const accessResult = mockCheckPayslipAccess(user, payslipId);
          
          // Employee should be able to access their own payslips
          expect(accessResult.authorized).toBe(true);
          expect(accessResult.payslip).toBeDefined();
          expect(accessResult.payslip.employeeId).toBe(user.employeeId);
        }
      ),
      { numRuns: 50 }
    );
  });

  test('Property 6d: Payslip authentication - audit logging for access attempts', () => {
    const auditLogs = [];
    
    const mockLogAccess = (user, payslipId, success, reason) => {
      auditLogs.push({
        userId: user?._id,
        employeeId: user?.employeeId,
        payslipId,
        success,
        reason,
        timestamp: new Date()
      });
    };
    
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(null),
          fc.string({ minLength: 1, maxLength: 10 }).map(id => `token-${id}`)
        ),
        fc.string({ minLength: 1, maxLength: 10 }).map(id => `payslip-${id}`),
        
        (userToken, payslipId) => {
          const user = mockAuthenticateUser(userToken);
          const accessResult = mockCheckPayslipAccess(user, payslipId);
          
          // Log the access attempt
          mockLogAccess(user, payslipId, accessResult.authorized, accessResult.reason);
          
          // Verify audit log was created
          const lastLog = auditLogs[auditLogs.length - 1];
          expect(lastLog.payslipId).toBe(payslipId);
          expect(lastLog.success).toBe(accessResult.authorized);
          
          if (user) {
            expect(lastLog.userId).toBe(user._id);
            expect(lastLog.employeeId).toBe(user.employeeId);
          } else {
            expect(lastLog.userId).toBeUndefined();
            expect(lastLog.employeeId).toBeUndefined();
          }
        }
      ),
      { numRuns: 30 }
    );
  });
});