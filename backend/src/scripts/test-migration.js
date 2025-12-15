import { sequelize } from '../models/sequelize/index.js';
import User from '../models/sequelize/User.js';
import Employee from '../models/sequelize/Employee.js';
import Department from '../models/sequelize/Department.js';

const runMigration = async () => {
  try {
    console.log('🔄 Starting MySQL migration...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Drop all tables if they exist (for clean migration)
    await sequelize.drop({ cascade: true });
    console.log('🗑️ Dropped existing tables');
    
    // Create tables in the correct order
    console.log('📋 Creating tables...');
    
    // 1. Create User table first (no dependencies)
    await User.sync({ force: true });
    console.log('✅ Users table created');
    
    // 2. Create Department table (no dependencies)
    await Department.sync({ force: true });
    console.log('✅ Departments table created');
    
    // 3. Create Employee table (depends on User and Department)
    await Employee.sync({ force: true });
    console.log('✅ Employees table created');
    
    console.log('🎉 Basic migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Stack trace:', error.stack);
    throw error;
  } finally {
    await sequelize.close();
  }
};

runMigration()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));