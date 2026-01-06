import { DataTypes } from 'sequelize';

export const up = async (queryInterface) => {
  await queryInterface.createTable('notifications', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('info', 'success', 'warning', 'error'),
      defaultValue: 'info',
    },
    category: {
      type: DataTypes.ENUM('leave', 'attendance', 'shift', 'system', 'audit'),
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });

  // Add indexes for better performance
  await queryInterface.addIndex('notifications', ['userId']);
  await queryInterface.addIndex('notifications', ['userId', 'isRead']);
  await queryInterface.addIndex('notifications', ['createdAt']);
  await queryInterface.addIndex('notifications', ['category']);
};

export const down = async (queryInterface) => {
  await queryInterface.dropTable('notifications');
};