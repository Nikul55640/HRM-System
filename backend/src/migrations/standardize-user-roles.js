/**
 * Migration: Standardize User Roles
 * 
 * This migration standardizes role values in the database to match
 * the new role system constants defined in config/roles.js
 * 
 * Backend speaks CONSTANTS. Frontend speaks HUMANS.
 */

import { QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface) => {
  console.log('🔄 [MIGRATION] Starting role standardization...');
  
  try {
    // First, let's see what roles currently exist
    const [existingRoles] = await queryInterface.sequelize.query(
      'SELECT DISTINCT role, COUNT(*) as count FROM Users GROUP BY role ORDER BY role;'
    );
    
    console.log('📊 [MIGRATION] Current role distribution:');
    existingRoles.forEach(row => {
      console.log(`   - ${row.role}: ${row.count} users`);
    });

    // Role mapping: Current DB values → Standardized values
    const roleMappings = [
      // Current variations → Standard database format
      { from: 'SuperAdmin', to: 'SuperAdmin' }, // Already correct
      { from: 'HR Administrator', to: 'HR' }, // Standardize to HR
      { from: 'HR Admin', to: 'HR' }, // Standardize to HR
      { from: 'HR', to: 'HR' }, // Already correct
      { from: 'HR Manager', to: 'HR_Manager' }, // Standardize format
      { from: 'HR_Manager', to: 'HR_Manager' }, // Already correct
      { from: 'Manager', to: 'HR_Manager' }, // Legacy mapping
      { from: 'Employee', to: 'Employee' }, // Already correct
    ];

    // Apply role mappings
    for (const mapping of roleMappings) {
      if (mapping.from !== mapping.to) {
        console.log(`🔄 [MIGRATION] Updating ${mapping.from} → ${mapping.to}`);
        
        const [results] = await queryInterface.sequelize.query(
          'UPDATE Users SET role = :newRole WHERE role = :oldRole',
          {
            replacements: { 
              newRole: mapping.to, 
              oldRole: mapping.from 
            }
          }
        );
        
        if (results.affectedRows > 0) {
          console.log(`   ✅ Updated ${results.affectedRows} users`);
        }
      }
    }

    // Verify final role distribution
    const [finalRoles] = await queryInterface.sequelize.query(
      'SELECT DISTINCT role, COUNT(*) as count FROM Users GROUP BY role ORDER BY role;'
    );
    
    console.log('📊 [MIGRATION] Final role distribution:');
    finalRoles.forEach(row => {
      console.log(`   - ${row.role}: ${row.count} users`);
    });

    // Add role validation constraint (optional - for data integrity)
    try {
      await queryInterface.addConstraint('Users', {
        fields: ['role'],
        type: 'check',
        name: 'valid_user_roles',
        where: {
          role: {
            [queryInterface.sequelize.Sequelize.Op.in]: [
              'SuperAdmin',
              'HR',
              'HR_Manager', 
              'Employee'
            ]
          }
        }
      });
      console.log('✅ [MIGRATION] Added role validation constraint');
    } catch (error) {
      console.warn('⚠️ [MIGRATION] Could not add role constraint (may already exist):', error.message);
    }

    console.log('✅ [MIGRATION] Role standardization completed successfully!');
    
  } catch (error) {
    console.error('❌ [MIGRATION] Role standardization failed:', error);
    throw error;
  }
};

export const down = async (queryInterface) => {
  console.log('🔄 [MIGRATION] Reverting role standardization...');
  
  try {
    // Remove role validation constraint
    try {
      await queryInterface.removeConstraint('Users', 'valid_user_roles');
      console.log('✅ [MIGRATION] Removed role validation constraint');
    } catch (error) {
      console.warn('⚠️ [MIGRATION] Could not remove role constraint:', error.message);
    }

    // Revert role mappings (reverse the standardization)
    const revertMappings = [
      { from: 'HR', to: 'HR Administrator' }, // Revert to old format
      { from: 'HR_Manager', to: 'HR Manager' }, // Revert to old format
      // SuperAdmin and Employee remain the same
    ];

    for (const mapping of revertMappings) {
      console.log(`🔄 [MIGRATION] Reverting ${mapping.from} → ${mapping.to}`);
      
      const [results] = await queryInterface.sequelize.query(
        'UPDATE Users SET role = :newRole WHERE role = :oldRole',
        {
          replacements: { 
            newRole: mapping.to, 
            oldRole: mapping.from 
          }
        }
      );
      
      if (results.affectedRows > 0) {
        console.log(`   ✅ Reverted ${results.affectedRows} users`);
      }
    }

    console.log('✅ [MIGRATION] Role standardization reverted successfully!');
    
  } catch (error) {
    console.error('❌ [MIGRATION] Role reversion failed:', error);
    throw error;
  }
};

export default { up, down };