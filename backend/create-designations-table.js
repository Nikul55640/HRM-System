import sequelize from './src/config/sequelize.js';

async function createDesignationsTable() {
  try {
    console.log('🔄 Creating designations table...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Create designations table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS \`designations\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`title\` varchar(100) NOT NULL,
        \`description\` text,
        \`level\` enum('intern','junior','mid','senior','lead','manager','director','vp','c_level') DEFAULT 'mid',
        \`departmentId\` int DEFAULT NULL,
        \`requirements\` json DEFAULT NULL,
        \`responsibilities\` json DEFAULT NULL,
        \`salaryRange\` json DEFAULT NULL,
        \`isActive\` tinyint(1) DEFAULT '1',
        \`employeeCount\` int DEFAULT '0' COMMENT 'Number of employees with this designation',
        \`createdBy\` int DEFAULT NULL,
        \`updatedBy\` int DEFAULT NULL,
        \`createdAt\` datetime NOT NULL,
        \`updatedAt\` datetime NOT NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`unique_title_department\` (\`title\`,\`departmentId\`),
        KEY \`idx_department\` (\`departmentId\`),
        KEY \`idx_level\` (\`level\`),
        KEY \`idx_active\` (\`isActive\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);
    console.log('✅ Designations table created');

    // Add foreign key constraints
    try {
      await sequelize.query(`
        ALTER TABLE \`designations\` 
        ADD CONSTRAINT \`fk_designation_department\` FOREIGN KEY (\`departmentId\`) REFERENCES \`departments\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
      `);
      console.log('✅ Department foreign key added');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('[WARNING] Department foreign key already exists');
      } else {
        console.error('❌ Error adding department foreign key:', error.message);
      }
    }

    try {
      await sequelize.query(`
        ALTER TABLE \`designations\` 
        ADD CONSTRAINT \`fk_designation_created_by\` FOREIGN KEY (\`createdBy\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
      `);
      console.log('✅ Created by foreign key added');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('[WARNING] Created by foreign key already exists');
      } else {
        console.error('❌ Error adding created by foreign key:', error.message);
      }
    }

    try {
      await sequelize.query(`
        ALTER TABLE \`designations\` 
        ADD CONSTRAINT \`fk_designation_updated_by\` FOREIGN KEY (\`updatedBy\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
      `);
      console.log('✅ Updated by foreign key added');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('[WARNING] Updated by foreign key already exists');
      } else {
        console.error('❌ Error adding updated by foreign key:', error.message);
      }
    }

    // Add designationId column to employees table
    try {
      await sequelize.query(`
        ALTER TABLE \`employees\` 
        ADD COLUMN \`designationId\` int DEFAULT NULL
      `);
      console.log('✅ DesignationId column added to employees');
    } catch (error) {
      if (error.message.includes('Duplicate column')) {
        console.log('[WARNING] DesignationId column already exists in employees');
      } else {
        console.error('❌ Error adding designationId column:', error.message);
      }
    }

    // Add departmentId column to employees table
    try {
      await sequelize.query(`
        ALTER TABLE \`employees\` 
        ADD COLUMN \`departmentId\` int DEFAULT NULL
      `);
      console.log('✅ DepartmentId column added to employees');
    } catch (error) {
      if (error.message.includes('Duplicate column')) {
        console.log('[WARNING] DepartmentId column already exists in employees');
      } else {
        console.error('❌ Error adding departmentId column:', error.message);
      }
    }

    // Add foreign key constraints to employees table
    try {
      await sequelize.query(`
        ALTER TABLE \`employees\` 
        ADD CONSTRAINT \`fk_employee_designation\` FOREIGN KEY (\`designationId\`) REFERENCES \`designations\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
      `);
      console.log('✅ Employee designation foreign key added');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('[WARNING] Employee designation foreign key already exists');
      } else {
        console.error('❌ Error adding employee designation foreign key:', error.message);
      }
    }

    try {
      await sequelize.query(`
        ALTER TABLE \`employees\` 
        ADD CONSTRAINT \`fk_employee_department\` FOREIGN KEY (\`departmentId\`) REFERENCES \`departments\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
      `);
      console.log('✅ Employee department foreign key added');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('[WARNING] Employee department foreign key already exists');
      } else {
        console.error('❌ Error adding employee department foreign key:', error.message);
      }
    }

    // Insert some default designations
    await sequelize.query(`
      INSERT IGNORE INTO \`designations\` (\`title\`, \`description\`, \`level\`, \`departmentId\`, \`requirements\`, \`responsibilities\`, \`isActive\`, \`employeeCount\`, \`createdAt\`, \`updatedAt\`) VALUES
      ('Software Engineer', 'Develops and maintains software applications', 'mid', 1, '["Bachelor degree in Computer Science", "2+ years experience"]', '["Write clean code", "Participate in code reviews", "Debug issues"]', 1, 0, NOW(), NOW()),
      ('Senior Software Engineer', 'Senior level software development role', 'senior', 1, '["Bachelor degree in Computer Science", "5+ years experience"]', '["Lead technical projects", "Mentor junior developers", "Architecture decisions"]', 1, 0, NOW(), NOW()),
      ('HR Manager', 'Manages human resources operations', 'manager', 2, '["Bachelor degree in HR", "3+ years HR experience"]', '["Manage recruitment", "Handle employee relations", "Policy implementation"]', 1, 0, NOW(), NOW()),
      ('Marketing Specialist', 'Handles marketing campaigns and strategies', 'mid', 3, '["Bachelor degree in Marketing", "2+ years experience"]', '["Create marketing campaigns", "Analyze market trends", "Manage social media"]', 1, 0, NOW(), NOW())
    `);
    console.log('✅ Default designations inserted');

    // Update existing employees to link with departments where possible
    await sequelize.query(`
      UPDATE \`employees\` e 
      LEFT JOIN \`departments\` d ON e.department = d.name 
      SET e.departmentId = d.id 
      WHERE d.id IS NOT NULL AND e.departmentId IS NULL
    `);
    console.log('✅ Employee departments linked');

    console.log('✅ Designations table setup completed successfully!');
    
    // Verify the tables were created
    const [results] = await sequelize.query("SHOW TABLES LIKE 'designations'");
    if (results.length > 0) {
      console.log('✅ Designations table verified');
      
      // Check if we have any designations
      const [designations] = await sequelize.query("SELECT COUNT(*) as count FROM designations");
      console.log(`📊 Found ${designations[0].count} designations in the database`);
    }

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the setup
createDesignationsTable();