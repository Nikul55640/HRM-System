import { DataTypes } from 'sequelize';

export default {
  up: async (queryInterface, Sequelize) => {
    try {
      // Make createdBy nullable in leads table
      await queryInterface.changeColumn('leads', 'createdBy', {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'employees',
          key: 'id'
        }
      });
      
      console.log('✅ Successfully updated leads.createdBy to allow NULL values');
    } catch (error) {
      console.error('❌ Error updating leads.createdBy constraint:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Revert createdBy to NOT NULL (only if all records have valid createdBy)
      await queryInterface.changeColumn('leads', 'createdBy', {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'employees',
          key: 'id'
        }
      });
      
      console.log('✅ Successfully reverted leads.createdBy to NOT NULL');
    } catch (error) {
      console.error('❌ Error reverting leads.createdBy constraint:', error);
      throw error;
    }
  }
};