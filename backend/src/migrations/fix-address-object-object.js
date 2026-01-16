/**
 * Migration: Fix [object Object] in address field
 * 
 * This migration fixes employees who have "[object Object]" string
 * stored in their address field instead of proper JSON.
 * 
 * Sets address to null for affected records so they can re-enter it properly.
 */

import sequelize from '../config/sequelize.js';
import { QueryTypes } from 'sequelize';

export const up = async () => {
  const transaction = await sequelize.transaction();
  
  try {
    console.log('🔧 Starting address cleanup migration...');
    
    // Find all employees with broken address data
    const brokenAddresses = await sequelize.query(
      `SELECT id, employeeId, address FROM employees WHERE address = '[object Object]'`,
      { type: QueryTypes.SELECT, transaction }
    );
    
    console.log(`📊 Found ${brokenAddresses.length} employees with broken address data`);
    
    if (brokenAddresses.length > 0) {
      // Set address to null for these employees
      await sequelize.query(
        `UPDATE employees SET address = NULL WHERE address = '[object Object]'`,
        { type: QueryTypes.UPDATE, transaction }
      );
      
      console.log(`✅ Cleaned up ${brokenAddresses.length} broken address records`);
      console.log('📝 Affected employees:', brokenAddresses.map(e => e.employeeId).join(', '));
    }
    
    await transaction.commit();
    console.log('✅ Address cleanup migration completed successfully');
    
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Address cleanup migration failed:', error);
    throw error;
  }
};

export const down = async () => {
  // No rollback needed - we're just cleaning bad data
  console.log('⚠️ No rollback for address cleanup migration');
};
