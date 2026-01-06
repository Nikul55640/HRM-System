import sequelize from './src/config/sequelize.js';
import { connectDB } from './src/config/sequelize.js';

async function migrateUserEmployeeData() {
  try {
    // Connect to database first
    console.log('🔄 Connecting to database...');
    await connectDB();
    
    const transaction = await sequelize.transaction();
    
    try {
      console.log('🔄 Starting data migration for User-Employee relationship...');

      // Get all users and employees
      const [users] = await sequelize.query('SELECT * FROM users', { transaction });
      const [employees] = await sequelize.query('SELECT * FROM employees', { transaction });

      console.log(`📊 Found ${users.length} users and ${employees.length} employees`);

      // Strategy 1: Match by email (most reliable)
      let matchedCount = 0;
      let unmatchedUsers = [];
      let unmatchedEmployees = [];

      for (const user of users) {
        // Find employee with matching email
        const matchingEmployee = employees.find(emp => 
          emp.email && emp.email.toLowerCase() === user.email.toLowerCase()
        );

        if (matchingEmployee) {
          // Update employee with userId
          await sequelize.query(
            'UPDATE employees SET userId = ? WHERE id = ?',
            { 
              replacements: [user.id, matchingEmployee.id],
              transaction 
            }
          );
          matchedCount++;
          console.log(`✅ Matched User ${user.email} with Employee ${matchingEmployee.employeeId}`);
        } else {
          unmatchedUsers.push(user);
        }
      }

      // Find unmatched employees
      for (const employee of employees) {
        const hasUser = users.find(user => 
          user.email.toLowerCase() === employee.email?.toLowerCase()
        );
        if (!hasUser) {
          unmatchedEmployees.push(employee);
        }
      }

      console.log(`\n📈 Migration Summary:`);
      console.log(`✅ Successfully matched: ${matchedCount} User-Employee pairs`);
      console.log(`[WARNING] Unmatched users: ${unmatchedUsers.length}`);
      console.log(`[WARNING] Unmatched employees: ${unmatchedEmployees.length}`);

      if (unmatchedUsers.length > 0) {
        console.log(`\n🔍 Unmatched Users:`);
        unmatchedUsers.forEach(user => {
          console.log(`   - ${user.email} (ID: ${user.id}, Role: ${user.role})`);
        });
      }

      if (unmatchedEmployees.length > 0) {
        console.log(`\n🔍 Unmatched Employees:`);
        unmatchedEmployees.forEach(emp => {
          console.log(`   - ${emp.email} (ID: ${emp.id}, Employee ID: ${emp.employeeId})`);
        });
      }

      // Handle unmatched cases
      if (unmatchedUsers.length > 0 || unmatchedEmployees.length > 0) {
        console.log(`\n💡 Recommendations:`);
        
        if (unmatchedUsers.length > 0) {
          console.log(`   1. Create Employee records for unmatched Users (system accounts)`);
          console.log(`   2. Or mark these as system-only accounts if they don't need Employee profiles`);
        }
        
        if (unmatchedEmployees.length > 0) {
          console.log(`   3. Create User accounts for unmatched Employees`);
          console.log(`   4. Or these might be terminated employees - verify their status`);
        }
      }

      await transaction.commit();
      console.log('\n✅ Data migration completed successfully!');
      
      return {
        matched: matchedCount,
        unmatchedUsers: unmatchedUsers.length,
        unmatchedEmployees: unmatchedEmployees.length,
        details: {
          unmatchedUsers,
          unmatchedEmployees
        }
      };
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Data migration failed:', error);
      throw error;
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  } finally {
    // Close database connection
    await sequelize.close();
    console.log('🛑 Database connection closed');
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    await migrateUserEmployeeData();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

export default migrateUserEmployeeData;