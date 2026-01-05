import { DataTypes } from 'sequelize';

export const up = async (queryInterface) => {
  // Add new columns for smart holiday management
  await queryInterface.addColumn('holidays', 'recurringDate', {
    type: DataTypes.STRING(5),
    allowNull: true,
    comment: 'MM-DD format for recurring holidays (e.g., "08-15" for Independence Day)'
  });

  await queryInterface.addColumn('holidays', 'type', {
    type: DataTypes.ENUM('ONE_TIME', 'RECURRING'),
    allowNull: false,
    defaultValue: 'ONE_TIME',
    comment: 'Holiday type: ONE_TIME for specific year, RECURRING for every year'
  });

  await queryInterface.addColumn('holidays', 'appliesEveryYear', {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether this holiday applies every year (for recurring holidays)'
  });

  // Rename existing 'type' column to 'category'
  await queryInterface.renameColumn('holidays', 'type', 'category');

  // Remove old recurrence columns
  await queryInterface.removeColumn('holidays', 'isRecurring');
  await queryInterface.removeColumn('holidays', 'recurrencePattern');

  // Make date nullable (since recurring holidays won't have specific dates)
  await queryInterface.changeColumn('holidays', 'date', {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Full date for one-time holidays (YYYY-MM-DD)'
  });

  // Add validation constraint
  await queryInterface.addConstraint('holidays', {
    fields: ['recurringDate'],
    type: 'check',
    name: 'check_recurring_date_format',
    where: {
      recurringDate: {
        [queryInterface.sequelize.Op.regexp]: '^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$'
      }
    }
  });

  // Update existing holidays to use new structure
  // Convert existing holidays to ONE_TIME type
  await queryInterface.sequelize.query(`
    UPDATE holidays 
    SET type = 'ONE_TIME', appliesEveryYear = false 
    WHERE type IS NULL OR type = 'ONE_TIME'
  `);

  // Example: Convert some common holidays to recurring
  const recurringHolidays = [
    { name: 'New Year\'s Day', date: '01-01' },
    { name: 'Independence Day', date: '08-15' },
    { name: 'Gandhi Jayanti', date: '10-02' },
    { name: 'Christmas Day', date: '12-25' }
  ];

  for (const holiday of recurringHolidays) {
    await queryInterface.sequelize.query(`
      UPDATE holidays 
      SET type = 'RECURRING', 
          recurringDate = '${holiday.date}', 
          appliesEveryYear = true,
          date = NULL
      WHERE name LIKE '%${holiday.name}%' 
      AND type = 'ONE_TIME'
    `);
  }
};

export const down = async (queryInterface) => {
  // Remove new columns
  await queryInterface.removeColumn('holidays', 'recurringDate');
  await queryInterface.removeColumn('holidays', 'appliesEveryYear');
  
  // Rename category back to type
  await queryInterface.renameColumn('holidays', 'category', 'type');
  
  // Remove new type column
  await queryInterface.removeColumn('holidays', 'type');
  
  // Add back old columns
  await queryInterface.addColumn('holidays', 'isRecurring', {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  });
  
  await queryInterface.addColumn('holidays', 'recurrencePattern', {
    type: DataTypes.ENUM('yearly', 'monthly', 'weekly'),
    allowNull: true
  });
  
  // Make date non-nullable again
  await queryInterface.changeColumn('holidays', 'date', {
    type: DataTypes.DATEONLY,
    allowNull: false
  });
  
  // Remove constraint
  await queryInterface.removeConstraint('holidays', 'check_recurring_date_format');
};