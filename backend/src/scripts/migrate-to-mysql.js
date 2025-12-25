import { sequelize } from '../models/sequelize/index.js';
import logger from '../utils/logger.js';

const runMigration = async () => {
  try {
    logger.info('🔄 Starting MySQL migration...');

    // Test connection
    await sequelize.authenticate();
    logger.info('✅ Database connection established');

    // Sync all models (creates tables)
    await sequelize.sync({ force: false, alter: true });
    logger.info('✅ Database tables synchronized');

    // Create default admin user if it doesn't exist
    const { User, Employee, Department } = await import('../models/sequelize/index.js');

    // Create default department
    const [defaultDept] = await Department.findOrCreate({
      where: { name: 'Administration' },
      defaults: {
        name: 'Administration',
        description: 'Default administration department',
        isActive: true,
      },
    });

    // Create default admin user
    const [adminUser] = await User.findOrCreate({
      where: { email: 'admin@hrms.com' },
      defaults: {
        email: 'admin@hrms.com',
        password: 'admin123', // Will be hashed by the hook
        role: 'SuperAdmin',
        isActive: true,
      },
    });

    // Create admin employee record
    if (adminUser && !adminUser.employeeId) {
      const adminEmployee = await Employee.create({
        firstName: 'System',
        lastName: 'Administrator',
        email: 'admin@hrms.com',
        jobTitle: 'System Administrator',
        departmentId: defaultDept.id,
        hireDate: new Date(),
        employmentType: 'Full-time',
        userId: adminUser.id,
        status: 'Active',
      });

      // Update user with employee reference
      await adminUser.update({ employeeId: adminEmployee.id });

      // Employee profile data is now part of Employee model
      // No separate EmployeeProfile needed
      personalInfo: { },
      bankDetails: { },
      documents: [],
        changeHistory: [],
      });

    logger.info('✅ Default admin user created');
    logger.info(`📧 Email: admin@hrms.com`);
    logger.info(`🔑 Password: admin123`);
  }

    logger.info('🎉 Migration completed successfully!');

} catch (error) {
  logger.error('❌ Migration failed:', error);
  throw error;
} finally {
  await sequelize.close();
}
};

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default runMigration;