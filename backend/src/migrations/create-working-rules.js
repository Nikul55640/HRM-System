import { DataTypes } from 'sequelize';

export const up = async (queryInterface) => {
  await queryInterface.createTable('working_rules', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ruleName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Human-readable name for the working rule'
    },
    workingDays: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [1, 2, 3, 4, 5], // Mon-Fri
      comment: 'Array of working days (0=Sunday, 1=Monday, ..., 6=Saturday)'
    },
    weekendDays: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [0, 6], // Sunday & Saturday
      comment: 'Array of weekend days (0=Sunday, 1=Monday, ..., 6=Saturday)'
    },
    effectiveFrom: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Date from which this rule is effective'
    },
    effectiveTo: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Date until which this rule is valid (null = ongoing)'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Whether this is the default working rule'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Description of this working rule'
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  });

  // Add indexes
  await queryInterface.addIndex('working_rules', ['effectiveFrom']);
  await queryInterface.addIndex('working_rules', ['effectiveTo']);
  await queryInterface.addIndex('working_rules', ['isActive']);
  await queryInterface.addIndex('working_rules', ['isDefault']);

  // Insert default working rule
  await queryInterface.bulkInsert('working_rules', [{
    ruleName: 'Standard Monday-Friday',
    workingDays: JSON.stringify([1, 2, 3, 4, 5]),
    weekendDays: JSON.stringify([0, 6]),
    effectiveFrom: '2024-01-01',
    effectiveTo: null,
    isActive: true,
    isDefault: true,
    description: 'Standard working week: Monday to Friday, weekends on Saturday and Sunday',
    createdBy: 1, // Assuming admin user ID is 1
    createdAt: new Date(),
    updatedAt: new Date()
  }]);
};

export const down = async (queryInterface) => {
  await queryInterface.dropTable('working_rules');
};