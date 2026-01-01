import { DataTypes } from 'sequelize';

export const up = async (queryInterface) => {
  // Check if columns exist before adding them
  const tableDescription = await queryInterface.describeTable('employees');
  
  // Add maritalStatus column if it doesn't exist
  if (!tableDescription.maritalStatus) {
    await queryInterface.addColumn('employees', 'maritalStatus', {
      type: DataTypes.ENUM('single', 'married', 'divorced', 'widowed'),
      allowNull: true,
    });
  }
  
  // Add nationality column if it doesn't exist
  if (!tableDescription.nationality) {
    await queryInterface.addColumn('employees', 'nationality', {
      type: DataTypes.STRING(50),
      allowNull: true,
    });
  }
  
  // Add bloodGroup column if it doesn't exist
  if (!tableDescription.bloodGroup) {
    await queryInterface.addColumn('employees', 'bloodGroup', {
      type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
      allowNull: true,
    });
  }
  
  // Add about column if it doesn't exist
  if (!tableDescription.about) {
    await queryInterface.addColumn('employees', 'about', {
      type: DataTypes.TEXT,
      allowNull: true,
    });
  }
  
  // Add country column if it doesn't exist
  if (!tableDescription.country) {
    await queryInterface.addColumn('employees', 'country', {
      type: DataTypes.STRING(50),
      allowNull: true,
    });
  }
};

export const down = async (queryInterface) => {
  // Remove the columns in reverse order
  await queryInterface.removeColumn('employees', 'country');
  await queryInterface.removeColumn('employees', 'about');
  await queryInterface.removeColumn('employees', 'bloodGroup');
  await queryInterface.removeColumn('employees', 'nationality');
  await queryInterface.removeColumn('employees', 'maritalStatus');
};