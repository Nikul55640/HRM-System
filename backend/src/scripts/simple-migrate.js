import { sequelize, User, Employee, Department } from '../models/sequelize/index.js';
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

    // Create default department
    const [defaultDept] = await Department.findOrCreate({
      where: { name: 'Administration' },
      defaults: {
        name: 'Administration',
        description: 'Default administration department',
        isActive: true,
      },
    });
    logger.info('✅ Default department created');

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
    logger.info('✅ Default admin user created');

    // Create admin employee record if user was created
    if (adminUser && !adminUser.employeeId) {
      const adminEmployee = await Employee.create({
        employeeId: 'EMP001',
        personalInfo: {
          firstName: 'System',
          lastName: 'Administrator',
          email: 'admin@hrms.com',
        },
        contactInfo: {
          email: 'admin@hrms.com',
        },
        jobInfo: {
          jobTitle: 'System Administrator',
          departmentId: defaultDept.id,
          hireDate: new Date(),
          employmentType: 'Full-time',
        },
        status: 'Active',
        createdBy: adminUser.id,
      });

      // Update user with employee reference
      await adminUser.update({ employeeId: adminEmployee.id });

      // Employee profile data is now part of Employee model
      // No separate EmployeeProfile needed
      bankDetails: { },
      documentsList: [],
        changeHistory: [],
          createdBy: adminUser.id,
      });

    logger.info('✅ Admin employee and profile created');
  }

    logger.info('🎉 Migration completed successfully!');
  logger.info(`📧 Admin Email: admin@hrms.com`);
  logger.info(`🔑 Admin Password: admin123`);

} catch (error) {
  logger.error('❌ Migration failed:', error);
  throw error;
} finally {
  await sequelize.close();
}
};

runMigration()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));